"""
Response Validation Service
Assesses quality of generated responses using LLM
Implements self-observation for the agentic chatbot (Phase 1)
"""
from typing import Dict, List, Optional
from app.services.llm_service import generate_response
from app.utils.prompts import VALIDATION_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def validate_response(
    query: str,
    response: str,
    sources: List[Dict],
    threshold: float = 0.7
) -> Dict:
    """
    Use LLM to assess response quality

    Args:
        query: Original user query
        response: Generated response
        sources: Retrieved document sources
        threshold: Minimum confidence score (0-1)

    Returns:
        {
            "is_valid": bool,
            "confidence": float,
            "issues": List[str],
            "retry_recommended": bool,
            "suggested_adjustment": str
        }
    """
    # Build validation prompt
    sources_text = "\n".join([f"- {s.get('content', '')[:100]}..." for s in sources]) if sources else "No sources used"

    prompt = VALIDATION_PROMPT.format(
        query=query,
        response=response,
        sources=sources_text
    )

    # Get LLM assessment
    try:
        assessment_text = await generate_response(prompt, max_tokens=200, temperature=0.1)

        # Parse structured response
        assessment = parse_validation_response(assessment_text)

        # Log if issues detected
        if not assessment["is_valid"]:
            logger.warning(f"Response validation failed for query: '{query[:50]}...'")
            logger.warning(f"Issues detected: {assessment['issues']}")
        else:
            logger.info(f"Response validated successfully (confidence: {assessment['confidence']:.2f})")

        return assessment

    except Exception as e:
        logger.error(f"Error during validation: {e}")
        # Fallback: assume valid if validation fails
        return {
            "is_valid": True,
            "confidence": 0.5,
            "issues": ["validation_error"],
            "retry_recommended": False,
            "suggested_adjustment": ""
        }


def parse_validation_response(text: str) -> Dict:
    """
    Parse LLM validation response into structured format

    Expected format:
    ANSWERS_QUESTION: yes|no
    IS_GROUNDED: yes|no
    HAS_HALLUCINATION: yes|no
    CONFIDENCE: 0.0-1.0
    RETRY: yes|no
    ADJUSTMENT: suggested fix
    """
    import re

    lines = text.strip().split("\n")
    result = {
        "is_valid": True,
        "confidence": 1.0,
        "issues": [],
        "retry_recommended": False,
        "suggested_adjustment": ""
    }

    for line in lines:
        line = line.strip()

        if line.startswith("ANSWERS_QUESTION:"):
            answers = "yes" in line.lower()
            if not answers:
                result["is_valid"] = False
                result["issues"].append("doesn't answer question")

        elif line.startswith("IS_GROUNDED:"):
            grounded = "yes" in line.lower()
            if not grounded:
                result["is_valid"] = False
                result["issues"].append("not grounded in sources")

        elif line.startswith("HAS_HALLUCINATION:"):
            hallucination = "yes" in line.lower()
            if hallucination:
                result["is_valid"] = False
                result["issues"].append("hallucination detected")

        elif line.startswith("CONFIDENCE:"):
            try:
                confidence_match = re.search(r"[\d.]+", line)
                if confidence_match:
                    confidence = float(confidence_match.group())
                    result["confidence"] = confidence
                    if confidence < 0.7:
                        result["is_valid"] = False
                        result["issues"].append("low confidence")
            except:
                pass

        elif line.startswith("RETRY:"):
            result["retry_recommended"] = "yes" in line.lower()

        elif line.startswith("ADJUSTMENT:"):
            result["suggested_adjustment"] = line.split(":", 1)[1].strip()

    return result


async def retry_with_adjustment(
    query: str,
    adjustment: str,
    original_threshold: float
) -> Dict:
    """
    Retry RAG pipeline with adjusted parameters

    Args:
        query: Original user query
        adjustment: Suggested adjustment from validation
        original_threshold: Original similarity threshold

    Returns:
        New RAG response with adjusted parameters
    """
    from app.services.rag_service import get_rag_response
    from app.core import config

    # Adjust threshold based on suggestion
    new_threshold = original_threshold
    new_top_k = 5

    adjustment_lower = adjustment.lower()

    if "lower threshold" in adjustment_lower or "expand search" in adjustment_lower:
        new_threshold = max(0.15, original_threshold - 0.1)
        logger.info(f"Retry: Lowering threshold from {original_threshold:.2f} to {new_threshold:.2f}")

    elif "more documents" in adjustment_lower or "increase top_k" in adjustment_lower:
        new_top_k = 10
        logger.info(f"Retry: Expanding search from top_k=5 to top_k={new_top_k}")

    elif "rephrase" in adjustment_lower:
        # For now, just lower threshold; future: could use LLM to rephrase query
        new_threshold = max(0.2, original_threshold - 0.05)
        logger.info(f"Retry: Adjusting threshold to {new_threshold:.2f} for rephrased search")

    # Override settings temporarily
    original_threshold_setting = config.settings.RAG_SIMILARITY_THRESHOLD
    original_top_k_setting = config.settings.RAG_TOP_K

    config.settings.RAG_SIMILARITY_THRESHOLD = new_threshold
    config.settings.RAG_TOP_K = new_top_k

    try:
        # Retry RAG
        response = await get_rag_response(query, include_history=False)

        return response
    finally:
        # Restore original settings
        config.settings.RAG_SIMILARITY_THRESHOLD = original_threshold_setting
        config.settings.RAG_TOP_K = original_top_k_setting

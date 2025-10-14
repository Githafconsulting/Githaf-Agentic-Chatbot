"""
Learning Service (Phase 3: Self-Improvement Loop)
Automated feedback analysis and parameter optimization
"""
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from app.services.llm_service import generate_response
from app.core.database import get_supabase_client
from app.utils.logger import get_logger
import json

logger = get_logger(__name__)

# Default thresholds (will be dynamically adjusted)
CURRENT_THRESHOLDS = {
    "similarity_threshold": 0.5,
    "top_k": 5,
    "validation_confidence": 0.7,
    "temperature": 0.7
}


async def analyze_feedback_batch(days: int = 7) -> Dict:
    """
    Analyze recent feedback to identify patterns and issues

    Args:
        days: Number of days to analyze

    Returns:
        Analysis results with recommendations
    """
    logger.info(f"Analyzing feedback from last {days} days")

    client = get_supabase_client()
    cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

    # Get low-rated responses (rating = 0)
    try:
        response = client.table("feedback").select(
            "id, rating, comment, created_at, message_id"
        ).eq("rating", 0).gte("created_at", cutoff_date).execute()

        low_rated_feedback = response.data or []

        if not low_rated_feedback:
            logger.info("No low-rated feedback found in the time period")
            return {
                "total_analyzed": 0,
                "issues_found": [],
                "recommendations": [],
                "confidence": 1.0
            }

        # Get corresponding messages
        message_ids = [f["message_id"] for f in low_rated_feedback]
        messages_response = client.table("messages").select(
            "id, content, context_used"
        ).in_("id", message_ids).execute()

        messages_by_id = {msg["id"]: msg for msg in messages_response.data or []}

        # Get user queries for each response
        queries_and_responses = []
        for feedback in low_rated_feedback:
            message = messages_by_id.get(feedback["message_id"])
            if message:
                # Get the user query (previous message in conversation)
                conversation_response = client.table("messages").select(
                    "conversation_id"
                ).eq("id", feedback["message_id"]).execute()

                if conversation_response.data:
                    conv_id = conversation_response.data[0]["conversation_id"]

                    # Get user message before this assistant message
                    conv_messages = client.table("messages").select(
                        "id, role, content, created_at"
                    ).eq("conversation_id", conv_id).order(
                        "created_at", desc=False
                    ).execute()

                    # Find user query
                    for i, msg in enumerate(conv_messages.data or []):
                        if msg["id"] == feedback["message_id"] and i > 0:
                            user_query = conv_messages.data[i - 1]["content"]
                            queries_and_responses.append({
                                "query": user_query,
                                "response": message["content"],
                                "context_used": message.get("context_used"),
                                "comment": feedback.get("comment")
                            })
                            break

        if not queries_and_responses:
            logger.warning("Could not retrieve query-response pairs")
            return {
                "total_analyzed": len(low_rated_feedback),
                "issues_found": [],
                "recommendations": ["Unable to retrieve query-response pairs"],
                "confidence": 0.3
            }

        # Use LLM to analyze patterns
        analysis_prompt = f"""You are an AI quality analyst. Analyze these low-rated customer service responses and identify patterns:

Total responses analyzed: {len(queries_and_responses)}

Sample responses (first 5):
{json.dumps(queries_and_responses[:5], indent=2)}

Identify:
1. **Common Issues**: What patterns do you see in failed responses?
2. **Root Causes**: Why are these responses failing?
3. **Threshold Adjustments**: Should we adjust similarity_threshold, top_k, or temperature?
4. **Knowledge Gaps**: What topics need more documentation?
5. **Actionable Recommendations**: Specific steps to improve

Respond in this EXACT format:

COMMON_ISSUES:
- Issue 1
- Issue 2

ROOT_CAUSES:
- Cause 1
- Cause 2

THRESHOLD_ADJUSTMENTS:
similarity_threshold: current_value → suggested_value (reasoning)
top_k: current_value → suggested_value (reasoning)
temperature: current_value → suggested_value (reasoning)

KNOWLEDGE_GAPS:
- Topic 1
- Topic 2

RECOMMENDATIONS:
1. Recommendation 1
2. Recommendation 2

CONFIDENCE: 0.0-1.0

Analysis:"""

        llm_analysis = await generate_response(analysis_prompt, max_tokens=800, temperature=0.3)

        # Parse LLM analysis
        parsed = parse_analysis_response(llm_analysis)
        parsed["total_analyzed"] = len(queries_and_responses)

        logger.info(f"Analysis complete: {len(parsed['issues_found'])} issues identified")
        return parsed

    except Exception as e:
        logger.error(f"Error analyzing feedback: {e}")
        return {
            "total_analyzed": 0,
            "issues_found": [],
            "recommendations": [f"Error during analysis: {str(e)}"],
            "confidence": 0.0
        }


def parse_analysis_response(text: str) -> Dict:
    """Parse LLM analysis response into structured format"""
    lines = text.strip().split("\n")

    result = {
        "issues_found": [],
        "root_causes": [],
        "threshold_adjustments": {},
        "knowledge_gaps": [],
        "recommendations": [],
        "confidence": 0.7
    }

    current_section = None

    for line in lines:
        line = line.strip()

        if line.startswith("COMMON_ISSUES:"):
            current_section = "issues"
        elif line.startswith("ROOT_CAUSES:"):
            current_section = "causes"
        elif line.startswith("THRESHOLD_ADJUSTMENTS:"):
            current_section = "thresholds"
        elif line.startswith("KNOWLEDGE_GAPS:"):
            current_section = "gaps"
        elif line.startswith("RECOMMENDATIONS:"):
            current_section = "recommendations"
        elif line.startswith("CONFIDENCE:"):
            try:
                confidence_str = line.split(":", 1)[1].strip()
                result["confidence"] = float(confidence_str)
            except:
                pass
        elif line.startswith("-") or line.startswith("•"):
            item = line[1:].strip()
            if current_section == "issues":
                result["issues_found"].append(item)
            elif current_section == "causes":
                result["root_causes"].append(item)
            elif current_section == "gaps":
                result["knowledge_gaps"].append(item)
        elif line and current_section == "thresholds" and ":" in line:
            # Parse threshold adjustments
            if "→" in line:
                param_name = line.split(":", 1)[0].strip()
                adjustment_text = line.split(":", 1)[1].strip()
                result["threshold_adjustments"][param_name] = adjustment_text
        elif line and current_section == "recommendations" and line[0].isdigit():
            rec = line.split(".", 1)[1].strip() if "." in line else line
            result["recommendations"].append(rec)

    return result


async def apply_threshold_adjustments(adjustments: Dict[str, str]) -> Dict[str, float]:
    """
    Apply recommended threshold adjustments

    Args:
        adjustments: Dictionary of parameter adjustments from analysis

    Returns:
        Updated thresholds
    """
    logger.info("Applying threshold adjustments")

    updated = CURRENT_THRESHOLDS.copy()

    for param, adjustment_text in adjustments.items():
        try:
            # Extract suggested value (e.g., "0.5 → 0.4 (lower threshold)")
            if "→" in adjustment_text:
                parts = adjustment_text.split("→")
                suggested_str = parts[1].split("(")[0].strip()

                try:
                    suggested_value = float(suggested_str)

                    # Safety bounds
                    if param == "similarity_threshold":
                        suggested_value = max(0.3, min(0.8, suggested_value))
                    elif param == "top_k":
                        suggested_value = int(max(3, min(10, suggested_value)))
                    elif param == "temperature":
                        suggested_value = max(0.3, min(1.0, suggested_value))
                    elif param == "validation_confidence":
                        suggested_value = max(0.5, min(0.9, suggested_value))

                    updated[param] = suggested_value
                    logger.info(f"Updated {param}: {CURRENT_THRESHOLDS[param]} → {suggested_value}")

                except ValueError:
                    logger.warning(f"Could not parse suggested value for {param}: {suggested_str}")

        except Exception as e:
            logger.warning(f"Error processing adjustment for {param}: {e}")

    # Update global thresholds
    CURRENT_THRESHOLDS.update(updated)

    return updated


async def get_current_thresholds() -> Dict[str, float]:
    """Get current dynamic thresholds"""
    return CURRENT_THRESHOLDS.copy()


async def weekly_learning_job() -> Dict:
    """
    Weekly scheduled job for self-improvement
    Analyzes feedback and adjusts parameters

    Returns:
        Job execution results
    """
    logger.info("Starting weekly learning job")

    try:
        # Analyze last 7 days of feedback
        analysis = await analyze_feedback_batch(days=7)

        if analysis["total_analyzed"] == 0:
            logger.info("No feedback to analyze, skipping threshold adjustments")
            return {
                "success": True,
                "analysis": analysis,
                "adjustments_applied": {},
                "message": "No feedback to analyze"
            }

        # Apply threshold adjustments if confidence is high enough
        if analysis["confidence"] >= 0.6 and analysis["threshold_adjustments"]:
            updated_thresholds = await apply_threshold_adjustments(
                analysis["threshold_adjustments"]
            )

            logger.info(f"Applied {len(updated_thresholds)} threshold adjustments")

            return {
                "success": True,
                "analysis": analysis,
                "adjustments_applied": updated_thresholds,
                "message": f"Analyzed {analysis['total_analyzed']} responses, applied adjustments"
            }
        else:
            logger.info("Confidence too low or no adjustments suggested, skipping")
            return {
                "success": True,
                "analysis": analysis,
                "adjustments_applied": {},
                "message": "Analysis complete, no adjustments applied (low confidence)"
            }

    except Exception as e:
        logger.error(f"Error in weekly learning job: {e}")
        return {
            "success": False,
            "error": str(e),
            "message": "Learning job failed"
        }


async def get_knowledge_gaps(days: int = 30) -> List[Dict]:
    """
    Identify topics with high query volume but low satisfaction

    Args:
        days: Number of days to analyze

    Returns:
        List of knowledge gaps with metrics
    """
    logger.info(f"Identifying knowledge gaps from last {days} days")

    client = get_supabase_client()
    cutoff_date = (datetime.utcnow() - timedelta(days=days)).isoformat()

    try:
        # Get all conversations with low ratings
        low_rated = client.table("feedback").select(
            "message_id, rating, created_at"
        ).eq("rating", 0).gte("created_at", cutoff_date).execute()

        if not low_rated.data:
            return []

        # Get corresponding queries
        message_ids = [f["message_id"] for f in low_rated.data]
        messages = client.table("messages").select(
            "id, conversation_id, content"
        ).in_("id", message_ids).execute()

        # Extract topics using LLM
        queries = [msg["content"] for msg in messages.data or []]

        if not queries:
            return []

        topic_prompt = f"""Analyze these user queries that received low satisfaction ratings and group them by topic/theme:

Queries (first 10):
{json.dumps(queries[:10], indent=2)}

Total queries: {len(queries)}

Identify the top 5 knowledge gap topics. For each topic, provide:
- Topic name
- Number of related queries (estimate)
- Severity (high/medium/low)
- Suggested action

Respond in this format:

TOPIC 1: [name]
Queries: [count]
Severity: [high/medium/low]
Action: [what content is needed]

TOPIC 2: [name]
...

Topics:"""

        llm_topics = await generate_response(topic_prompt, max_tokens=500, temperature=0.3)

        # Parse topics
        gaps = parse_knowledge_gaps(llm_topics)

        logger.info(f"Identified {len(gaps)} knowledge gaps")
        return gaps

    except Exception as e:
        logger.error(f"Error identifying knowledge gaps: {e}")
        return []


def parse_knowledge_gaps(text: str) -> List[Dict]:
    """Parse LLM knowledge gap response"""
    gaps = []
    lines = text.strip().split("\n")

    current_gap = None

    for line in lines:
        line = line.strip()

        if line.startswith("TOPIC"):
            if current_gap:
                gaps.append(current_gap)

            topic_name = line.split(":", 1)[1].strip() if ":" in line else "Unknown"
            current_gap = {
                "topic": topic_name,
                "query_count": 0,
                "severity": "medium",
                "action": ""
            }
        elif line.startswith("Queries:") and current_gap:
            try:
                count_str = line.split(":", 1)[1].strip()
                current_gap["query_count"] = int(count_str.split()[0])
            except:
                pass
        elif line.startswith("Severity:") and current_gap:
            severity = line.split(":", 1)[1].strip().lower()
            if severity in ["high", "medium", "low"]:
                current_gap["severity"] = severity
        elif line.startswith("Action:") and current_gap:
            current_gap["action"] = line.split(":", 1)[1].strip()

    if current_gap:
        gaps.append(current_gap)

    return gaps

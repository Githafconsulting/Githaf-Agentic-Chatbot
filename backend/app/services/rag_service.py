"""
RAG (Retrieval-Augmented Generation) service
Orchestrates the entire pipeline: embed → search → retrieve → generate
Includes intent classification for conversational queries
"""
from typing import List, Dict, Optional, Any
import random
from app.services.embedding_service import get_embedding
from app.services.vectorstore_service import similarity_search
from app.services.llm_service import generate_response
from app.services.conversation_service import get_conversation_history, format_history_for_llm
from app.services.intent_service import (
    classify_intent_hybrid,
    Intent,
    should_use_rag,
    get_intent_metadata
)
from app.utils.prompts import (
    RAG_SYSTEM_PROMPT,
    FALLBACK_RESPONSE,
    GREETING_RESPONSES,
    FAREWELL_RESPONSES,
    GRATITUDE_RESPONSES,
    HELP_RESPONSE,
    CHIT_CHAT_RESPONSES,
    UNCLEAR_QUERY_RESPONSE,
    OUT_OF_SCOPE_RESPONSE,
    CONVERSATIONAL_WITH_CONTEXT_PROMPT,
    CLARIFICATION_RESPONSES
)
from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


def preprocess_query(query: str) -> str:
    """
    Preprocess query to handle common issues:
    1. Normalize company name variations (Githaf → Githaf Consulting)
    2. Fix common misspellings

    Args:
        query: Original user query

    Returns:
        Preprocessed query
    """
    if not query or not query.strip():
        return query

    processed = query

    # 1. Normalize company name variations
    # Replace standalone "Githaf" with "Githaf Consulting" (but not if already "Githaf Consulting")
    import re
    # Match "Githaf" but not "Githaf Consulting" (case insensitive)
    processed = re.sub(r'\b(Githaf)(?!\s+Consulting)\b', r'Githaf Consulting', processed, flags=re.IGNORECASE)

    # 2. Fix common misspellings (case-insensitive replacements)
    misspelling_map = {
        # Contact-related
        r'\b(emial|emal|e-mail)\b': 'email',
        r'\b(contct|contac|contat)\b': 'contact',
        r'\b(locaton|loction|locaion)\b': 'location',
        r'\b(addres|adress)\b': 'address',
        r'\b(phne|phn)\b': 'phone',

        # Services-related
        r'\b(servce|servic|servces)\b': 'services',
        r'\b(consultin|consultng|consutling)\b': 'consulting',
        r'\b(bussiness|busines|buisness)\b': 'business',

        # Common words
        r'\b(queston|questin|qustion)\b': 'question',
        r'\b(informaton|informtion|infomation)\b': 'information',
        r'\b(avaliable|availble|avalable)\b': 'available',
        r'\b(recieve|recive)\b': 'receive',
        r'\b(responce|reponse)\b': 'response',
    }

    for pattern, replacement in misspelling_map.items():
        processed = re.sub(pattern, replacement, processed, flags=re.IGNORECASE)

    # Log if query was modified
    if processed != query:
        logger.info(f"Query preprocessing: '{query}' -> '{processed}'")

    return processed


async def get_conversational_response(
    intent: Intent,
    query: str,
    session_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate response for conversational intents (non-RAG)
    Uses conversation context for better continuity

    Args:
        intent: Detected user intent
        query: Original user query
        session_id: Optional session ID for conversation history

    Returns:
        Dict containing response and metadata
    """
    logger.info(f"Handling conversational intent: {intent.value}")

    response_text = ""

    # Handle clear template-based intents
    if intent == Intent.GREETING:
        response_text = random.choice(GREETING_RESPONSES)

    elif intent == Intent.FAREWELL:
        response_text = random.choice(FAREWELL_RESPONSES)

    elif intent == Intent.GRATITUDE:
        response_text = random.choice(GRATITUDE_RESPONSES)

    elif intent == Intent.HELP:
        response_text = HELP_RESPONSE

    elif intent == Intent.OUT_OF_SCOPE:
        response_text = OUT_OF_SCOPE_RESPONSE

    elif intent == Intent.UNCLEAR:
        # Vague query - provide context-specific clarification
        query_lower = query.lower().strip()

        # Map query to clarification category
        clarification_key = "default"
        for keyword in ["email"]:
            if keyword in query_lower:
                clarification_key = "email"
                break
        for keyword in ["pricing", "price", "cost", "payment", "fee"]:
            if keyword in query_lower:
                clarification_key = "pricing"
                break
        for keyword in ["contact", "phone", "address", "location"]:
            if keyword in query_lower:
                clarification_key = "contact"
                break
        for keyword in ["services", "service"]:
            if keyword in query_lower:
                clarification_key = "services"
                break
        for keyword in ["hours", "schedule", "availability"]:
            if keyword in query_lower:
                clarification_key = "hours"
                break

        # Select appropriate clarification response
        response_text = random.choice(CLARIFICATION_RESPONSES.get(clarification_key, CLARIFICATION_RESPONSES["default"]))

    elif intent == Intent.CHIT_CHAT:
        # For chit-chat, check if we need context-aware response
        query_lower = query.lower().strip()

        # Specific pattern responses
        if "how are you" in query_lower or "how r u" in query_lower:
            response_text = random.choice(CHIT_CHAT_RESPONSES["how_are_you"])
        elif "your name" in query_lower or "who are you" in query_lower or "what are you" in query_lower:
            response_text = random.choice(CHIT_CHAT_RESPONSES["name"])
        elif "bot" in query_lower or "robot" in query_lower or "ai" in query_lower:
            response_text = random.choice(CHIT_CHAT_RESPONSES["bot"])
        # Context-dependent responses (yes, okay, sure, etc.)
        elif session_id and query_lower in ["yes", "okay", "ok", "sure", "yep", "yeah", "yup"]:
            # Get conversation history for context
            history = await get_conversation_history(session_id, limit=3)
            if history and len(history) > 0:
                history_text = await format_history_for_llm(history)
                # Use LLM with context
                prompt = CONVERSATIONAL_WITH_CONTEXT_PROMPT.format(
                    query=query,
                    history=history_text
                )
                try:
                    response_text = await generate_response(prompt, max_tokens=100, temperature=0.7)
                except Exception as e:
                    logger.error(f"Error generating context-aware response: {e}")
                    response_text = random.choice(CHIT_CHAT_RESPONSES["default"])
            else:
                response_text = random.choice(CHIT_CHAT_RESPONSES["default"])
        else:
            # Generic chit-chat default
            response_text = random.choice(CHIT_CHAT_RESPONSES["default"])

    else:
        response_text = UNCLEAR_QUERY_RESPONSE

    return {
        "response": response_text,
        "sources": [],
        "context_found": False,
        "intent": intent.value,
        "conversational": True
    }


async def get_rag_response(
    query: str,
    session_id: Optional[str] = None,
    include_history: bool = True,
    max_retries: int = 2  # NEW: Phase 1 - Allow retries for validation
) -> Dict[str, Any]:
    """
    Get response using RAG pipeline with intent classification and validation (Phase 1: Observation Layer)

    Args:
        query: User query
        session_id: Optional session ID for conversation context
        include_history: Whether to include conversation history
        max_retries: Maximum number of retries if validation fails (default: 2)

    Returns:
        Dict containing response, sources, and validation metadata
    """
    try:
        logger.info(f"Processing query: {query[:100]}...")

        # 0. Preprocess query (fix misspellings, normalize company name)
        processed_query = preprocess_query(query)

        # 1. Classify intent using hybrid approach (patterns + LLM fallback)
        intent, confidence = await classify_intent_hybrid(processed_query)
        metadata = get_intent_metadata(intent, query)
        logger.info(f"Detected intent: {intent.value} (confidence: {confidence:.2f}) | Metadata: {metadata}")

        # 2. Handle conversational intents (fast path - no RAG needed)
        if not should_use_rag(intent):
            logger.info(f"Using conversational response for intent: {intent.value}")
            return await get_conversational_response(intent, processed_query, session_id)

        # 3. Check if planning needed (Phase 2: Planning Layer)
        from app.services.planning_service import needs_planning, create_plan, execute_plan

        if await needs_planning(processed_query, intent):
            logger.info("Complex query detected, using planning approach")

            # Create action plan
            plan = await create_plan(
                query=processed_query,
                intent=intent,
                context={"session_id": session_id}
            )

            # Execute plan
            plan_result = await execute_plan(plan, session_id)

            # Validate final response
            from app.services.validation_service import validate_response

            validation = await validate_response(
                query=query,
                response=plan_result["response"],
                sources=[]  # Sources embedded in plan results
            )

            return {
                "response": plan_result["response"],
                "sources": [],
                "context_found": plan_result["success"],
                "intent": intent.value,
                "conversational": False,
                "planned": True,  # NEW: Indicate planned response
                "plan": plan.dict(),
                "validation": {
                    "confidence": validation["confidence"],
                    "retry_count": 0,
                    "issues": validation["issues"],
                    "is_valid": validation["is_valid"]
                }
            }

        # 4. Continue with RAG pipeline for simple questions
        logger.info("Using RAG pipeline for question/unknown intent")

        # 5. Embed the processed query
        query_embedding = await get_embedding(processed_query)
        logger.debug("Query embedded successfully")

        # 6. Adjust threshold for factual queries (hybrid search)
        # Keywords that indicate queries needing exact info (email, phone, etc.)
        query_lower = processed_query.lower()
        factual_keywords = ["email", "phone", "contact", "address", "number", "reach", "call", "location", "where", "office"]
        is_factual_query = any(keyword in query_lower for keyword in factual_keywords)

        # Use lower threshold for factual queries to ensure we find contact info
        # Use even lower threshold for email/location queries (contact info chunks may have lower similarity)
        if "email" in query_lower or "location" in query_lower or "where" in query_lower or "address" in query_lower:
            threshold = 0.20
        elif is_factual_query:
            threshold = 0.25
        else:
            threshold = settings.RAG_SIMILARITY_THRESHOLD

        if is_factual_query:
            logger.info(f"Detected factual query with keywords: {[k for k in factual_keywords if k in query_lower]}")
            logger.info(f"Using relaxed threshold: {threshold} (default: {settings.RAG_SIMILARITY_THRESHOLD})")

        # 7. Similarity search (retrieve more candidates for factual queries to allow re-ranking)
        top_k = settings.RAG_TOP_K * 2 if is_factual_query else settings.RAG_TOP_K
        logger.info(f"Calling similarity_search with top_k={top_k}, threshold={threshold}")
        relevant_docs = await similarity_search(
            query_embedding,
            top_k=top_k,
            threshold=threshold
        )
        logger.info(f"Similarity search returned {len(relevant_docs) if relevant_docs else 0} documents")

        # 8. Re-rank results for factual queries (boost documents with actual facts)
        if is_factual_query and relevant_docs:
            # Check query for specific keywords
            needs_email = "email" in query_lower
            needs_phone = "phone" in query_lower or "call" in query_lower or "number" in query_lower
            needs_location = "location" in query_lower or "where" in query_lower or "address" in query_lower or "office" in query_lower

            for doc in relevant_docs:
                content = doc.get("content", "").lower()

                # Boost score if doc contains actual email addresses (@ symbol)
                if needs_email and "@" in content:
                    doc["similarity"] = min(1.0, doc["similarity"] * 1.5)  # 50% boost
                    logger.debug(f"Boosted doc with email addresses: {doc['similarity']:.4f}")

                # Boost score if doc contains phone numbers (+ or digits)
                if needs_phone and ("+" in content or any(char.isdigit() for char in content)):
                    doc["similarity"] = min(1.0, doc["similarity"] * 1.3)  # 30% boost
                    logger.debug(f"Boosted doc with phone numbers: {doc['similarity']:.4f}")

                # Boost score if doc contains addresses (street, city, country indicators)
                if needs_location and any(word in content for word in ["street", "london", "uk", "uae", "city", "mailing address", "office:"]):
                    doc["similarity"] = min(1.0, doc["similarity"] * 1.6)  # 60% boost
                    logger.debug(f"Boosted doc with location info: {doc['similarity']:.4f}")

            # Re-sort by boosted similarity scores
            relevant_docs = sorted(relevant_docs, key=lambda x: x.get("similarity", 0), reverse=True)

            # Keep only top K after re-ranking
            relevant_docs = relevant_docs[:settings.RAG_TOP_K]
            logger.info(f"Re-ranked results for factual query, keeping top {len(relevant_docs)}")

        # 9. Check if we have relevant context
        if not relevant_docs or len(relevant_docs) == 0:
            logger.warning(f"No relevant documents found for query: '{query[:50]}...'")
            logger.warning(f"Threshold: {settings.RAG_SIMILARITY_THRESHOLD}, Top-K: {settings.RAG_TOP_K}")
            return {
                "response": FALLBACK_RESPONSE,
                "sources": [],
                "context_found": False,
                "intent": intent.value
            }

        # 10. Build context from retrieved documents
        context_parts = []
        sources = []

        for i, doc in enumerate(relevant_docs, 1):
            content = doc.get("content", "")
            similarity = doc.get("similarity", 0)
            doc_id = doc.get("id", "")

            context_parts.append(f"[Source {i}] {content}")

            sources.append({
                "id": doc_id,
                "content": content[:200] + "..." if len(content) > 200 else content,
                "similarity": similarity
            })

        context = "\n\n".join(context_parts)

        # 11. Get conversation history (if available)
        history_text = "No previous conversation."

        if include_history and session_id:
            history = await get_conversation_history(session_id, limit=5)
            history_text = await format_history_for_llm(history)

        # 12. Build prompt (use original query so user sees their question)
        prompt = RAG_SYSTEM_PROMPT.format(
            context=context,
            history=history_text,
            query=query  # Use original query in prompt for natural response
        )

        # 13. Generate response using LLM
        response_text = await generate_response(prompt)

        logger.info("RAG response generated successfully")

        # 14. VALIDATE RESPONSE (Phase 1: Observation Layer)
        from app.services.validation_service import validate_response, retry_with_adjustment

        validation = await validate_response(
            query=query,
            response=response_text,
            sources=sources
        )

        # 15. RETRY IF NEEDED (Phase 1: Observation Layer)
        retry_count = 0
        while not validation["is_valid"] and validation["retry_recommended"] and retry_count < max_retries:
            retry_count += 1
            logger.warning(f"Response validation failed, retry {retry_count}/{max_retries}")
            logger.warning(f"Issues: {validation['issues']}")
            logger.warning(f"Adjustment: {validation['suggested_adjustment']}")

            # Retry with adjusted parameters
            retry_response = await retry_with_adjustment(
                query=query,
                adjustment=validation["suggested_adjustment"],
                original_threshold=threshold
            )

            # Update response and sources from retry
            response_text = retry_response.get("response", response_text)
            sources = retry_response.get("sources", sources)

            # Validate retry
            validation = await validate_response(
                query=query,
                response=response_text,
                sources=sources
            )

        # Log final validation status
        if validation["is_valid"]:
            logger.info(f"Final response validated (confidence: {validation['confidence']:.2f}, retries: {retry_count})")
        else:
            logger.warning(f"Final response still has issues after {retry_count} retries: {validation['issues']}")

        # 16. Return with validation metadata
        return {
            "response": response_text,
            "sources": sources,
            "context_found": True,
            "intent": intent.value,
            "conversational": False,
            "validation": {  # NEW: Add validation metadata (Phase 1)
                "confidence": validation["confidence"],
                "retry_count": retry_count,
                "issues": validation["issues"],
                "is_valid": validation["is_valid"]
            }
        }

    except Exception as e:
        logger.error(f"Error in RAG pipeline: {e}")
        return {
            "response": FALLBACK_RESPONSE,
            "sources": [],
            "context_found": False,
            "error": str(e)
        }


async def evaluate_query_quality(query: str) -> Dict[str, Any]:
    """
    Evaluate if a query is clear and answerable

    Args:
        query: User query

    Returns:
        Dict with quality metrics
    """
    # Simple heuristics for query quality
    is_too_short = len(query.split()) < 3
    is_too_long = len(query.split()) > 100
    has_question_mark = "?" in query

    quality_score = 1.0

    if is_too_short:
        quality_score -= 0.3

    if is_too_long:
        quality_score -= 0.2

    if not has_question_mark and len(query.split()) < 5:
        quality_score -= 0.1

    return {
        "score": max(0, quality_score),
        "is_clear": quality_score > 0.5,
        "suggestions": []
    }

"""
Analytics service for metrics calculation
"""
from typing import Dict, List, Any
from datetime import datetime, timedelta
from app.core.database import get_supabase_client
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def get_conversation_metrics() -> Dict[str, Any]:
    """
    Get conversation-related metrics

    Returns:
        Dict: Conversation metrics
    """
    try:
        client = get_supabase_client()

        # Total conversations
        total_conv_response = client.table("conversations").select("id", count="exact").execute()
        total_conversations = total_conv_response.count if total_conv_response.count else 0

        # Total messages
        total_msg_response = client.table("messages").select("id", count="exact").execute()
        total_messages = total_msg_response.count if total_msg_response.count else 0

        # Average messages per conversation
        avg_messages = total_messages / total_conversations if total_conversations > 0 else 0

        # Conversations today
        today = datetime.utcnow().date().isoformat()
        today_conv_response = client.table("conversations").select(
            "id", count="exact"
        ).gte("created_at", today).execute()
        conversations_today = today_conv_response.count if today_conv_response.count else 0

        return {
            "total_conversations": total_conversations,
            "total_messages": total_messages,
            "avg_messages_per_conversation": round(avg_messages, 2),
            "conversations_today": conversations_today
        }

    except Exception as e:
        logger.error(f"Error getting conversation metrics: {e}")
        return {
            "total_conversations": 0,
            "total_messages": 0,
            "avg_messages_per_conversation": 0,
            "conversations_today": 0
        }


async def get_satisfaction_metrics() -> Dict[str, Any]:
    """
    Get user satisfaction metrics

    Returns:
        Dict: Satisfaction metrics
    """
    try:
        client = get_supabase_client()

        # Total feedback
        total_feedback_response = client.table("feedback").select("*").execute()
        feedback_list = total_feedback_response.data if total_feedback_response.data else []

        total_feedback = len(feedback_list)

        if total_feedback == 0:
            return {
                "avg_rating": 0,
                "total_feedback": 0,
                "positive_feedback": 0,
                "negative_feedback": 0,
                "satisfaction_rate": 0
            }

        # Calculate metrics
        # Rating is 0 (thumbs down) or 1 (thumbs up) in our system
        ratings = [f["rating"] for f in feedback_list]

        # Calculate average satisfaction (0-1 scale)
        avg_satisfaction = sum(ratings) / len(ratings)

        # Count positive (1) and negative (0) feedback
        positive_feedback = len([r for r in ratings if r == 1])
        negative_feedback = len([r for r in ratings if r == 0])

        # Response rate: percentage of messages that received feedback
        total_messages_response = client.table("messages").select("id", count="exact").eq("role", "assistant").execute()
        total_assistant_messages = total_messages_response.count if total_messages_response.count else 0
        response_rate = (total_feedback / total_assistant_messages) if total_assistant_messages > 0 else 0

        return {
            "avg_satisfaction": round(avg_satisfaction, 2),
            "response_rate": round(response_rate, 2),
            "total_feedback": total_feedback,
            "positive_feedback": positive_feedback,
            "negative_feedback": negative_feedback
        }

    except Exception as e:
        logger.error(f"Error getting satisfaction metrics: {e}")
        return {
            "avg_satisfaction": 0,
            "response_rate": 0,
            "total_feedback": 0,
            "positive_feedback": 0,
            "negative_feedback": 0
        }


async def get_trending_queries(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get trending/common queries

    Args:
        limit: Number of trending queries to return

    Returns:
        List[Dict]: Trending queries
    """
    try:
        client = get_supabase_client()

        # Get all user messages from last 30 days
        thirty_days_ago = (datetime.utcnow() - timedelta(days=30)).isoformat()

        response = client.table("messages").select("content").eq(
            "role", "user"
        ).gte("created_at", thirty_days_ago).execute()

        messages = response.data if response.data else []

        # Count query frequency (simple approach)
        query_counts = {}
        for msg in messages:
            content = msg.get("content", "").lower().strip()
            if len(content) > 10:  # Filter out very short queries
                query_counts[content] = query_counts.get(content, 0) + 1

        # Sort by frequency
        sorted_queries = sorted(query_counts.items(), key=lambda x: x[1], reverse=True)

        # Format results
        trending = []
        for query, count in sorted_queries[:limit]:
            trending.append({
                "query": query,
                "count": count,
                "avg_rating": None  # TODO: Join with feedback if needed
            })

        return trending

    except Exception as e:
        logger.error(f"Error getting trending queries: {e}")
        return []


async def get_knowledge_base_metrics() -> Dict[str, Any]:
    """
    Get knowledge base metrics

    Returns:
        Dict: Knowledge base metrics
    """
    try:
        client = get_supabase_client()

        # Total documents
        docs_response = client.table("documents").select("id", count="exact").execute()
        total_documents = docs_response.count if docs_response.count else 0

        # Total chunks/embeddings
        embeddings_response = client.table("embeddings").select("id", count="exact").execute()
        total_chunks = embeddings_response.count if embeddings_response.count else 0

        # Documents added this month
        this_month = datetime.utcnow().replace(day=1).isoformat()
        month_docs_response = client.table("documents").select(
            "id", count="exact"
        ).gte("created_at", this_month).execute()
        documents_added_this_month = month_docs_response.count if month_docs_response.count else 0

        return {
            "total_documents": total_documents,
            "total_chunks": total_chunks,
            "documents_added_this_month": documents_added_this_month
        }

    except Exception as e:
        logger.error(f"Error getting knowledge base metrics: {e}")
        return {
            "total_documents": 0,
            "total_chunks": 0,
            "documents_added_this_month": 0
        }


async def get_flagged_queries(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Get all feedback (both positive and negative) with queries and responses

    Args:
        limit: Maximum number of feedback entries

    Returns:
        List[Dict]: Feedback entries with user queries and bot responses
    """
    try:
        client = get_supabase_client()

        # Get ALL feedback (both thumbs up and thumbs down)
        # No rating filter - frontend will handle filtering
        feedback_response = client.table("feedback").select(
            "*, messages(*)"
        ).order("created_at", desc=True).limit(limit).execute()

        flagged = []

        if feedback_response.data:
            for item in feedback_response.data:
                # Get the rated message (this is the assistant's response)
                rated_message = item.get("messages", {})
                if not rated_message:
                    continue

                conversation_id = rated_message.get("conversation_id")
                message_id = str(item.get("message_id", ""))

                # The rated message is the assistant's response
                bot_response = rated_message.get("content", "")

                # Find the user query (the message before this assistant response)
                user_query = ""
                if conversation_id:
                    # Get messages from this conversation before the rated message
                    conv_messages_response = client.table("messages").select(
                        "content, role, created_at"
                    ).eq("conversation_id", conversation_id).lt(
                        "created_at", rated_message.get("created_at")
                    ).order("created_at", desc=True).limit(1).execute()

                    if conv_messages_response.data and len(conv_messages_response.data) > 0:
                        last_message = conv_messages_response.data[0]
                        if last_message.get("role") == "user":
                            user_query = last_message.get("content", "")

                flagged.append({
                    "message_id": message_id,
                    "conversation_id": str(conversation_id) if conversation_id else None,
                    "query": user_query,  # User's question
                    "response": bot_response,  # Bot's answer
                    "rating": item.get("rating"),  # 0 = thumbs down, 1 = thumbs up
                    "comment": item.get("comment"),  # Optional user comment
                    "created_at": item.get("created_at"),
                    "reason": "User feedback"
                })

        logger.info(f"Retrieved {len(flagged)} feedback entries")
        return flagged

    except Exception as e:
        logger.error(f"Error getting flagged queries: {e}")
        return []


async def get_analytics_overview() -> Dict[str, Any]:
    """
    Get complete analytics overview

    Returns:
        Dict: Complete analytics data
    """
    try:
        conversation_metrics = await get_conversation_metrics()
        satisfaction_metrics = await get_satisfaction_metrics()
        trending_queries = await get_trending_queries(limit=10)
        knowledge_base_metrics = await get_knowledge_base_metrics()

        return {
            "conversation_metrics": conversation_metrics,
            "satisfaction_metrics": satisfaction_metrics,
            "trending_queries": trending_queries,
            "knowledge_base_metrics": knowledge_base_metrics,
            "last_updated": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Error getting analytics overview: {e}")
        raise


async def get_daily_stats(start_date: str, end_date: str) -> List[Dict[str, Any]]:
    """
    Get daily conversation statistics for a date range

    Args:
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)

    Returns:
        List[Dict]: Daily statistics
    """
    try:
        # Validate dates
        start_dt = datetime.fromisoformat(start_date)
        end_dt = datetime.fromisoformat(end_date)

        if start_dt > end_dt:
            raise ValueError("Start date must be before or equal to end date")

        client = get_supabase_client()

        # Get conversations in date range
        conversations_response = client.table("conversations").select(
            "id, created_at"
        ).gte("created_at", start_date).lte("created_at", f"{end_date}T23:59:59").execute()

        conversations = conversations_response.data if conversations_response.data else []

        # Get messages in date range
        messages_response = client.table("messages").select(
            "id, created_at, conversation_id"
        ).gte("created_at", start_date).lte("created_at", f"{end_date}T23:59:59").execute()

        messages = messages_response.data if messages_response.data else []

        # Get feedback in date range
        feedback_response = client.table("feedback").select(
            "rating, created_at"
        ).gte("created_at", start_date).lte("created_at", f"{end_date}T23:59:59").execute()

        feedback_list = feedback_response.data if feedback_response.data else []

        # Group by date
        daily_data = {}

        # Initialize all dates in range with zeros
        current_date = start_dt
        while current_date <= end_dt:
            date_str = current_date.strftime("%Y-%m-%d")
            daily_data[date_str] = {
                "date": date_str,
                "conversations": 0,
                "messages": 0,
                "avg_satisfaction": 0,
                "ratings": []
            }
            current_date += timedelta(days=1)

        # Count conversations by date
        for conv in conversations:
            date_str = conv["created_at"][:10]
            if date_str in daily_data:
                daily_data[date_str]["conversations"] += 1

        # Count messages by date
        for msg in messages:
            date_str = msg["created_at"][:10]
            if date_str in daily_data:
                daily_data[date_str]["messages"] += 1

        # Calculate satisfaction by date
        for fb in feedback_list:
            date_str = fb["created_at"][:10]
            if date_str in daily_data:
                daily_data[date_str]["ratings"].append(fb["rating"])

        # Calculate average satisfaction
        for date_str, data in daily_data.items():
            if data["ratings"]:
                data["avg_satisfaction"] = round(sum(data["ratings"]) / len(data["ratings"]), 2)
            del data["ratings"]  # Remove temporary ratings list

        # Convert to sorted list
        daily_stats = sorted(daily_data.values(), key=lambda x: x["date"])

        logger.info(f"Generated daily stats for {len(daily_stats)} days")
        return daily_stats

    except ValueError as e:
        logger.error(f"Date validation error: {e}")
        raise
    except Exception as e:
        logger.error(f"Error getting daily stats: {e}")
        return []


async def get_country_stats(start_date: str = None, end_date: str = None) -> List[Dict[str, Any]]:
    """
    Get visitor country statistics with real geo-location data

    Args:
        start_date: Optional start date (YYYY-MM-DD)
        end_date: Optional end date (YYYY-MM-DD)

    Returns:
        List[Dict]: Country statistics with visitor counts and percentages
    """
    try:
        client = get_supabase_client()

        # Build query based on date range
        query = client.table("conversations").select("country_code, country_name")

        if start_date:
            query = query.gte("created_at", start_date)
        if end_date:
            query = query.lte("created_at", f"{end_date}T23:59:59")

        response = query.execute()
        conversations = response.data if response.data else []

        if not conversations:
            return []

        # Count conversations by country
        country_counts = {}
        total_visitors = len(conversations)

        for conv in conversations:
            country_code = conv.get("country_code") or "UNKNOWN"
            country_name = conv.get("country_name") or "Unknown"

            key = f"{country_code}|{country_name}"
            country_counts[key] = country_counts.get(key, 0) + 1

        # Build result list with percentages
        country_stats = []
        for key, count in country_counts.items():
            country_code, country_name = key.split("|")
            percentage = (count / total_visitors * 100) if total_visitors > 0 else 0

            country_stats.append({
                "country_code": country_code,
                "country_name": country_name,
                "visitors": count,
                "percentage": round(percentage, 1)
            })

        # Sort by visitor count (descending)
        country_stats.sort(key=lambda x: x["visitors"], reverse=True)

        logger.info(f"Retrieved country stats: {len(country_stats)} countries, {total_visitors} total visitors")
        return country_stats

    except Exception as e:
        logger.error(f"Error getting country stats: {e}")
        return []

# Detailed Process Flow - User Query to Response

**Agentic Chatbot System v2.0**

This document provides a comprehensive step-by-step breakdown of the entire pipeline from when a user enters a query until they receive a response, clearly indicating:
- 🤖 **LLM INVOCATIONS** (Groq API calls - expensive, slow)
- ⚙️ **SYSTEM WORK** (Hard-coded logic, algorithms - fast, cheap)
- 🔀 **DECISION POINTS** (Routing logic)

---

## Overview: 7-Step Agentic Framework

```
USER QUERY → PERCEIVE → STORE → REASON → PLAN → EXECUTE → OBSERVE → SELF-IMPROVE → RESPONSE
```

---

## Detailed Step-by-Step Flow

### **ENTRY POINT: POST /api/v1/chat/**

**File:** `app/api/routes/chat.py:19`

---

### **Step 0: Request Preprocessing** ⚙️ **SYSTEM WORK**

**Location:** `chat.py:26-57`

```python
# 0a. Generate session ID if not provided
⚙️ SYSTEM: session_id = chat_request.session_id or str(uuid.uuid4())

# 0b. Extract client IP address
⚙️ SYSTEM: client_ip = request.client.host

# 0c. Anonymize IP for GDPR compliance (hard-coded algorithm)
⚙️ SYSTEM: ip_address = anonymize_ip(client_ip)
# Example: "192.168.1.100" → "192.168.1.0" (last octet zeroed)

# 0d. Geo-locate IP to country (GeoIP2 database lookup - no LLM)
⚙️ SYSTEM: geo_data = await get_country_from_ip(client_ip)
⚙️ SYSTEM: country_code = geo_data.get("country_code")  # "US", "GB", etc.

# 0e. Get or create conversation record in database
⚙️ SYSTEM: conversation = await get_or_create_conversation(
    session_id, ip_address, country_code, country_name
)
# SQL: INSERT or SELECT from conversations table

# 0f. Save user message to database
⚙️ SYSTEM: await save_message(conversation_id, role="user", content=query)
# SQL: INSERT INTO messages (conversation_id, role, content, created_at)
```

**Summary:**
- All database operations (SQL queries)
- UUID generation
- IP anonymization (algorithmic)
- GeoIP lookup (database lookup, not LLM)

---

### **Step 1: Query Preprocessing** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:37-89 (preprocess_query function)`

```python
# 1a. Normalize company name variations (regex pattern matching)
⚙️ SYSTEM: "Githaf" → "Githaf Consulting"
# Regex: r'\b(Githaf)(?!\s+Consulting)\b' → r'Githaf Consulting'

# 1b. Fix common misspellings (dictionary-based replacements)
⚙️ SYSTEM: Misspelling map with 20+ patterns:
{
    r'\b(emial|emal|e-mail)\b': 'email',
    r'\b(contct|contac|contat)\b': 'contact',
    r'\b(servce|servic|servces)\b': 'services',
    # ... 17+ more patterns
}

# Example: "What is your emial addres?" → "What is your email address?"

⚙️ SYSTEM: Log if query was modified
```

**Output:** `processed_query` (cleaned query string)

**Hard-coded Logic:**
- 20+ regex patterns for misspellings
- Company name normalization rules
- No LLM involved

---

### **Step 2: Intent Classification (Hybrid Approach)** 🔀 **DECISION POINT**

**Location:** `rag_service.py:228-231`

```python
intent, confidence = await classify_intent_hybrid(processed_query)
```

**This step uses BOTH system work AND LLM (when needed):**

#### **Step 2a: Fast Pattern Matching (PRIMARY)** ⚙️ **SYSTEM WORK**

**Location:** `intent_service.py:154-289 (classify_intent_patterns)`

```python
# Check greeting patterns (100+ variations across 5 languages)
⚙️ SYSTEM: greeting_patterns = {
    "hello", "hi", "hey", "good morning", "good afternoon",
    "bonjour", "hallo", "hola", "مرحبا", ...  # 100+ patterns
}
if query_lower in greeting_patterns:
    return (Intent.GREETING, 1.0)  # 100% confidence

# Check farewell patterns (50+ variations)
⚙️ SYSTEM: farewell_patterns = {
    "bye", "goodbye", "see you", "au revoir", "adiós", "وداعا", ...
}
if query_lower in farewell_patterns:
    return (Intent.FAREWELL, 1.0)

# Check gratitude patterns (30+ variations)
⚙️ SYSTEM: gratitude_patterns = {
    "thanks", "thank you", "merci", "danke", "gracias", "شكرا", ...
}
if any(pattern in query_lower for pattern in gratitude_patterns):
    return (Intent.GRATITUDE, 0.95)

# Check help patterns (hard-coded keyword matching)
⚙️ SYSTEM: help_keywords = ["help", "how to use", "what can you do", "guide"]
if any(keyword in query_lower for keyword in help_keywords):
    return (Intent.HELP, 0.9)

# Check chit-chat patterns (50+ variations)
⚙️ SYSTEM: chit_chat_patterns = {
    "how are you", "what's up", "are you there", "can i ask", ...
}
if any(pattern in query_lower for pattern in chit_chat_patterns):
    return (Intent.CHIT_CHAT, 0.85)

# Check out-of-scope patterns (20+ keywords)
⚙️ SYSTEM: out_of_scope_keywords = [
    "weather", "news", "sports", "politics", "celebrity", ...
]
if any(keyword in query_lower for keyword in out_of_scope_keywords):
    return (Intent.OUT_OF_SCOPE, 0.8)

# Check question indicators
⚙️ SYSTEM: question_indicators = ["what", "how", "when", "where", "who", "why", "?"]
if any(indicator in query_lower for indicator in question_indicators):
    return (Intent.QUESTION, 0.7)  # Medium confidence

# No pattern matched
return (Intent.UNKNOWN, 0.0)  # Low confidence - triggers LLM fallback
```

**Performance:** ~5ms for pattern matching

---

#### **Step 2b: LLM Fallback (IF pattern confidence < 0.8)** 🤖 **LLM INVOCATION #1**

**Location:** `intent_service.py:292-350 (classify_intent_llm)`

**Trigger:** If pattern matching returns confidence < 0.8 OR Intent.UNKNOWN

```python
# Build LLM prompt for intent classification
🤖 LLM CALL #1: Intent Classification (Groq API)

Prompt:
"""
You are an intent classification system for Githaf Consulting chatbot.
Classify the user's query into one of these categories:
- GREETING: Greetings and salutations
- FAREWELL: Goodbyes
- GRATITUDE: Thank you messages
- HELP: Requests for help or guidance
- CHIT_CHAT: Casual conversation
- OUT_OF_SCOPE: Off-topic questions (weather, politics, etc.)
- QUESTION: Information-seeking questions
- UNCLEAR: Vague or ambiguous queries

User query: "{query}"

Respond in EXACT format:
INTENT: <intent_name>
CONFIDENCE: 0.0-1.0
REASONING: <brief explanation>
"""

# Parse LLM response
⚙️ SYSTEM: Extract intent from LLM output using regex:
pattern = r'INTENT:\s*(\w+)'
confidence_pattern = r'CONFIDENCE:\s*([\d.]+)'

# Map to Intent enum
⚙️ SYSTEM: intent_str → Intent.GREETING, Intent.QUESTION, etc.
```

**LLM Parameters:**
- Model: `llama-3.1-8b-instant`
- Max Tokens: 100
- Temperature: 0.3 (low for consistency)
- Performance: ~200-300ms

**Output:** `(intent, confidence)` tuple
- Example: `(Intent.QUESTION, 0.85)`

**Total Intent Classification Time:**
- Pattern match success: **~5ms** (no LLM)
- Pattern match fail + LLM fallback: **~250ms**

---

### **Step 3: Intent Routing** 🔀 **DECISION POINT**

**Location:** `rag_service.py:234-236`

```python
if not should_use_rag(intent):
    return await get_conversational_response(intent, query, session_id)
```

#### **Decision Logic (Hard-coded):** ⚙️ **SYSTEM WORK**

**Location:** `intent_service.py:142-151`

```python
⚙️ SYSTEM: Routing decision based on intent:

# Fast path (no RAG, no LLM) - Template responses
FAST_PATH_INTENTS = [
    Intent.GREETING,     # → Template: "Hello! How can I help you today?"
    Intent.FAREWELL,     # → Template: "Goodbye! Have a great day!"
    Intent.GRATITUDE,    # → Template: "You're welcome!"
    Intent.HELP,         # → Template: Multi-line feature list
    Intent.OUT_OF_SCOPE  # → Template: "I'm designed to help with Githaf Consulting..."
]

# Context-aware path (may use LLM for continuity)
CONTEXT_AWARE = [
    Intent.CHIT_CHAT,    # → Check if needs context (e.g., "yes", "okay")
    Intent.UNCLEAR       # → Provide clarification prompts
]

# RAG path (full pipeline with embeddings + vector search + LLM)
RAG_INTENTS = [
    Intent.QUESTION,     # → Full RAG pipeline
    Intent.UNKNOWN       # → Full RAG pipeline
]
```

---

### **PATH A: Conversational Response (Fast Path)** ⚙️ **SYSTEM WORK** (mostly)

**Location:** `rag_service.py:92-201 (get_conversational_response)`

**For:** GREETING, FAREWELL, GRATITUDE, HELP, OUT_OF_SCOPE

```python
# Step A1: Select template response (hard-coded lists)
⚙️ SYSTEM: Select from pre-defined response templates

if intent == Intent.GREETING:
    ⚙️ SYSTEM: response = random.choice([
        "Hello! How can I help you today?",
        "Hi there! What can I assist you with?",
        "Good day! How may I help you?",
        "Welcome! What would you like to know?",
        "Hello! I'm here to help with your questions about Githaf Consulting."
    ])

elif intent == Intent.FAREWELL:
    ⚙️ SYSTEM: response = random.choice([
        "Goodbye! Have a great day!",
        "Thank you for visiting! Feel free to return anytime.",
        "See you later!",
        "Take care!",
        "Bye! Don't hesitate to come back if you have more questions."
    ])

elif intent == Intent.GRATITUDE:
    ⚙️ SYSTEM: response = random.choice([
        "You're welcome!",
        "Happy to help!",
        "My pleasure!",
        "Glad I could assist!",
        "Anytime! Feel free to ask more questions."
    ])

elif intent == Intent.HELP:
    ⚙️ SYSTEM: response = """I'm the Githaf Consulting AI assistant! Here's what I can help you with:

✓ Answer questions about our services
✓ Provide contact information
✓ Share business details
✓ Help with general inquiries

Just ask me anything about Githaf Consulting!"""

elif intent == Intent.OUT_OF_SCOPE:
    ⚙️ SYSTEM: response = "I'm specifically designed to help with questions about Githaf Consulting. I may not have information about other topics. Is there anything about our services I can help you with?"

elif intent == Intent.UNCLEAR:
    # Step A2: Map vague query to clarification category
    ⚙️ SYSTEM: keyword_mapping = {
        "email": ["email"],
        "pricing": ["pricing", "price", "cost", "payment", "fee"],
        "contact": ["contact", "phone", "address", "location"],
        "services": ["services", "service"],
        "hours": ["hours", "schedule", "availability"]
    }

    ⚙️ SYSTEM: response = random.choice(CLARIFICATION_RESPONSES[category])
    # Example: "Could you please specify what information you need about pricing?"
```

**Special Case: Context-Aware Chit-Chat** 🤖 **LLM INVOCATION #2** (conditional)

```python
elif intent == Intent.CHIT_CHAT:
    query_lower = query.lower().strip()

    # Pattern-based responses (SYSTEM WORK)
    if "how are you" in query_lower:
        ⚙️ SYSTEM: response = random.choice([
            "I'm functioning well, thank you for asking!",
            "I'm here and ready to help!",
            "I'm doing great! How can I assist you?"
        ])

    elif "your name" in query_lower:
        ⚙️ SYSTEM: response = "I'm the Githaf Consulting AI assistant, here to help you!"

    # Context-dependent responses (e.g., "yes", "okay")
    elif query_lower in ["yes", "okay", "ok", "sure"]:
        # Retrieve conversation history
        ⚙️ SYSTEM: history = await get_conversation_history(session_id, limit=3)
        # SQL: SELECT * FROM messages WHERE conversation_id = X ORDER BY created_at DESC LIMIT 3

        if history:
            🤖 LLM CALL #2: Context-Aware Continuity

            Prompt:
            """
            You are a helpful AI assistant. The user just responded with "{query}".

            Previous conversation:
            {history}

            Provide a natural, context-aware response that acknowledges their reply and continues the conversation smoothly.
            Keep it brief (1-2 sentences).
            """

            # LLM Parameters:
            - Max Tokens: 100
            - Temperature: 0.7
            - Performance: ~200ms
        else:
            ⚙️ SYSTEM: response = "I'm listening! What would you like to know?"
```

**Performance (Fast Path):**
- Template responses: **~10ms** (instant)
- Context-aware chit-chat: **~250ms** (includes LLM call)

**Return:**
```json
{
  "response": "Hello! How can I help you today?",
  "sources": [],
  "context_found": false,
  "intent": "greeting",
  "conversational": true
}
```

**SKIP TO: Step 15 (Save Response)**

---

### **PATH B: Full RAG Pipeline (For Questions)**

**Location:** `rag_service.py:238-472`

**For:** Intent.QUESTION, Intent.UNKNOWN

---

#### **Step B1: Check if Planning Needed** 🔀 **DECISION POINT**

**Location:** `rag_service.py:239-277`

```python
if await needs_planning(processed_query, intent):
    # → Go to PATH C (Multi-Step Planning)
```

#### **Planning Detection (Hard-coded heuristics)** ⚙️ **SYSTEM WORK**

**Location:** `planning_service.py:26-78`

```python
⚙️ SYSTEM: Check for multi-step keywords:

multi_step_keywords = [
    "first", "then", "also", "and then", "after that",
    "next", "finally", "following", "subsequently"
]
if any(keyword in query_lower for keyword in multi_step_keywords):
    return True  # Needs planning

⚙️ SYSTEM: Check for multiple questions:
question_count = query.count("?")
if question_count > 1:
    return True  # Multiple questions = multi-step

⚙️ SYSTEM: Check for multiple "and" separators:
and_count = query_lower.count(" and ")
if and_count >= 2:
    return True  # Complex compound query

⚙️ SYSTEM: UNKNOWN intent always triggers planning:
if intent == Intent.UNKNOWN:
    return True

return False  # Simple question, use regular RAG
```

**If planning not needed → Continue to Step B2**

---

#### **Step B2: Semantic Memory Retrieval (Optional)** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:280-290`

**Phase 4: Advanced Memory**

```python
if session_id:
    # Retrieve past facts from this session

    # B2a. Generate embedding for query (for semantic search)
    ⚙️ SYSTEM: query_embedding = await get_embedding(processed_query)
    # Uses: sentence-transformers/all-MiniLM-L6-v2 (local model, ~50ms)
    # Input: "What are your services?"
    # Output: [0.23, -0.45, 0.67, ...] (384-dimensional vector)

    # B2b. Semantic search in memory database
    ⚙️ SYSTEM: SQL with pgvector:
    SELECT id, content, category, confidence,
           1 - (embedding <=> query_embedding) AS similarity
    FROM semantic_memory
    WHERE session_id = '{session_id}'
      AND 1 - (embedding <=> query_embedding) > 0.5
    ORDER BY similarity DESC
    LIMIT 3

    # B2c. Retrieved memories (example):
    memories = [
        {"content": "User prefers email communication", "category": "preference", "similarity": 0.82},
        {"content": "User interested in AI consulting", "category": "context", "similarity": 0.74}
    ]

    # These memories will be used in Step B7 when building LLM prompt
```

**Performance:** ~80-100ms (embedding generation + vector search)

---

#### **Step B3: Query Embedding** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:296`

```python
⚙️ SYSTEM: Generate embedding for processed query

# Uses: sentence-transformers/all-MiniLM-L6-v2
# This is a LOCAL model (runs on server, not API call)
query_embedding = await get_embedding(processed_query)

# Input: "What are your business hours?"
# Output: [0.12, -0.34, 0.56, -0.78, ...] (384 floats)

# Model details:
- Embedding dimension: 384
- Model size: ~100MB (cached on server)
- Performance: ~50-80ms
- No external API call (local inference)
```

---

#### **Step B4: Adaptive Threshold Selection** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:299-316`

**Hard-coded heuristics for factual queries:**

```python
⚙️ SYSTEM: Keyword detection for factual queries

factual_keywords = [
    "email", "phone", "contact", "address", "number",
    "reach", "call", "location", "where", "office"
]

query_lower = processed_query.lower()
is_factual_query = any(keyword in query_lower for keyword in factual_keywords)

# Adaptive threshold selection (hard-coded rules):
if "email" in query_lower or "location" in query_lower or "where" in query_lower:
    threshold = 0.20  # Very relaxed (contact info chunks may have low similarity)

elif is_factual_query:
    threshold = 0.25  # Relaxed

else:
    threshold = settings.RAG_SIMILARITY_THRESHOLD  # Default: 0.5

# Adaptive top_k selection:
top_k = settings.RAG_TOP_K * 2 if is_factual_query else settings.RAG_TOP_K
# Default: 5 for normal queries, 10 for factual queries
```

**Reasoning:**
- Contact info chunks (email, address) often have lower semantic similarity
- Need lower threshold to ensure we find them
- Retrieve more candidates for re-ranking

---

#### **Step B5: Similarity Search (Vector Database)** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:319-326`

```python
⚙️ SYSTEM: PostgreSQL + pgvector RPC function

# SQL query executed:
SELECT
  embeddings.id,
  embeddings.document_id,
  embeddings.content,
  1 - (embeddings.embedding <=> query_embedding) AS similarity
FROM embeddings
WHERE 1 - (embeddings.embedding <=> query_embedding) > {threshold}
ORDER BY embeddings.embedding <=> query_embedding
LIMIT {top_k}

# Vector distance operator: <=> (cosine distance)
# Cosine similarity = 1 - cosine_distance
# Index: IVFFlat with 100 lists (for fast approximate search)

# Example result:
relevant_docs = [
    {
        "id": "uuid-1",
        "content": "Our business hours are Monday-Friday 9 AM - 5 PM GMT.",
        "similarity": 0.87
    },
    {
        "id": "uuid-2",
        "content": "Githaf Consulting is open for consultations...",
        "similarity": 0.72
    },
    {
        "id": "uuid-3",
        "content": "Contact us during office hours for immediate assistance.",
        "similarity": 0.65
    }
]
```

**Performance:** ~50-150ms (depending on index size and top_k)

---

#### **Step B6: Re-Ranking for Factual Queries** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:328-358`

**Hard-coded boosting heuristics:**

```python
if is_factual_query and relevant_docs:
    ⚙️ SYSTEM: Detect specific information needs:

    needs_email = "email" in query_lower
    needs_phone = "phone" in query_lower or "call" in query_lower
    needs_location = "location" in query_lower or "where" in query_lower

    for doc in relevant_docs:
        content = doc.get("content", "").lower()

        # Boost 1: Email addresses (@ symbol present)
        if needs_email and "@" in content:
            doc["similarity"] = min(1.0, doc["similarity"] * 1.5)  # +50% boost

        # Boost 2: Phone numbers (+ or digits present)
        if needs_phone and ("+" in content or any(char.isdigit() for char in content)):
            doc["similarity"] = min(1.0, doc["similarity"] * 1.3)  # +30% boost

        # Boost 3: Addresses (location keywords present)
        location_keywords = ["street", "london", "uk", "uae", "city", "mailing address", "office:"]
        if needs_location and any(keyword in content for keyword in location_keywords):
            doc["similarity"] = min(1.0, doc["similarity"] * 1.6)  # +60% boost

    # Re-sort by boosted scores
    ⚙️ SYSTEM: relevant_docs.sort(key=lambda x: x["similarity"], reverse=True)

    # Keep only top K after re-ranking
    relevant_docs = relevant_docs[:settings.RAG_TOP_K]
```

**Example:**

Before re-ranking:
```python
[
    {"content": "Our services include...", "similarity": 0.75},
    {"content": "Email: info@githaf.com", "similarity": 0.45},  # Low similarity!
]
```

After re-ranking (for email query):
```python
[
    {"content": "Email: info@githaf.com", "similarity": 0.675},  # 0.45 * 1.5 = 0.675
    {"content": "Our services include...", "similarity": 0.75},
]
# Email chunk now ranked higher despite lower original similarity
```

---

#### **Step B7: Check Context Found** 🔀 **DECISION POINT**

**Location:** `rag_service.py:360-369`

```python
if not relevant_docs or len(relevant_docs) == 0:
    # NO CONTEXT FOUND - Return fallback response
    ⚙️ SYSTEM: return {
        "response": "I don't have enough information to answer that question. Could you please rephrase or ask about something else related to Githaf Consulting?",
        "sources": [],
        "context_found": False
    }
    # SKIP TO: Step 15 (Save Response)
```

**If context found → Continue to Step B8**

---

#### **Step B8: Build Context from Documents** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:371-388`

```python
⚙️ SYSTEM: Format retrieved documents as context

context_parts = []
sources = []

for i, doc in enumerate(relevant_docs, 1):
    content = doc.get("content", "")
    similarity = doc.get("similarity", 0)
    doc_id = doc.get("id", "")

    # Add numbered source
    context_parts.append(f"[Source {i}] {content}")

    # Prepare source metadata for frontend
    sources.append({
        "id": doc_id,
        "content": content[:200] + "..." if len(content) > 200 else content,
        "similarity": similarity
    })

# Join all sources with double newlines
context = "\n\n".join(context_parts)

# Example output:
context = """[Source 1] Our business hours are Monday-Friday 9 AM - 5 PM GMT.

[Source 2] Githaf Consulting is open for consultations during office hours.

[Source 3] Contact us during office hours for immediate assistance."""
```

---

#### **Step B9: Get Conversation History** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:390-395`

```python
⚙️ SYSTEM: Retrieve conversation history from database

history = await get_conversation_history(session_id, limit=5)

# SQL query:
SELECT role, content, created_at
FROM messages
WHERE conversation_id = (
    SELECT id FROM conversations WHERE session_id = '{session_id}'
)
ORDER BY created_at DESC
LIMIT 5

# Example result:
history = [
    {"role": "user", "content": "What services do you offer?"},
    {"role": "assistant", "content": "Githaf Consulting offers..."},
    {"role": "user", "content": "How much does it cost?"},
    {"role": "assistant", "content": "Pricing depends on..."}
]

# Format for LLM
⚙️ SYSTEM: history_text = await format_history_for_llm(history)

# Output:
history_text = """User: What services do you offer?
Assistant: Githaf Consulting offers...
User: How much does it cost?
Assistant: Pricing depends on..."""
```

---

#### **Step B10: Build LLM Prompt** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:397-402`

```python
⚙️ SYSTEM: Build prompt using template

# Template from prompts.py:
RAG_SYSTEM_PROMPT = """You are a helpful AI assistant for Githaf Consulting.

Based on the following context from our knowledge base, answer the user's question.

Context:
{context}

Conversation History:
{history}

User Question: {query}

Instructions:
- Answer based ONLY on the provided context
- If the context doesn't contain the answer, say you don't have that information
- Be friendly and professional
- Keep responses concise (2-3 sentences unless more detail is needed)
- Do NOT make up information or hallucinate facts
- If you reference specific details (email, phone, etc.), cite them exactly as shown in context

Answer:"""

# Fill in template
prompt = RAG_SYSTEM_PROMPT.format(
    context=context,      # From Step B8
    history=history_text, # From Step B9
    query=query           # Original user query
)

# Final prompt example (truncated):
prompt = """You are a helpful AI assistant for Githaf Consulting.

Based on the following context from our knowledge base, answer the user's question.

Context:
[Source 1] Our business hours are Monday-Friday 9 AM - 5 PM GMT.
[Source 2] Githaf Consulting is open for consultations during office hours.

Conversation History:
User: What services do you offer?
Assistant: Githaf Consulting offers strategic planning, digital transformation, and AI consulting.

User Question: What are your business hours?

Instructions:
- Answer based ONLY on the provided context
- If the context doesn't contain the answer, say you don't have that information
...

Answer:"""
```

---

#### **Step B11: Generate Response with LLM** 🤖 **LLM INVOCATION #3** (or #2 if no context-aware chit-chat)

**Location:** `rag_service.py:404-407`

```python
🤖 LLM CALL #3 (or #2): RAG Response Generation

response_text = await generate_response(prompt)

# LLM API call to Groq
# File: llm_service.py:27-50

# Parameters:
- Model: llama-3.1-8b-instant
- Max Tokens: 500 (from settings.LLM_MAX_TOKENS)
- Temperature: 0.7 (from settings.LLM_TEMPERATURE)
- System: (RAG prompt built in Step B10)

# API Request:
POST https://api.groq.com/openai/v1/chat/completions
{
  "model": "llama-3.1-8b-instant",
  "messages": [
    {"role": "system", "content": "<RAG_SYSTEM_PROMPT>"}
  ],
  "max_tokens": 500,
  "temperature": 0.7
}

# Example Response:
{
  "choices": [{
    "message": {
      "content": "Our business hours are Monday to Friday from 9 AM to 5 PM GMT. We're available for consultations during these hours. Feel free to reach out!"
    }
  }],
  "usage": {
    "prompt_tokens": 450,
    "completion_tokens": 35,
    "total_tokens": 485
  }
}

# Extract response text
⚙️ SYSTEM: response_text = response["choices"][0]["message"]["content"]
```

**Performance:** ~800ms - 2000ms (depends on response length and Groq API load)

---

#### **Step B12: Response Validation** 🤖 **LLM INVOCATION #4** (or #3)

**Location:** `rag_service.py:410-416`

**Phase 1: Observation Layer**

```python
🤖 LLM CALL #4 (or #3): Response Quality Validation

validation = await validate_response(
    query=query,
    response=response_text,
    sources=sources
)

# File: validation_service.py:44-99
```

**Validation LLM Call:**

```python
# Build validation prompt
validation_prompt = """You are a quality assurance system for AI responses.

User Query: "{query}"

AI Response: "{response}"

Context Sources:
{sources_text}

Evaluate this response on three criteria:
1. ANSWERS_QUESTION: Does it actually answer what the user asked?
2. IS_GROUNDED: Is it based on the provided sources (not made up)?
3. HAS_HALLUCINATION: Does it contain fabricated information?

Respond in this EXACT format:
ANSWERS_QUESTION: yes|no
IS_GROUNDED: yes|no
HAS_HALLUCINATION: yes|no
CONFIDENCE: 0.0-1.0
RETRY: yes|no
ADJUSTMENT: <suggestion if retry needed, otherwise "none">
"""

🤖 LLM CALL: Groq API (Validation)

# Parameters:
- Model: llama-3.1-8b-instant
- Max Tokens: 200
- Temperature: 0.3 (low for consistency)

# Example LLM Response:
"""
ANSWERS_QUESTION: yes
IS_GROUNDED: yes
HAS_HALLUCINATION: no
CONFIDENCE: 0.92
RETRY: no
ADJUSTMENT: none
"""

# Parse validation result
⚙️ SYSTEM: Parse LLM output using regex:
{
    "is_valid": True,               # All checks passed
    "confidence": 0.92,             # High confidence
    "issues": [],                   # No problems found
    "retry_recommended": False,     # No retry needed
    "suggested_adjustment": None
}
```

**Performance:** ~300-500ms

---

#### **Step B13: Retry Logic (If Validation Fails)** 🔁 **RETRY LOOP**

**Location:** `rag_service.py:418-442`

**Only executes if validation fails:**

```python
retry_count = 0
max_retries = 2  # Default

while not validation["is_valid"] and validation["retry_recommended"] and retry_count < max_retries:
    retry_count += 1

    logger.warning(f"Validation failed, retry {retry_count}/{max_retries}")
    logger.warning(f"Issues: {validation['issues']}")
    logger.warning(f"Adjustment: {validation['suggested_adjustment']}")

    # Step B13a: Adjust parameters based on validation feedback
    ⚙️ SYSTEM: Parse adjustment suggestion
    # Examples:
    # - "Lower similarity threshold to find more sources"
    # - "Expand search to top 10 results"
    # - "Rephrase query for better matching"

    # Step B13b: Retry with adjusted parameters
    retry_response = await retry_with_adjustment(
        query=query,
        adjustment=validation["suggested_adjustment"],
        original_threshold=threshold
    )
    # This function re-runs Steps B5-B11 with adjusted parameters
    # File: validation_service.py:159-191

    # Step B13c: Update response and sources
    ⚙️ SYSTEM: response_text = retry_response.get("response", response_text)
    ⚙️ SYSTEM: sources = retry_response.get("sources", sources)

    # Step B13d: Validate retry attempt
    🤖 LLM CALL: Validation (again)
    validation = await validate_response(query, response_text, sources)
    # Same as Step B12

# Maximum retries: 2
# Each retry adds ~1-2 seconds (re-run Steps B5-B12)
```

**Example Scenario:**

**Initial Response (Invalid):**
```
Query: "What is your email?"
Response: "You can reach us through our contact form."
Validation:
  - ANSWERS_QUESTION: no (didn't provide email)
  - IS_GROUNDED: yes
  - CONFIDENCE: 0.4
  - RETRY: yes
  - ADJUSTMENT: "Lower threshold to 0.2 to find contact info chunks"
```

**After Retry 1:**
```
Adjustment Applied: threshold = 0.2 (from 0.5)
Retrieved: [Source with "Email: info@githaf.com"]
Response: "Our email address is info@githaf.com. Feel free to reach out!"
Validation:
  - ANSWERS_QUESTION: yes
  - IS_GROUNDED: yes
  - CONFIDENCE: 0.95
  - RETRY: no
```

---

#### **Step B14: Log Final Validation** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:444-448`

```python
if validation["is_valid"]:
    logger.info(f"Response validated (confidence: {validation['confidence']:.2f}, retries: {retry_count})")
else:
    logger.warning(f"Response still has issues after {retry_count} retries: {validation['issues']}")
    # Continue anyway (return best-effort response)
```

---

#### **Step B15: Return RAG Response** ⚙️ **SYSTEM WORK**

**Location:** `rag_service.py:450-463`

```python
⚙️ SYSTEM: Build final response object

return {
    "response": response_text,
    "sources": sources,
    "context_found": True,
    "intent": intent.value,
    "conversational": False,
    "validation": {
        "confidence": validation["confidence"],
        "retry_count": retry_count,
        "issues": validation["issues"],
        "is_valid": validation["is_valid"]
    }
}
```

**Example:**
```json
{
  "response": "Our business hours are Monday to Friday from 9 AM to 5 PM GMT.",
  "sources": [
    {
      "id": "uuid-1",
      "content": "Our business hours are Monday-Friday 9 AM - 5 PM GMT.",
      "similarity": 0.87
    }
  ],
  "context_found": true,
  "intent": "question",
  "conversational": false,
  "validation": {
    "confidence": 0.92,
    "retry_count": 0,
    "issues": [],
    "is_valid": true
  }
}
```

---

### **PATH C: Multi-Step Planning** 🤖 **LLM INVOCATIONS**

**Location:** `rag_service.py:241-277`

**Triggered when:** `needs_planning() == True`

---

#### **Step C1: Create Action Plan** 🤖 **LLM INVOCATION**

**Location:** `planning_service.py:80-175 (create_plan)`

```python
🤖 LLM CALL: Planning (Generate Action Sequence)

# Build planning prompt
planning_prompt = """You are a task planning system for Githaf Consulting chatbot.

User Query: "{query}"
Detected Intent: {intent}

Your task is to break down this query into a sequence of actions.

Available actions:
- SEARCH_KNOWLEDGE: Search knowledge base for information
- GET_CONTACT_INFO: Extract specific contact details (email, phone, address)
- VALIDATE_DATA: Validate data format (email, phone, etc.)
- FORMAT_RESPONSE: Structure final response
- ASK_CLARIFICATION: Request more information from user
- SEND_EMAIL: Send email to recipients (Phase 5)
- CHECK_CALENDAR: Check availability or schedule appointments (Phase 5)
- QUERY_CRM: Get customer data or log interactions (Phase 5)
- CALL_API: Search web for current information (Phase 5)

Respond in EXACT JSON format:
{{
  "goal": "<overall goal of the query>",
  "actions": [
    {{
      "type": "SEARCH_KNOWLEDGE",
      "params": {{"query": "..."}},
      "description": "Search for X information"
    }},
    ...
  ],
  "estimated_steps": <number>,
  "complexity": "simple|medium|complex"
}}
"""

# LLM Parameters:
- Model: llama-3.1-8b-instant
- Max Tokens: 800
- Temperature: 0.5 (balanced)

# Example LLM Response:
{
  "goal": "Find company email and send availability inquiry",
  "actions": [
    {
      "type": "SEARCH_KNOWLEDGE",
      "params": {"query": "contact email"},
      "description": "Find company email address"
    },
    {
      "type": "CHECK_CALENDAR",
      "params": {"date": "2025-01-15", "action": "check_availability"},
      "description": "Check availability on Jan 15th"
    },
    {
      "type": "SEND_EMAIL",
      "params": {"to": "client@example.com", "subject": "Availability"},
      "description": "Send availability confirmation email"
    }
  ],
  "estimated_steps": 3,
  "complexity": "medium"
}

# Parse JSON response
⚙️ SYSTEM: plan = ActionPlan.parse_obj(llm_response)
```

**Performance:** ~500-800ms

---

#### **Step C2: Execute Action Plan** ⚙️ **SYSTEM WORK** + 🤖 **LLM CALLS** (per action)

**Location:** `planning_service.py:177-242 (execute_plan)`

```python
⚙️ SYSTEM: Sequential execution with shared context

context = {}  # Shared data between actions
results = []

for action in plan.actions:
    # Execute each action
    result = await execute_action(action, context, session_id)

    # Store result in shared context
    context[action.type.value] = result.data
    results.append(result)
```

**For each action type:**

---

##### **Action: SEARCH_KNOWLEDGE**

**Location:** `planning_service.py:286-310`

```python
⚙️ SYSTEM: Mini-RAG pipeline

# Step 1: Extract search query from action params
search_query = action.params.get("query", "")

# Step 2: Generate embedding
⚙️ SYSTEM: query_embedding = await get_embedding(search_query)
# Performance: ~50ms

# Step 3: Similarity search
⚙️ SYSTEM: docs = await similarity_search(query_embedding, top_k=3)
# Performance: ~80ms

# Step 4: Extract text from results
⚙️ SYSTEM: found_info = "\n".join([doc["content"] for doc in docs])

return ActionResult(
    action_type=ActionType.SEARCH_KNOWLEDGE,
    success=True,
    data={"information": found_info, "sources": docs}
)
```

**Total: ~130ms (no LLM)**

---

##### **Action: GET_CONTACT_INFO**

**Location:** `planning_service.py:312-345`

```python
⚙️ SYSTEM: Targeted search + extraction

# Step 1: Determine info type
info_type = action.params.get("info_type", "general")  # email, phone, address

# Step 2: Build specific search query
⚙️ SYSTEM: query_map = {
    "email": "contact email address",
    "phone": "phone number contact",
    "address": "office address location",
    "general": "contact information"
}
search_query = query_map.get(info_type, "contact information")

# Step 3: Search with low threshold (factual query)
⚙️ SYSTEM: query_embedding = await get_embedding(search_query)
⚙️ SYSTEM: docs = await similarity_search(query_embedding, top_k=5, threshold=0.2)

# Step 4: Extract specific information using regex
⚙️ SYSTEM:
if info_type == "email":
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, docs_text)
    return {"emails": emails}

elif info_type == "phone":
    phone_pattern = r'\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}'
    phones = re.findall(phone_pattern, docs_text)
    return {"phones": phones}

# etc.
```

**Total: ~150ms (no LLM, regex-based extraction)**

---

##### **Action: SEND_EMAIL**

**Location:** `planning_service.py:483-503`

```python
⚙️ SYSTEM: SMTP email sending (via email_tool.py)

# Get email tool from registry
from app.services.tools import get_tool_registry
registry = get_tool_registry()

# Execute email tool
result = await registry.execute_tool("send_email", action.params)

# Tool internally:
# 1. Validates SMTP configuration (env variables)
# 2. Builds MIME message
# 3. Connects to SMTP server (e.g., smtp.gmail.com:587)
# 4. Sends email via STARTTLS
# 5. Returns success/failure

# Example params:
{
  "to": "client@example.com",
  "subject": "Availability Confirmation",
  "body": "We're available on Jan 15th at 2 PM."
}
```

**Total: ~500-1000ms (depends on SMTP server response)**

---

##### **Action: CHECK_CALENDAR**

**Location:** `planning_service.py:505-525`

```python
⚙️ SYSTEM: Database query for appointments

# Get calendar tool
result = await registry.execute_tool("check_calendar", action.params)

# Tool internally (calendar_tool.py):
if action.params["action"] == "check_availability":
    # Query appointments table
    ⚙️ SYSTEM: SQL Query:
    SELECT start_time, duration_minutes
    FROM appointments
    WHERE start_time::date = '{date}'
      AND status IN ('scheduled', 'confirmed')
    ORDER BY start_time

    # Find gaps (available time slots)
    ⚙️ SYSTEM: business_hours = 9:00 - 17:00
    ⚙️ SYSTEM: Detect 1-hour gaps between appointments

    # Return available slots
    return {
      "available_slots": [
        {"start": "09:00", "end": "10:00"},
        {"start": "14:00", "end": "15:00"}
      ]
    }
```

**Total: ~50-100ms (database query + logic)**

---

##### **Action: QUERY_CRM**

**Location:** `planning_service.py:527-547`

```python
⚙️ SYSTEM: CRM database query

# Get CRM tool
result = await registry.execute_tool("query_crm", action.params)

# Tool internally (crm_tool.py):
if action.params["action"] == "get_contact":
    ⚙️ SYSTEM: SQL Query:
    SELECT id, email, name, company, phone, industry, tags
    FROM crm_contacts
    WHERE email = '{email}'
    LIMIT 1

    return contact_record

elif action.params["action"] == "search_contacts":
    ⚙️ SYSTEM: Full-text search:
    SELECT * FROM crm_contacts
    WHERE name ILIKE '%{query}%'
       OR company ILIKE '%{query}%'
       OR email ILIKE '%{query}%'
    LIMIT 10
```

**Total: ~30-80ms (database query)**

---

##### **Action: CALL_API (Web Search)**

**Location:** `planning_service.py:549-569`

```python
⚙️ SYSTEM: Web scraping (no LLM)

# Get web search tool
result = await registry.execute_tool("web_search", action.params)

# Tool internally (web_search_tool.py):
if provider == "duckduckgo":
    # Step 1: Build DuckDuckGo URL
    url = f"https://duckduckgo.com/html/?q={urllib.parse.quote(query)}"

    # Step 2: HTTP GET request
    ⚙️ SYSTEM: response = await httpx.get(url, headers=headers, timeout=10)

    # Step 3: Parse HTML with BeautifulSoup
    ⚙️ SYSTEM: soup = BeautifulSoup(response.text, 'html.parser')

    # Step 4: Extract search results
    ⚙️ SYSTEM: results = []
    for result_div in soup.find_all('div', class_='result'):
        title = result_div.find('a', class_='result__a').text
        snippet = result_div.find('a', class_='result__snippet').text
        url = result_div.find('a', class_='result__a')['href']
        results.append({"title": title, "snippet": snippet, "url": url})

    return {"results": results[:num_results]}

elif provider == "serpapi":
    # Use SerpAPI (requires API key)
    🤖 EXTERNAL API CALL (SerpAPI, not LLM)
```

**Total: ~800-1500ms (HTTP + HTML parsing)**

---

##### **Action: FORMAT_RESPONSE**

**Location:** `planning_service.py:347-388`

```python
🤖 LLM CALL: Response Formatting

# Aggregate all action results
aggregated_data = aggregate_results(results, context)

# Example aggregated data:
"""
Email found: info@githaf.com
Available slots: 09:00-10:00, 14:00-15:00
Email sent successfully to client@example.com
"""

# Build formatting prompt
format_prompt = """You are a response formatter for Githaf Consulting chatbot.

User's original query: "{query}"

Information gathered:
{aggregated_data}

Task: Create a natural, conversational response that:
1. Directly answers the user's question
2. Includes all relevant information gathered
3. Is friendly and professional
4. Is concise (2-4 sentences)

Response:"""

# LLM Call
🤖 LLM: Groq API
- Max Tokens: 300
- Temperature: 0.7

# Example response:
"I found our email address (info@githaf.com) and checked our calendar. We have availability on January 15th at 9 AM and 2 PM. I've sent a confirmation email to your address with these time slots!"
```

**Total: ~600-1000ms**

---

#### **Step C3: Aggregate and Return Plan Result**

**Location:** `planning_service.py:390-438`

```python
⚙️ SYSTEM: Combine all action results

# Extract final response from FORMAT_RESPONSE action
final_response = results[-1].data.get("response", "Task completed")

# Build success status
all_successful = all(r.success for r in results)

return {
    "success": all_successful,
    "response": final_response,
    "plan_executed": True,
    "actions_completed": len(results),
    "action_results": [r.dict() for r in results]
}
```

---

### **Step 15: Save Assistant Response** ⚙️ **SYSTEM WORK**

**Location:** `chat.py:78-86`

```python
⚙️ SYSTEM: Save response to database

await save_message(
    conversation_id=conversation_id,
    role="assistant",
    content=response_text,
    context_used={"sources": sources} if sources else None
)

# SQL:
INSERT INTO messages (id, conversation_id, role, content, context_used, created_at)
VALUES (gen_random_uuid(), '{conversation_id}', 'assistant', '{response_text}', '{sources_json}', NOW())
RETURNING id
```

---

### **Step 16: Return Response to User** ⚙️ **SYSTEM WORK**

**Location:** `chat.py:88-94`

```python
⚙️ SYSTEM: Build ChatResponse object

return ChatResponse(
    response=response_text,
    session_id=session_id,
    sources=sources if sources else None,
    context_found=context_found,
    message_id=message_id
)

# FastAPI serializes to JSON and sends HTTP 200 response
```

**Final JSON response to frontend:**
```json
{
  "response": "Our business hours are Monday to Friday from 9 AM to 5 PM GMT.",
  "session_id": "a3f2e1d0-b9c8-4a7b-8e6d-5c4b3a2f1e0d",
  "sources": [
    {
      "id": "uuid-1",
      "content": "Our business hours are Monday-Friday 9 AM - 5 PM GMT.",
      "similarity": 0.87
    }
  ],
  "context_found": true,
  "message_id": "b4e3d2c1-a9b8-4c7d-9f8e-6d5c4b3a2e1f"
}
```

---

## Performance Summary

### **Fast Path (Conversational Intents)**

| Step | Type | Time | Details |
|------|------|------|---------|
| 0. Request preprocessing | ⚙️ SYSTEM | ~10ms | IP, session, DB save |
| 1. Query preprocessing | ⚙️ SYSTEM | ~2ms | Misspelling fixes, normalization |
| 2a. Pattern matching | ⚙️ SYSTEM | ~5ms | 100+ greeting/farewell/gratitude patterns |
| 3. Template response | ⚙️ SYSTEM | ~1ms | Random selection from templates |
| 15. Save response | ⚙️ SYSTEM | ~15ms | Database INSERT |
| **TOTAL (Fast Path)** | | **~33ms** | **No LLM invocations** |

### **RAG Path (Simple Questions - No Retry)**

| Step | Type | Time | Details |
|------|------|------|---------|
| 0. Request preprocessing | ⚙️ SYSTEM | ~10ms | IP, session, DB save |
| 1. Query preprocessing | ⚙️ SYSTEM | ~2ms | Misspelling fixes |
| 2a. Pattern matching | ⚙️ SYSTEM | ~5ms | Intent detection |
| 2b. LLM fallback (if needed) | 🤖 LLM #1 | ~250ms | Intent classification |
| B2. Memory retrieval | ⚙️ SYSTEM | ~80ms | Embedding + vector search |
| B3. Query embedding | ⚙️ SYSTEM | ~50ms | Sentence Transformers (local) |
| B4. Threshold selection | ⚙️ SYSTEM | ~1ms | Hard-coded heuristics |
| B5. Similarity search | ⚙️ SYSTEM | ~100ms | pgvector cosine search |
| B6. Re-ranking | ⚙️ SYSTEM | ~5ms | Boosting heuristics |
| B8-B10. Context + history + prompt | ⚙️ SYSTEM | ~20ms | String formatting |
| B11. LLM response generation | 🤖 LLM #2 | ~1200ms | Groq API (main response) |
| B12. Response validation | 🤖 LLM #3 | ~400ms | Groq API (validation) |
| 15. Save response | ⚙️ SYSTEM | ~15ms | Database INSERT |
| **TOTAL (RAG Path)** | | **~2.1 sec** | **2-3 LLM calls** |

### **RAG Path (With Validation Retry)**

| Additional Steps | Type | Time | Details |
|-----------------|------|------|---------|
| B13. Retry loop (×1) | ⚙️ + 🤖 | ~1.5s | Re-run B5-B12 |
| B13. Validation (retry) | 🤖 LLM | ~400ms | Validate retry response |
| **TOTAL (With 1 Retry)** | | **~4.0 sec** | **4-5 LLM calls** |

### **Planning Path (Multi-Step)**

| Step | Type | Time | Details |
|------|------|------|---------|
| 0-2. Same as RAG | ⚙️ + 🤖 | ~270ms | Preprocessing + intent |
| C1. Create plan | 🤖 LLM | ~600ms | Planning LLM call |
| C2. Execute actions: | | | |
| - SEARCH_KNOWLEDGE (×2) | ⚙️ SYSTEM | ~260ms | 2× mini-RAG (no LLM) |
| - CHECK_CALENDAR | ⚙️ SYSTEM | ~80ms | Database query |
| - SEND_EMAIL | ⚙️ SYSTEM | ~800ms | SMTP send |
| - FORMAT_RESPONSE | 🤖 LLM | ~700ms | Response formatting |
| C3. Validation | 🤖 LLM | ~400ms | Validate final response |
| 15. Save response | ⚙️ SYSTEM | ~15ms | Database INSERT |
| **TOTAL (Planning Path)** | | **~3.1 sec** | **3 LLM calls + tools** |

---

## LLM Invocation Summary

### **Total LLM Calls Per Request:**

| Path | LLM Calls | When | Purpose |
|------|-----------|------|---------|
| **Fast Path** | **0** | Never | Template responses only |
| **Context-Aware Chit-Chat** | **1** | If "yes"/"okay" with history | Continuity response |
| **Simple RAG (Success)** | **2** | If pattern match fails | 1. Intent (fallback)<br>2. Response generation |
| **Simple RAG (Full)** | **3** | All questions | 1. Intent (fallback)<br>2. Response generation<br>3. Validation |
| **RAG with Retry (×1)** | **5** | Validation fails | 1-3 (above)<br>4. Retry response<br>5. Retry validation |
| **Planning Path** | **3** | Complex queries | 1. Intent (fallback)<br>2. Planning<br>3. Format response<br>4. Validation |

### **LLM Usage Breakdown:**

| LLM Call Type | Frequency | Avg Time | Tokens | Cost (approx) |
|---------------|-----------|----------|--------|---------------|
| Intent Classification | 30-40% of requests | ~250ms | ~150 total | $0.0001 |
| RAG Response | 50-60% of requests | ~1200ms | ~600 total | $0.0004 |
| Response Validation | 50-60% of requests | ~400ms | ~300 total | $0.0002 |
| Context Continuity | 5-10% of requests | ~200ms | ~150 total | $0.0001 |
| Planning | 5-10% of requests | ~600ms | ~500 total | $0.0003 |
| Format Response | 5-10% of requests | ~700ms | ~400 total | $0.0003 |

**Groq Pricing (Llama 3.1-8b-instant):**
- Input: $0.05 per 1M tokens
- Output: $0.08 per 1M tokens
- Free tier: 14,400 requests/day

---

## Hard-Coded Decision Points

### **1. Intent Classification Patterns** (200+ patterns)

```python
GREETING_PATTERNS = ["hello", "hi", "hey", "good morning", ...]  # 100+
FAREWELL_PATTERNS = ["bye", "goodbye", "see you", ...]           # 50+
GRATITUDE_PATTERNS = ["thanks", "thank you", ...]                # 30+
HELP_PATTERNS = ["help", "how to use", ...]                      # 10+
CHIT_CHAT_PATTERNS = ["how are you", "are you there", ...]       # 50+
OUT_OF_SCOPE_KEYWORDS = ["weather", "politics", ...]             # 20+
```

### **2. Misspelling Corrections** (20+ patterns)

```python
MISSPELLING_MAP = {
    r'\b(emial|emal)\b': 'email',
    r'\b(contct|contac)\b': 'contact',
    ...  # 20+ patterns
}
```

### **3. Factual Query Detection**

```python
FACTUAL_KEYWORDS = [
    "email", "phone", "contact", "address", "number",
    "reach", "call", "location", "where", "office"
]

THRESHOLD_RULES = {
    "email|location|where": 0.20,    # Very relaxed
    "factual_query": 0.25,            # Relaxed
    "default": 0.50                   # Normal
}
```

### **4. Re-Ranking Boost Factors**

```python
BOOST_FACTORS = {
    "email_present": 1.5,      # +50%
    "phone_present": 1.3,      # +30%
    "location_keywords": 1.6    # +60%
}
```

### **5. Planning Triggers**

```python
MULTI_STEP_KEYWORDS = ["first", "then", "also", "and then", ...]
NEEDS_PLANNING_IF:
    - query.count("?") > 1
    - query.count(" and ") >= 2
    - intent == Intent.UNKNOWN
```

### **6. Validation Thresholds**

```python
VALIDATION_CONFIDENCE_THRESHOLD = 0.7  # Retry if below
MAX_RETRIES = 2
```

---

## Database Operations Summary

### **Reads (SELECT):**

| Step | Table | Operation | Avg Time |
|------|-------|-----------|----------|
| 0 | `conversations` | Get or create conversation | ~10ms |
| B5 | `embeddings` | Vector similarity search | ~100ms |
| B9 | `messages` | Get conversation history | ~15ms |
| B2 | `semantic_memory` | Retrieve semantic facts | ~80ms |
| Tools | `appointments`, `crm_contacts` | Tool-specific queries | ~50ms |

### **Writes (INSERT/UPDATE):**

| Step | Table | Operation | Avg Time |
|------|-------|-----------|----------|
| 0 | `messages` | Save user message | ~15ms |
| 15 | `messages` | Save assistant message | ~15ms |
| Post | `semantic_memory` | Extract & store facts | ~100ms (async) |
| Post | `conversation_summaries` | Create summary | ~50ms (async) |

---

## Caching & Optimization

### **What is Cached:**

1. **Embedding Model** (sentence-transformers)
   - Loaded once on server startup
   - ~100MB in memory
   - Reused for all queries

2. **Database Connection Pool**
   - Supabase client singleton
   - Reused across requests

3. **Conversation History**
   - Retrieved once per request
   - Cached in memory during request

### **What is NOT Cached:**

1. **LLM Responses** (always fresh)
2. **Vector Search Results** (always computed)
3. **External API Calls** (email, web search)

---

## Error Handling & Fallbacks

### **Fallback Hierarchy:**

```
1. Pattern Match Success → Template Response (FAST)
   ↓ (if fail)
2. LLM Intent Classification → Template or RAG
   ↓ (if fail)
3. RAG Pipeline with Vector Search → LLM Response
   ↓ (if fail)
4. Retry with Adjusted Parameters (×2 max)
   ↓ (if still fail)
5. Generic Fallback Response
   "I don't have enough information to answer that question..."
```

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ USER QUERY: "What are your business hours?"                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 0: Request Preprocessing (⚙️ SYSTEM ~10ms)                 │
│ - Generate session_id (if not provided)                        │
│ - Extract client IP → Anonymize → Geo-locate                   │
│ - Get/create conversation in DB                                │
│ - Save user message to DB                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 1: Query Preprocessing (⚙️ SYSTEM ~2ms)                    │
│ - Fix misspellings: "emial" → "email"                          │
│ - Normalize: "Githaf" → "Githaf Consulting"                    │
│ Output: "What are your business hours?"                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2a: Pattern Matching (⚙️ SYSTEM ~5ms)                      │
│ Check 200+ patterns:                                            │
│ ✓ NOT greeting, farewell, gratitude                            │
│ ✓ Contains "?" → Intent.QUESTION (confidence: 0.7)             │
│ Decision: Confidence < 0.8 → Trigger LLM fallback              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 2b: LLM Intent Classification (🤖 LLM #1 ~250ms)           │
│ Prompt: "Classify query into: GREETING, QUESTION, etc."        │
│ LLM Response: "INTENT: QUESTION, CONFIDENCE: 0.85"             │
│ Output: (Intent.QUESTION, 0.85)                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 3: Intent Routing (🔀 DECISION POINT)                      │
│ should_use_rag(Intent.QUESTION) → TRUE                         │
│ Decision: Use RAG pipeline (not conversational response)       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B1: Check Planning (🔀 DECISION)                           │
│ needs_planning(query, intent) → FALSE                          │
│ No multi-step keywords, single "?", not UNKNOWN                │
│ Decision: Continue with simple RAG (not planning)              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B2: Semantic Memory (⚙️ SYSTEM ~80ms)                      │
│ - Generate query embedding (Sentence Transformers ~50ms)       │
│ - Vector search in semantic_memory table (~30ms)               │
│ - Retrieved: 0 memories (new session)                          │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B3: Query Embedding (⚙️ SYSTEM ~50ms)                      │
│ Model: sentence-transformers/all-MiniLM-L6-v2 (local)          │
│ Input: "What are your business hours?"                         │
│ Output: [0.12, -0.34, 0.56, ...] (384-dim vector)             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B4: Adaptive Threshold (⚙️ SYSTEM ~1ms)                    │
│ Detect factual keywords: "hours" NOT in factual_keywords       │
│ Decision: Use default threshold = 0.5, top_k = 5               │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B5: Vector Search (⚙️ SYSTEM ~100ms)                       │
│ pgvector cosine similarity search in embeddings table          │
│ SQL: 1 - (embedding <=> query_embedding) > 0.5 LIMIT 5        │
│ Results: 3 documents (similarity: 0.87, 0.72, 0.65)           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B6: Re-Ranking (⚙️ SYSTEM ~5ms)                            │
│ No factual query → Skip re-ranking                             │
│ Keep results as-is                                              │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B7: Check Context (🔀 DECISION)                            │
│ relevant_docs.length = 3 → Context found!                      │
│ Decision: Continue to response generation                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B8-B10: Build Prompt (⚙️ SYSTEM ~20ms)                     │
│ - Format docs as "[Source 1] Our hours are..."                │
│ - Get conversation history (5 messages)                        │
│ - Fill RAG_SYSTEM_PROMPT template                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B11: LLM Response (🤖 LLM #2 ~1200ms)                      │
│ Prompt: "[Context] [History] Question: {query}"               │
│ LLM Output: "Our business hours are Monday to Friday..."      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B12: Validation (🤖 LLM #3 ~400ms)                         │
│ Prompt: "Evaluate response quality..."                         │
│ LLM Output: "ANSWERS_QUESTION: yes, IS_GROUNDED: yes,         │
│              CONFIDENCE: 0.92, RETRY: no"                      │
│ Validation: PASS (confidence: 0.92 > 0.7)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP B13: Retry Logic (SKIPPED - validation passed)            │
│ retry_count = 0, max_retries = 2                              │
│ Decision: No retry needed                                      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 15: Save Response (⚙️ SYSTEM ~15ms)                        │
│ INSERT INTO messages (role='assistant', content=response)      │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│ STEP 16: Return to User                                        │
│ {                                                               │
│   "response": "Our business hours are Monday to Friday...",   │
│   "sources": [{...}, {...}, {...}],                           │
│   "context_found": true,                                       │
│   "message_id": "uuid",                                        │
│   "validation": {"confidence": 0.92, "is_valid": true}        │
│ }                                                               │
└─────────────────────────────────────────────────────────────────┘

Total Time: ~2.1 seconds
LLM Calls: 3 (Intent, Response, Validation)
Database Queries: 4 (conversation, history, vector search, save)
```

---

**End of Process Flow Documentation**

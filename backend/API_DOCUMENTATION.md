# API Documentation - Agentic Chatbot System v2.0

**Version:** 2.0.0 (Agentic)
**Last Updated:** January 2025
**Base URL:** `http://localhost:8000` (development) | `https://your-domain.com` (production)

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [Public Endpoints](#public-endpoints)
6. [Protected Endpoints](#protected-endpoints)
7. [Agentic Features (v2.0)](#agentic-features-v20)
8. [Code Examples](#code-examples)

---

## Overview

The Agentic Chatbot System v2.0 provides a comprehensive AI-powered customer service platform with advanced capabilities:

- **RAG (Retrieval-Augmented Generation):** Knowledge base-powered responses
- **Multi-Step Planning:** Complex query decomposition and execution
- **Response Validation:** LLM-based quality assessment with automatic retry
- **Semantic Memory:** Long-term conversation context and fact storage
- **Tool Ecosystem:** Email, calendar, CRM, and web search integration
- **Self-Improvement:** Automated feedback analysis and parameter optimization

### API Format

All endpoints accept and return JSON unless otherwise specified.

**Request Headers:**
```http
Content-Type: application/json
Authorization: Bearer <token>  # For protected endpoints
```

**Response Format:**
```json
{
  "data": { ... },
  "error": null,
  "meta": {
    "version": "2.0.0",
    "timestamp": "2025-01-10T12:00:00Z"
  }
}
```

---

## Authentication

### Method: JWT (JSON Web Tokens)

**Algorithm:** HS256
**Token Expiry:** 60 minutes
**Storage:** Client-side (localStorage, sessionStorage, or memory)

### Login Endpoint

**POST** `/api/v1/auth/login`

Authenticate and receive access token.

**Request:**
```http
POST /api/v1/auth/login HTTP/1.1
Content-Type: application/x-www-form-urlencoded

username=admin@githaf.com&password=admin123
```

**Response 200 (Success):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Response 401 (Unauthorized):**
```json
{
  "detail": "Incorrect username or password"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@githaf.com&password=admin123"
```

### Using Authentication Token

Include token in `Authorization` header for protected endpoints:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/documents/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Rate Limiting

### Chat Endpoint Rate Limit

**Endpoint:** `/api/v1/chat/`
**Limit:** 10 requests per minute per IP address
**Window:** Rolling 60-second window

**Rate Limit Headers:**
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1704902400
```

**Response 429 (Rate Limit Exceeded):**
```json
{
  "detail": "Rate limit exceeded: 10 per 1 minute"
}
```

### Other Endpoints

All other endpoints have no rate limiting but require authentication (which provides inherent access control).

---

## Error Handling

### Standard Error Response Format

```json
{
  "detail": "Error message",
  "error_code": "ERROR_TYPE",
  "timestamp": "2025-01-10T12:00:00Z"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 204 | No Content | Successful deletion |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource does not exist |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | External service failure |

### Common Error Examples

**Validation Error (422):**
```json
{
  "detail": [
    {
      "loc": ["body", "message"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Authentication Error (401):**
```json
{
  "detail": "Could not validate credentials"
}
```

**Not Found Error (404):**
```json
{
  "detail": "Document not found"
}
```

---

## Public Endpoints

### Health Check

**GET** `/health`

Check API health and database connectivity.

**Authentication:** None required

**Response 200:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "database": "connected",
  "timestamp": "2025-01-10T12:00:00Z"
}
```

**cURL Example:**
```bash
curl http://localhost:8000/health
```

---

### Chat

**POST** `/api/v1/chat/`

Send a message to the chatbot and receive an AI-generated response.

**Authentication:** None required
**Rate Limit:** 10 requests/minute per IP

**Request Body:**
```json
{
  "message": "What services does Githaf Consulting offer?",
  "session_id": "optional-uuid-v4"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User query (1-2000 characters) |
| session_id | string | No | Session identifier (auto-generated if not provided) |

**Response 200:**
```json
{
  "response": "Githaf Consulting offers comprehensive business consulting services including...",
  "sources": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "Githaf Consulting specializes in strategic planning...",
      "similarity": 0.87
    }
  ],
  "context_found": true,
  "session_id": "a3f2e1d0-b9c8-4a7b-8e6d-5c4b3a2f1e0d",
  "message_id": "b4e3d2c1-a9b8-4c7d-9f8e-6d5c4b3a2e1f",
  "planned": false,
  "validation": {
    "is_valid": true,
    "confidence": 0.92,
    "issues": []
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| response | string | AI-generated response text |
| sources | array | Knowledge base chunks used (with similarity scores) |
| context_found | boolean | Whether relevant context was found |
| session_id | string | Conversation session identifier |
| message_id | string | Unique message identifier |
| planned | boolean | Whether multi-step planning was used (v2.0) |
| validation | object | Response validation metadata (v2.0) |

**Agentic v2.0 Features in Chat Response:**

When a complex query is detected, the system uses multi-step planning:

```json
{
  "response": "I found 3 available time slots on January 15th and sent confirmation email...",
  "planned": true,
  "plan": {
    "query": "Check my availability on Jan 15th and email the client",
    "goal": "Check calendar and send email",
    "actions": [
      {
        "type": "CHECK_CALENDAR",
        "params": {"date": "2025-01-15", "action": "check_availability"},
        "description": "Check available time slots"
      },
      {
        "type": "SEND_EMAIL",
        "params": {"to": "client@example.com", "subject": "Availability"},
        "description": "Send availability email"
      }
    ],
    "estimated_steps": 2,
    "complexity": "medium"
  },
  "validation": {
    "is_valid": true,
    "confidence": 0.95,
    "issues": [],
    "retry_recommended": false
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/chat/ \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your business hours?",
    "session_id": "test-session-123"
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('http://localhost:8000/api/v1/chat/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'What services do you offer?',
    session_id: localStorage.getItem('session_id') || null
  })
});

const data = await response.json();
console.log(data.response);
```

---

### Submit Feedback

**POST** `/api/v1/feedback/`

Submit user feedback on a chatbot response.

**Authentication:** None required

**Request Body:**
```json
{
  "message_id": "b4e3d2c1-a9b8-4c7d-9f8e-6d5c4b3a2e1f",
  "rating": 1,
  "comment": "Very helpful response!"
}
```

**Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message_id | uuid | Yes | Message being rated |
| rating | integer | Yes | 0 (thumbs down) or 1 (thumbs up) |
| comment | string | No | Optional feedback text (max 1000 chars) |

**Response 200:**
```json
{
  "success": true,
  "message": "Feedback recorded successfully"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/feedback/ \
  -H "Content-Type: application/json" \
  -d '{
    "message_id": "b4e3d2c1-a9b8-4c7d-9f8e-6d5c4b3a2e1f",
    "rating": 1,
    "comment": "Great answer!"
  }'
```

---

## Protected Endpoints

All endpoints below require JWT authentication.

### Documents

#### List Documents

**GET** `/api/v1/documents/`

Retrieve all knowledge base documents.

**Authentication:** Required
**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 100 | Max documents to return |
| offset | integer | 0 | Pagination offset |

**Response 200:**
```json
{
  "documents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "company_overview.pdf",
      "file_type": "pdf",
      "file_size": 245678,
      "storage_path": "documents/uuid/company_overview.pdf",
      "download_url": "https://...supabase.co/storage/...",
      "source_type": "upload",
      "source_url": null,
      "category": "general",
      "summary": "Overview of Githaf Consulting services and expertise...",
      "chunk_count": 15,
      "metadata": {},
      "created_at": "2025-01-10T10:30:00Z",
      "updated_at": "2025-01-10T10:30:00Z"
    }
  ],
  "total": 42
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/documents/?limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Get Single Document

**GET** `/api/v1/documents/{document_id}`

Retrieve a specific document by ID.

**Authentication:** Required

**Response 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "services_guide.pdf",
  "file_type": "pdf",
  "file_size": 532890,
  "storage_path": "documents/uuid/services_guide.pdf",
  "download_url": "https://...signed-url...",
  "source_type": "upload",
  "category": "services",
  "summary": "Detailed guide covering all consulting services...",
  "chunk_count": 28,
  "created_at": "2025-01-10T09:15:00Z"
}
```

**Response 404:**
```json
{
  "detail": "Document not found"
}
```

---

#### Upload Document

**POST** `/api/v1/documents/upload`

Upload a file to the knowledge base.

**Authentication:** Required
**Content-Type:** `multipart/form-data`

**Request (multipart/form-data):**
- `file`: Binary file (PDF, DOCX, or TXT)
- `category`: Optional category string

**Response 200:**
```json
{
  "success": true,
  "message": "Document uploaded and processed successfully",
  "document": {
    "id": "650e9500-f39c-52e5-b827-557766551111",
    "title": "new_document.pdf",
    "chunk_count": 12,
    "created_at": "2025-01-10T14:20:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "category=marketing"
```

**JavaScript Example (with FormData):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('category', 'general');

const response = await fetch('http://localhost:8000/api/v1/documents/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
```

---

#### Scrape URL

**POST** `/api/v1/documents/url`

Scrape content from a URL and add to knowledge base.

**Authentication:** Required
**Content-Type:** `application/x-www-form-urlencoded`

**Request:**
```http
POST /api/v1/documents/url HTTP/1.1
Content-Type: application/x-www-form-urlencoded
Authorization: Bearer YOUR_TOKEN

url=https://example.com/article&category=blog
```

**Response 200:**
```json
{
  "success": true,
  "message": "URL content scraped and processed successfully",
  "document": {
    "id": "750f0600-g49d-63f6-c938-668877662222",
    "title": "Article Title from Page",
    "source_url": "https://example.com/article",
    "chunk_count": 8,
    "created_at": "2025-01-10T15:00:00Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8000/api/v1/documents/url \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "url=https://example.com/blog-post&category=content"
```

---

#### Delete Document

**DELETE** `/api/v1/documents/{document_id}`

Delete a document and all its embeddings.

**Authentication:** Required

**Response 200:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

**Response 404:**
```json
{
  "detail": "Document not found"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:8000/api/v1/documents/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Conversations

#### List Conversations

**GET** `/api/v1/conversations/`

Retrieve all chat conversations.

**Authentication:** Required

**Response 200:**
```json
{
  "conversations": [
    {
      "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
      "session_id": "session-abc-123",
      "created_at": "2025-01-10T10:00:00Z",
      "last_message_at": "2025-01-10T10:15:00Z",
      "message_count": 8,
      "avg_rating": 0.75
    }
  ],
  "total": 156
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/conversations/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Get Conversation Details

**GET** `/api/v1/conversations/{conversation_id}`

Retrieve full conversation with all messages.

**Authentication:** Required

**Response 200:**
```json
{
  "id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
  "session_id": "session-abc-123",
  "created_at": "2025-01-10T10:00:00Z",
  "messages": [
    {
      "id": "m1n2o3p4-q5r6-7s8t-9u0v-w1x2y3z4a5b6",
      "role": "user",
      "content": "What services do you offer?",
      "created_at": "2025-01-10T10:00:00Z"
    },
    {
      "id": "c7d8e9f0-a1b2-3c4d-5e6f-7a8b9c0d1e2f",
      "role": "assistant",
      "content": "Githaf Consulting offers...",
      "context_used": {
        "sources": [...]
      },
      "created_at": "2025-01-10T10:00:05Z"
    }
  ]
}
```

---

### Analytics

#### Get Analytics Overview

**GET** `/api/v1/analytics/`

Retrieve comprehensive analytics metrics.

**Authentication:** Required

**Response 200:**
```json
{
  "conversation_metrics": {
    "total_conversations": 156,
    "total_messages": 892,
    "avg_messages_per_conversation": 5.7
  },
  "satisfaction_metrics": {
    "avg_satisfaction": 0.82,
    "response_rate": 0.65,
    "total_feedback": 234
  },
  "knowledge_base_metrics": {
    "total_documents": 42,
    "total_chunks": 856
  },
  "trending_queries": [
    {
      "query": "What services do you offer?",
      "count": 34
    },
    {
      "query": "How do I contact support?",
      "count": 28
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:8000/api/v1/analytics/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Get Flagged Queries

**GET** `/api/v1/analytics/flagged`

Retrieve low-rated responses for review.

**Authentication:** Required
**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| limit | integer | 20 | Max queries to return |

**Response 200:**
```json
[
  {
    "message_id": "x9y8z7w6-v5u4-3t2s-1r0q-p9o8n7m6l5k4",
    "conversation_id": "a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d",
    "query": "How much does service X cost?",
    "response": "I don't have pricing information available...",
    "rating": 0,
    "comment": "Not helpful - no pricing info",
    "created_at": "2025-01-10T11:30:00Z"
  }
]
```

---

#### Get Daily Statistics

**GET** `/api/v1/analytics/daily`

Retrieve daily conversation and satisfaction statistics.

**Authentication:** Required
**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | string (YYYY-MM-DD) | Yes | Start date for range |
| end_date | string (YYYY-MM-DD) | Yes | End date for range |

**Response 200:**
```json
{
  "daily_stats": [
    {
      "date": "2025-01-01",
      "conversations": 15,
      "messages": 87,
      "avg_satisfaction": 0.85
    },
    {
      "date": "2025-01-02",
      "conversations": 22,
      "messages": 134,
      "avg_satisfaction": 0.79
    }
  ]
}
```

**cURL Example:**
```bash
curl -X GET "http://localhost:8000/api/v1/analytics/daily?start_date=2025-01-01&end_date=2025-01-10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

#### Get Country Statistics

**GET** `/api/v1/analytics/countries`

Retrieve visitor statistics by country (requires IP tracking).

**Authentication:** Required
**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start_date | string (YYYY-MM-DD) | Yes | Start date for range |
| end_date | string (YYYY-MM-DD) | Yes | End date for range |

**Response 200:**
```json
{
  "country_stats": [
    {
      "country_code": "US",
      "country_name": "United States",
      "visitors": 145,
      "percentage": 42.5
    },
    {
      "country_code": "GB",
      "country_name": "United Kingdom",
      "visitors": 78,
      "percentage": 22.9
    }
  ]
}
```

---

### Users

#### List Users

**GET** `/api/v1/users/`

Retrieve all user accounts.

**Authentication:** Required

**Response 200:**
```json
[
  {
    "id": "u1s2e3r4-i5d6-7h8e-9r0e-a1b2c3d4e5f6",
    "email": "admin@githaf.com",
    "full_name": "Admin User",
    "is_active": true,
    "is_admin": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

#### Create User

**POST** `/api/v1/users/`

Create a new user account.

**Authentication:** Required

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "is_admin": false
}
```

**Response 200:**
```json
{
  "id": "n7e8w9u0-s1e2-3r4i-5d6h-7e8r9e0a1b2c",
  "email": "newuser@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_admin": false,
  "created_at": "2025-01-10T16:00:00Z"
}
```

---

#### Delete User

**DELETE** `/api/v1/users/{user_id}`

Delete a user account.

**Authentication:** Required

**Response 204:** No Content

---

### System Settings

#### Get System Settings

**GET** `/api/v1/settings/`

Retrieve global system configuration.

**Authentication:** Required

**Response 200:**
```json
{
  "defaultTheme": "dark",
  "allowThemeSwitching": true,
  "inheritHostTheme": true,
  "defaultLanguage": "en",
  "enabledLanguages": ["en", "fr", "de", "es", "ar"],
  "translateAIResponses": true,
  "enableRTL": true,
  "enableCountryTracking": true,
  "defaultDateRange": "30d",
  "enableWorldMap": true,
  "anonymizeIPs": true,
  "storeIPAddresses": false
}
```

---

#### Update System Settings

**PUT** `/api/v1/settings/`

Update global system configuration.

**Authentication:** Required

**Request Body:**
```json
{
  "defaultTheme": "light",
  "defaultLanguage": "fr",
  "enabledLanguages": ["en", "fr"],
  "anonymizeIPs": true
}
```

**Response 200:**
```json
{
  "defaultTheme": "light",
  "allowThemeSwitching": true,
  "defaultLanguage": "fr",
  "enabledLanguages": ["en", "fr"],
  "anonymizeIPs": true,
  ...
}
```

---

#### Reset System Settings

**POST** `/api/v1/settings/reset`

Reset all settings to default values.

**Authentication:** Required

**Response 200:**
```json
{
  "defaultTheme": "dark",
  "allowThemeSwitching": true,
  "defaultLanguage": "en",
  ...
}
```

---

## Agentic Features (v2.0)

### Phase 1: Observation Layer (Response Validation)

The system automatically validates LLM responses for quality and accuracy.

**Validation Criteria:**
- Does the response answer the user's question?
- Is the response grounded in provided sources?
- Are there any hallucinations or fabricated information?
- Confidence score (0.0-1.0)

**Automatic Retry:**
If validation confidence is below threshold (default: 0.7), the system automatically retries with adjusted parameters:
- Lower similarity threshold
- Expand search results
- Rephrase query

**Example Response with Validation:**
```json
{
  "response": "Githaf Consulting offers...",
  "validation": {
    "is_valid": true,
    "confidence": 0.92,
    "issues": [],
    "retry_recommended": false,
    "suggested_adjustment": null
  }
}
```

---

### Phase 2: Planning Layer (Multi-Step Execution)

Complex queries are automatically decomposed into sequential action plans.

**Triggers for Planning:**
- Multi-step keywords: "first...then", "also", "and then"
- Multiple questions in one query
- UNKNOWN intent classification

**Action Types:**
- `SEARCH_KNOWLEDGE` - Search knowledge base
- `GET_CONTACT_INFO` - Extract contact details
- `VALIDATE_DATA` - Validate formats (email, phone)
- `FORMAT_RESPONSE` - Structure final output
- `ASK_CLARIFICATION` - Request user input
- `SEND_EMAIL` - Send email (Phase 5)
- `CHECK_CALENDAR` - Calendar operations (Phase 5)
- `QUERY_CRM` - CRM operations (Phase 5)
- `CALL_API` - Web search (Phase 5)

**Example Planned Response:**
```json
{
  "response": "I found your contact information and sent a confirmation email.",
  "planned": true,
  "plan": {
    "query": "Find my email and send me a confirmation",
    "goal": "Retrieve contact info and send email",
    "actions": [
      {
        "type": "GET_CONTACT_INFO",
        "params": {"info_type": "email"},
        "description": "Extract user email from context"
      },
      {
        "type": "SEND_EMAIL",
        "params": {
          "to": "user@example.com",
          "subject": "Confirmation",
          "body": "Your request has been confirmed."
        },
        "description": "Send confirmation email"
      }
    ],
    "estimated_steps": 2,
    "complexity": "medium"
  }
}
```

---

### Phase 3: Self-Improvement Loop

The system continuously learns from user feedback and adjusts parameters.

**Weekly Learning Job:**
- Analyzes low-rated responses (rating=0)
- Identifies common failure patterns
- Detects knowledge gaps
- Adjusts RAG parameters (similarity threshold, top_k, temperature)

**Knowledge Gaps Identification:**
Queries with high volume but low satisfaction are flagged as knowledge gaps.

**Automatic Threshold Adjustment:**
```python
# Example adjustment based on feedback
{
  "similarity_threshold": 0.45,  # Lowered from 0.5
  "top_k": 7,                    # Increased from 5
  "temperature": 0.6             # Adjusted from 0.7
}
```

**Safety Bounds:**
- Similarity threshold: 0.3 - 0.8
- Top-k: 3 - 10
- Temperature: 0.3 - 1.0

---

### Phase 4: Advanced Memory

The system maintains long-term semantic memory across conversations.

**Semantic Memory Extraction:**
After each conversation, facts are extracted and stored with embeddings:

**Fact Categories:**
- `preference` - User preferences
- `request` - Specific requests
- `context` - Background information
- `followup` - Items requiring follow-up
- `problem` - Issues or problems
- `other` - General information

**Example Extracted Facts:**
```json
[
  {
    "content": "User prefers email communication over phone",
    "category": "preference",
    "confidence": 0.9
  },
  {
    "content": "User is interested in AI consulting services",
    "category": "context",
    "confidence": 0.85
  }
]
```

**Conversation Summarization:**
Long conversations are automatically summarized with:
- Main topic
- User intent
- Key points (array)
- Resolution status (resolved/partially_resolved/unresolved)
- Follow-up needed (boolean)
- Sentiment (positive/neutral/negative)

**Memory-Enhanced Responses:**
The system retrieves relevant memories before responding to queries, providing personalized context.

---

### Phase 5: Tool Ecosystem

The system integrates with external tools for advanced capabilities.

#### Available Tools

**1. Email Tool (`send_email`)**
```json
{
  "type": "SEND_EMAIL",
  "params": {
    "to": "recipient@example.com",
    "subject": "Meeting Confirmation",
    "body": "Your meeting is confirmed for Jan 15th.",
    "cc": ["manager@example.com"]
  }
}
```

**2. Calendar Tool (`check_calendar`)**
```json
{
  "type": "CHECK_CALENDAR",
  "params": {
    "action": "check_availability",
    "date": "2025-01-15",
    "duration_minutes": 60
  }
}
```

**3. CRM Tool (`query_crm`)**
```json
{
  "type": "QUERY_CRM",
  "params": {
    "action": "get_contact",
    "email": "client@example.com"
  }
}
```

**4. Web Search Tool (`web_search`)**
```json
{
  "type": "CALL_API",
  "params": {
    "tool": "web_search",
    "query": "latest AI trends 2025",
    "num_results": 5
  }
}
```

#### Tool Configuration

**Environment Variables:**
```bash
# Email Tool
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Web Search Tool
SEARCH_PROVIDER=duckduckgo  # or serpapi
SERPAPI_KEY=your-serpapi-key  # if using SerpAPI
```

---

## Code Examples

### Python Client

```python
import requests

class GithafChatbotClient:
    def __init__(self, base_url="http://localhost:8000", token=None):
        self.base_url = base_url
        self.token = token
        self.session_id = None

    def login(self, email, password):
        """Authenticate and get token"""
        response = requests.post(
            f"{self.base_url}/api/v1/auth/login",
            data={"username": email, "password": password}
        )
        response.raise_for_status()
        self.token = response.json()["access_token"]
        return self.token

    def chat(self, message):
        """Send a message to the chatbot"""
        response = requests.post(
            f"{self.base_url}/api/v1/chat/",
            json={
                "message": message,
                "session_id": self.session_id
            }
        )
        response.raise_for_status()
        data = response.json()
        self.session_id = data["session_id"]
        return data

    def submit_feedback(self, message_id, rating, comment=None):
        """Submit feedback on a response"""
        response = requests.post(
            f"{self.base_url}/api/v1/feedback/",
            json={
                "message_id": message_id,
                "rating": rating,
                "comment": comment
            }
        )
        response.raise_for_status()
        return response.json()

    def upload_document(self, file_path, category=None):
        """Upload a document to knowledge base"""
        headers = {"Authorization": f"Bearer {self.token}"}
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'category': category} if category else {}
            response = requests.post(
                f"{self.base_url}/api/v1/documents/upload",
                headers=headers,
                files=files,
                data=data
            )
        response.raise_for_status()
        return response.json()

    def get_analytics(self):
        """Get analytics overview"""
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.get(
            f"{self.base_url}/api/v1/analytics/",
            headers=headers
        )
        response.raise_for_status()
        return response.json()

# Usage example
client = GithafChatbotClient()

# Chat without authentication
response = client.chat("What services do you offer?")
print(response["response"])

# Admin operations require authentication
client.login("admin@githaf.com", "admin123")
analytics = client.get_analytics()
print(f"Total conversations: {analytics['conversation_metrics']['total_conversations']}")
```

---

### JavaScript/TypeScript Client

```typescript
class GithafChatbotClient {
  private baseUrl: string;
  private token: string | null = null;
  private sessionId: string | null = null;

  constructor(baseUrl: string = "http://localhost:8000") {
    this.baseUrl = baseUrl;
  }

  async login(email: string, password: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Login failed");

    const data = await response.json();
    this.token = data.access_token;
    return this.token;
  }

  async chat(message: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/chat/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        session_id: this.sessionId,
      }),
    });

    if (!response.ok) throw new Error("Chat request failed");

    const data = await response.json();
    this.sessionId = data.session_id;
    return data;
  }

  async submitFeedback(
    messageId: string,
    rating: 0 | 1,
    comment?: string
  ): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/v1/feedback/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message_id: messageId,
        rating,
        comment,
      }),
    });

    if (!response.ok) throw new Error("Feedback submission failed");
    return response.json();
  }

  async uploadDocument(file: File, category?: string): Promise<any> {
    if (!this.token) throw new Error("Authentication required");

    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);

    const response = await fetch(`${this.baseUrl}/api/v1/documents/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) throw new Error("Document upload failed");
    return response.json();
  }

  async getAnalytics(): Promise<any> {
    if (!this.token) throw new Error("Authentication required");

    const response = await fetch(`${this.baseUrl}/api/v1/analytics/`, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) throw new Error("Analytics request failed");
    return response.json();
  }
}

// Usage example
const client = new GithafChatbotClient();

// Chat without authentication
const response = await client.chat("What are your business hours?");
console.log(response.response);

// Submit feedback
await client.submitFeedback(response.message_id, 1, "Very helpful!");

// Admin operations
await client.login("admin@githaf.com", "admin123");
const analytics = await client.getAnalytics();
console.log(`Total conversations: ${analytics.conversation_metrics.total_conversations}`);
```

---

## Interactive API Documentation

### Swagger UI

Access interactive API documentation at:

**URL:** `http://localhost:8000/docs`

Features:
- Try out endpoints directly in browser
- View request/response schemas
- Test authentication
- See all available parameters

### ReDoc

Alternative documentation interface:

**URL:** `http://localhost:8000/redoc`

Features:
- Cleaner, print-friendly format
- Comprehensive schema documentation
- Search functionality

---

## Best Practices

### 1. Session Management

Always reuse `session_id` for continuity:

```javascript
// Store session_id in localStorage
const sessionId = localStorage.getItem('chat_session_id');
const response = await client.chat(message, sessionId);
localStorage.setItem('chat_session_id', response.session_id);
```

### 2. Error Handling

Always handle API errors gracefully:

```javascript
try {
  const response = await client.chat(message);
  displayResponse(response.response);
} catch (error) {
  if (error.response?.status === 429) {
    showError("Please wait a moment before sending another message");
  } else {
    showError("Sorry, something went wrong. Please try again.");
  }
}
```

### 3. Authentication Token Refresh

JWT tokens expire after 60 minutes. Implement token refresh:

```javascript
function isTokenExpired(token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return Date.now() >= payload.exp * 1000;
}

async function ensureValidToken() {
  const token = localStorage.getItem('access_token');
  if (!token || isTokenExpired(token)) {
    await client.login(email, password);
    localStorage.setItem('access_token', client.token);
  }
}
```

### 4. Feedback Collection

Encourage users to provide feedback:

```javascript
// Show feedback buttons for each response
function renderMessage(message) {
  return `
    <div class="message">
      <p>${message.response}</p>
      <div class="feedback">
        <button onclick="submitFeedback('${message.message_id}', 1)">👍</button>
        <button onclick="submitFeedback('${message.message_id}', 0)">👎</button>
      </div>
    </div>
  `;
}
```

---

## Support

For API support and questions:

- **Documentation:** This file
- **Interactive Docs:** http://localhost:8000/docs
- **Email:** support@githafconsulting.com
- **GitHub Issues:** https://github.com/your-repo/issues

---

**End of API Documentation**

*Last updated: January 2025 - Agentic Chatbot System v2.0*

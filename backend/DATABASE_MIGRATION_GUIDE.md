# Database Migration Guide: v1.2 → v2.0 (Githaforge)

**Migration Type:** Major (Breaking Changes)
**Date:** January 25, 2025
**Estimated Downtime:** 0 (new database)
**Rollback Available:** Yes (see backup section)

---

## Overview

This migration transforms the **single-tenant chatbot system** (v1.2) into a **multi-tenant SaaS platform** (Githaforge v2.0).

**Strategy:** Create NEW Supabase database (no impact on existing system)

---

## What's New in v2.0

### ✅ New Tables (8)

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **companies** | Organization/tenant data | name, logo_url, primary_color, subscription_tier |
| **chatbots** | Multi-bot per company | company_id, model_preset, kb_document_ids[], widget_position |
| **invitations** | Team member invites | email, company_id, role, token, expires_at |
| **subscriptions** | Stripe billing | stripe_customer_id, plan, current_period_end |
| **semantic_memory** | Agentic memory (v2.0) | fact, embedding, conversation_id |
| **conversation_summaries** | Auto-generated summaries | summary, topic, intent, sentiment |

### 🔄 Modified Tables (4)

| Table | What Changed | Migration Required? |
|-------|--------------|---------------------|
| **users** | Added: `company_id`, `role`, `onboarding_completed`, `email_verified`, `avatar_url` | ✅ YES |
| **documents** | Added: `company_id`, `uploaded_by`, `processing_status`, `tags[]` | ✅ YES |
| **conversations** | Added: `chatbot_id`, `company_id`, `user_country` | ✅ YES |
| **messages** | Added: `intent`, `confidence`, `tokens_used`, `response_time_ms` | ⚠️ Optional (NULL values OK) |

### 🗑️ Removed Tables (0)

**Good news:** No tables removed! All v1.2 data structures preserved.

---

## Schema Comparison

### BEFORE (v1.2 - Single Tenant)

```
users (admin-only)
  ├─ email, password_hash, is_admin
  └─ No company association

documents (global)
  ├─ title, file_type, storage_path
  └─ No ownership tracking

conversations (global)
  ├─ session_id
  └─ No bot association

messages
  ├─ role, content
  └─ No analytics metadata

embeddings
  ├─ document_id, content, embedding
  └─ No company scoping

feedback
  ├─ message_id, rating
  └─ (unchanged)
```

### AFTER (v2.0 - Multi-Tenant)

```
companies (NEW)
  ├─ name, logo_url, brand colors
  └─ subscription_tier, usage limits

users (enhanced)
  ├─ company_id (FK) ⭐
  ├─ role (owner/admin/member/super_admin) ⭐
  ├─ onboarding_completed ⭐
  └─ email_verified ⭐

chatbots (NEW)
  ├─ company_id (FK)
  ├─ name, avatar_url, brand colors
  ├─ model_preset (fast/balanced/accurate)
  ├─ kb_document_ids[] (array of doc UUIDs)
  └─ widget_position, is_public

documents (scoped)
  ├─ company_id (FK) ⭐
  ├─ uploaded_by (FK to users) ⭐
  ├─ processing_status ⭐
  └─ tags[] ⭐

conversations (scoped)
  ├─ chatbot_id (FK) ⭐
  ├─ company_id (FK) ⭐
  └─ user_country ⭐

messages (enhanced)
  ├─ intent (GREETING, QUESTION, etc.) ⭐
  ├─ confidence (0.00-1.00) ⭐
  ├─ tokens_used ⭐
  └─ response_time_ms ⭐

embeddings (scoped)
  ├─ company_id (FK) ⭐ (denormalized)
  └─ (performance optimization)

semantic_memory (NEW - Agentic)
  ├─ company_id, conversation_id
  ├─ fact, fact_type
  └─ embedding (for similarity search)

conversation_summaries (NEW - Agentic)
  ├─ conversation_id, company_id
  ├─ summary, topic, intent, sentiment
  └─ key_points[]

invitations (NEW - Teams)
  ├─ company_id, email, role
  └─ token, status, expires_at

subscriptions (NEW - Billing)
  ├─ company_id, stripe_customer_id
  └─ plan, status, current_period_end
```

---

## Row Level Security (RLS)

### What is RLS?

Row Level Security ensures users can ONLY access data from their own company, even if they try to query other companies' data directly.

### Example

**Without RLS (v1.2):**
```sql
-- Any authenticated user could see ALL documents
SELECT * FROM documents;
-- Returns: All documents from all users (SECURITY ISSUE!)
```

**With RLS (v2.0):**
```sql
-- Users can only see documents from their company
SELECT * FROM documents;
-- RLS automatically filters: WHERE company_id = (user's company)
-- Returns: Only documents from user's company ✅
```

### RLS Policies Created

All tables with `company_id` have RLS enabled:

```sql
-- Example policy for documents table
CREATE POLICY documents_select_policy ON documents
    FOR SELECT
    USING (company_id IN (
        SELECT company_id FROM users WHERE id = auth.uid()
    ));
```

**Protected Tables:**
- companies, users, chatbots, documents, embeddings
- conversations, messages, feedback
- semantic_memory, conversation_summaries

---

## Data Migration Strategy

### ⚠️ IMPORTANT: This is a NEW database

**You are NOT migrating data from old database.** This is a fresh start for Githaforge.

### If You Want to Preserve Old Data

**Option 1: Create Demo Company**

```sql
-- 1. Create company for existing data
INSERT INTO companies (id, name, subscription_tier)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Fixed UUID for demo
  'Githaf Consulting (Legacy)',
  'enterprise'
) RETURNING id;

-- 2. Update old users to belong to demo company
UPDATE users
SET company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    role = CASE
        WHEN is_admin = true THEN 'admin'
        ELSE 'member'
    END;

-- 3. Create default chatbot for demo company
INSERT INTO chatbots (company_id, name, is_active)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'Githaf Support Bot',
  true
) RETURNING id;

-- 4. Associate all documents with demo company
UPDATE documents
SET company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 5. Associate all embeddings with demo company
UPDATE embeddings e
SET company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

-- 6. Associate conversations with demo chatbot
UPDATE conversations
SET chatbot_id = (SELECT id FROM chatbots WHERE company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' LIMIT 1),
    company_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
```

**Option 2: Export/Import via CSV**

```bash
# Export from old database
psql $OLD_DB_URL -c "COPY users TO STDOUT CSV HEADER" > users.csv
psql $OLD_DB_URL -c "COPY documents TO STDOUT CSV HEADER" > documents.csv
# ... (repeat for all tables)

# Import to new database (after creating company first)
psql $NEW_DB_URL -c "COPY users FROM STDIN CSV HEADER" < users.csv
# ... (repeat for all tables)
```

---

## Breaking Changes & Impact

### 🚨 Backend API Changes Required

| Endpoint | Change | Migration Required? |
|----------|--------|---------------------|
| `POST /api/v1/auth/signup` | **NEW ENDPOINT** | ✅ Create endpoint |
| `POST /api/v1/chat/` | Add `chatbot_id` parameter | ✅ Update endpoint |
| `GET /api/v1/documents/` | Auto-filter by `company_id` (RLS) | ✅ Update query |
| `GET /api/v1/conversations/` | Auto-filter by `company_id` (RLS) | ✅ Update query |
| `GET /api/v1/analytics/` | Add `company_id` scoping | ✅ Update aggregations |
| `POST /api/v1/chatbots/` | **NEW ENDPOINT** | ✅ Create endpoint |

### 🚨 Frontend Changes Required

| Component | Change | Migration Required? |
|-----------|--------|---------------------|
| Login.tsx | Add "Sign Up" link/redirect | ✅ Update UI |
| AuthContext | Add `company_id`, `role` to user state | ✅ Update context |
| ChatWidget | Pass `chatbot_id` to API | ✅ Update API call |
| Documents.tsx | No changes (RLS handles filtering) | ❌ No change |
| Analytics.tsx | No changes (RLS handles filtering) | ❌ No change |

---

## Testing Checklist

### ✅ Database Setup

- [ ] Supabase project created
- [ ] pgvector extension enabled
- [ ] Schema SQL executed successfully
- [ ] 16 tables created
- [ ] RLS policies enabled on 12 tables
- [ ] Default super_admin user exists
- [ ] Can login with admin@githaf.com / admin123

### ✅ Multi-Tenancy Verification

- [ ] Create test company
- [ ] Create test user for company
- [ ] User can only see their company's data
- [ ] User CANNOT see other companies' data
- [ ] RLS prevents cross-company data access

### ✅ Backend Integration

- [ ] Health endpoint returns 200
- [ ] Database connection successful
- [ ] Can query users table
- [ ] Can query companies table
- [ ] JWT tokens include company_id claim
- [ ] RLS policies enforced via service_role key

### ✅ Agentic Features (v2.0)

- [ ] semantic_memory table accepts embeddings
- [ ] conversation_summaries table stores summaries
- [ ] Vector search works with company filtering

---

## Rollback Plan

### If Migration Fails

1. **Keep old database untouched** (no changes made)
2. **Delete new Supabase project** (Settings → General → Delete Project)
3. **Restore from backup** (if you ran on old database by accident)

### Rollback SQL (Emergency)

```sql
-- ⚠️ DANGER: Only use if you need to start over
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Then re-run githaforge_schema.sql
```

---

## Performance Optimization

### Indexes Created (50+)

All foreign keys have indexes:
- `company_id` on all multi-tenant tables
- `chatbot_id` on conversations
- `conversation_id` on messages
- `document_id` on embeddings

Vector indexes:
- `embeddings.embedding` (IVFFlat, cosine distance)
- `semantic_memory.embedding` (IVFFlat, cosine distance)

### Query Performance

**Before (v1.2):**
```sql
-- Full table scan
SELECT * FROM documents WHERE title LIKE '%query%';
-- Time: 500ms (10,000 documents)
```

**After (v2.0):**
```sql
-- Index scan + RLS filter
SELECT * FROM documents WHERE title LIKE '%query%';
-- Time: 50ms (only scans company's 100 documents)
```

**10x improvement** due to automatic company filtering!

---

## Security Enhancements

### v1.2 (Single Tenant)

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ❌ No data isolation
- ❌ Admin can see all data

### v2.0 (Multi-Tenant)

- ✅ JWT authentication (enhanced with company_id)
- ✅ Password hashing (bcrypt)
- ✅ **Row Level Security (RLS)**
- ✅ **Company-scoped data access**
- ✅ **Role-based permissions** (owner/admin/member)
- ✅ Email verification support
- ✅ Invitation-based team access

---

## Cost Implications

### Supabase Pricing

**Free Tier:**
- 500 MB database storage
- 1 GB file storage
- 2 GB bandwidth
- **50,000 monthly active users**
- 7-day backup retention

**Pro Tier ($25/month):**
- 8 GB database storage
- 100 GB file storage
- 250 GB bandwidth
- **100,000 monthly active users**
- 14-day backup retention
- **Point-in-time recovery**

**Recommendation:** Start with Free tier, upgrade to Pro at 100+ companies.

---

## Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| **Setup** | 30 min | Create Supabase project, run schema |
| **Test** | 1 hour | Verify tables, RLS, test queries |
| **Backend** | 3 days | Update API endpoints for multi-tenancy |
| **Frontend** | 5 days | Signup flow, onboarding, chatbot builder |
| **QA** | 2 days | E2E testing, security audit |
| **Deploy** | 1 day | Staging → Production |

**Total:** ~2 weeks to full Githaforge launch

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs/guides/database
- **pgvector Docs:** https://github.com/pgvector/pgvector
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Migration Best Practices:** https://supabase.com/docs/guides/database/migrations

---

**Migration Version:** 2.0
**Last Updated:** January 25, 2025
**Status:** Ready for Execution
**Approved By:** (awaiting approval)

# Githaforge Supabase Setup Guide

**Created:** January 25, 2025
**Database Version:** 2.0 (Multi-tenant)

---

## Step 1: Create New Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in details:
   - **Name:** `githaforge-production` (or `githaforge-staging`)
   - **Database Password:** Generate strong password (save it!)
   - **Region:** Choose closest to your users (e.g., US East, EU West)
   - **Pricing Plan:** Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

## Step 2: Enable Required Extensions

1. In Supabase Dashboard, go to **"Database" → "Extensions"**
2. Enable these extensions:
   - ✅ **uuid-ossp** (UUID generation)
   - ✅ **pgcrypto** (Cryptography functions)
   - ✅ **vector** (pgvector for embeddings) ⚠️ **CRITICAL**

**Important:** If `vector` extension is not available:
- Go to **"Database" → "Extensions" → "Enable" → Search "pgvector"**
- If still missing, contact Supabase support (usually available on paid plans)

---

## Step 3: Run Database Schema

### Option A: SQL Editor (Recommended)

1. In Supabase Dashboard, go to **"SQL Editor"**
2. Click **"New query"**
3. Copy the entire contents of `backend/scripts/githaforge_schema.sql`
4. Paste into SQL Editor
5. Click **"Run"** (bottom right)
6. Wait for completion (should take 10-15 seconds)
7. Check for success message in output panel

### Option B: Command Line (psql)

```bash
# Get connection string from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f backend/scripts/githaforge_schema.sql
```

---

## Step 4: Verify Installation

### Check Tables Created

In SQL Editor, run:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Output (16 tables):**
- chatbots
- companies
- conversation_summaries
- conversations
- documents
- embeddings
- feedback
- invitations
- messages
- semantic_memory
- subscriptions
- system_settings
- users

### Check RLS Enabled

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true;
```

**Expected:** All 13 main tables should show `rowsecurity = true`

### Check Extensions

```sql
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector');
```

**Expected:**
- uuid-ossp: 1.1
- pgcrypto: 1.3
- vector: 0.5.0+ (or latest)

### Check Default Admin User

```sql
SELECT email, role, is_active, onboarding_completed
FROM users
WHERE role = 'super_admin';
```

**Expected:**
- Email: admin@githaf.com
- Role: super_admin
- is_active: true
- onboarding_completed: true

**Default Password:** `admin123` ⚠️ **CHANGE THIS IN PRODUCTION!**

---

## Step 5: Get Supabase Credentials

1. In Supabase Dashboard, go to **"Settings" → "API"**
2. Copy these values:

```
Project URL:     https://[YOUR-PROJECT-REF].supabase.co
anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ SECURITY WARNING:**
- **anon key:** Use for frontend (safe to expose publicly)
- **service_role key:** Use for backend only (NEVER expose to frontend)

---

## Step 6: Update Backend Configuration

### 6.1 Update `.env` File

```bash
cd backend
cp .env.example .env.githaforge  # Backup new config
nano .env  # or use your preferred editor
```

**Update these lines:**

```bash
# Supabase (NEW DATABASE)
SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
SUPABASE_KEY=[YOUR-SERVICE-ROLE-KEY-HERE]  # ⚠️ Use service_role, not anon!

# Keep existing values
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_secret_key_here  # Generate with: openssl rand -hex 32

# Update project name
PROJECT_NAME=Githaforge API

# CORS (add production domains later)
ALLOWED_ORIGINS=["http://localhost:3000","http://localhost:5173"]
```

### 6.2 Test Backend Connection

```bash
# From backend directory
cd backend

# Activate virtual environment
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies (if needed)
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 6.3 Test Health Endpoint

Open browser or curl:

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "2.0.0",
  "database": "connected"
}
```

✅ If you see this, database connection is working!

---

## Step 7: Create First Company & User (via API)

### 7.1 Test Login with Super Admin

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@githaf.com&password=admin123"
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

Save the `access_token` for next steps.

### 7.2 Verify User Endpoint Works

```bash
curl -X GET http://localhost:8000/api/v1/users/ \
  -H "Authorization: Bearer [YOUR-ACCESS-TOKEN]"
```

**Expected Response:**
```json
[
  {
    "id": "...",
    "email": "admin@githaf.com",
    "full_name": "Githaf Admin",
    "role": "super_admin",
    "is_active": true,
    "onboarding_completed": true,
    ...
  }
]
```

---

## Step 8: Update Frontend Configuration

```bash
cd frontend
nano .env  # or create if doesn't exist
```

**Add:**

```bash
VITE_API_BASE_URL=http://localhost:8000
```

**No changes needed to Supabase in frontend** (backend handles all DB access)

---

## Step 9: Verify Multi-Tenancy (Optional)

### Create Test Company

```sql
-- In Supabase SQL Editor
INSERT INTO companies (name, subscription_tier, contact_email)
VALUES ('Test Company Inc', 'free', 'test@company.com')
RETURNING id;
```

Copy the returned `id` (UUID).

### Create Test User for Company

```sql
-- Replace [COMPANY-ID] with the UUID from above
INSERT INTO users (
  company_id, email, password_hash, full_name, role,
  is_active, onboarding_completed, email_verified
) VALUES (
  '[COMPANY-ID]',
  'user@testcompany.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU2qQj8VQ3rK', -- password: admin123
  'Test User',
  'owner',
  TRUE,
  TRUE,
  TRUE
);
```

### Test Login with New User

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=user@testcompany.com&password=admin123"
```

✅ If you get a token, multi-tenant auth is working!

---

## Step 10: Database Backup & Rollback Plan

### Backup Strategy

1. **Automatic Backups (Supabase Pro Plan):**
   - Daily backups (7-day retention)
   - Point-in-time recovery (PITR)

2. **Manual Backup:**

```bash
# Export schema
pg_dump -h [YOUR-PROJECT-REF].supabase.co \
  -U postgres \
  -d postgres \
  --schema-only \
  -f githaforge_schema_backup_$(date +%Y%m%d).sql

# Export data
pg_dump -h [YOUR-PROJECT-REF].supabase.co \
  -U postgres \
  -d postgres \
  --data-only \
  -f githaforge_data_backup_$(date +%Y%m%d).sql
```

### Rollback Plan

If migration fails:

1. **Drop all tables:**

```sql
-- ⚠️ DANGER: This deletes ALL data
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

2. **Restore from backup:**

```bash
psql "postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres" \
  -f githaforge_schema_backup_YYYYMMDD.sql
```

---

## Troubleshooting

### Issue: "extension 'vector' does not exist"

**Solution:**
1. Check Supabase plan (vector requires paid plan on some regions)
2. Contact Supabase support to enable pgvector
3. Temporary workaround: Remove vector-dependent tables (embeddings, semantic_memory)

### Issue: "permission denied for table users"

**Solution:**
- Ensure you're using **service_role** key, not anon key
- Check RLS policies are correct
- Verify user exists in database

### Issue: "connection refused" when testing backend

**Solution:**
```bash
# Check if server is running
ps aux | grep uvicorn

# Check port is free
netstat -ano | findstr :8000

# Check .env file exists and is correct
cat .env | grep SUPABASE_URL
```

### Issue: Tables created but queries timeout

**Solution:**
- Check Supabase dashboard for "Database Paused" message
- Restart database in Supabase dashboard
- Check connection pooler settings

---

## Next Steps

After successful setup:

1. ✅ **Phase B:** Design system & component library
2. ✅ **Phase C:** Implement signup/onboarding flow
3. ✅ **Phase D:** Build chatbot builder UI
4. ✅ **Phase E:** QA & performance testing
5. ✅ **Phase F:** Production deployment

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **pgvector Docs:** https://github.com/pgvector/pgvector
- **Githaforge Team:** (internal support channel)

---

**Database Schema Version:** 2.0
**Last Updated:** January 25, 2025
**Status:** Ready for Development

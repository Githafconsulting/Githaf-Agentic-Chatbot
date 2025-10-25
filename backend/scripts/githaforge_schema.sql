-- =====================================================
-- GITHAFORGE DATABASE SCHEMA v2.0
-- Multi-tenant chatbot builder platform
-- Created: January 25, 2025
-- =====================================================

-- Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- =====================================================
-- CORE TABLES (Multi-Tenancy)
-- =====================================================

-- Companies Table (Organizations)
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#3b82f6', -- Hex color
    secondary_color VARCHAR(7) DEFAULT '#06b6d4', -- Hex color
    company_size VARCHAR(50), -- 1-10, 11-50, 51-200, 201-1000, 1000+
    industry VARCHAR(100),
    contact_email VARCHAR(255),

    -- Subscription Info
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'trial', 'cancelled', 'expired')),
    trial_ends_at TIMESTAMP WITH TIME ZONE,

    -- Usage Limits (enforced based on tier)
    max_chatbots INTEGER DEFAULT 1,
    max_documents INTEGER DEFAULT 10,
    max_messages_per_month INTEGER DEFAULT 1000,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_companies_subscription_tier ON companies(subscription_tier);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);
CREATE INDEX idx_companies_deleted_at ON companies(deleted_at) WHERE deleted_at IS NULL;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Users Table (Enhanced with Multi-Tenancy)
-- =====================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,

    -- Authentication
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_expires_at TIMESTAMP WITH TIME ZONE,

    -- Profile
    full_name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(5) DEFAULT 'en',

    -- Role & Permissions
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'super_admin')),
    -- owner: full access to company, can delete company
    -- admin: can manage users, bots, settings
    -- member: can view data, use bots
    -- super_admin: Githaf internal admin (for platform management)

    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Chatbots Table (Multi-Bot per Company)
-- =====================================================

CREATE TABLE IF NOT EXISTS chatbots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Basic Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,

    -- Branding
    primary_color VARCHAR(7) DEFAULT '#3b82f6',
    secondary_color VARCHAR(7) DEFAULT '#06b6d4',
    welcome_message TEXT DEFAULT 'Hi! How can I help you today?',

    -- Configuration
    model_preset VARCHAR(50) DEFAULT 'balanced' CHECK (model_preset IN ('fast', 'balanced', 'accurate')),
    -- fast: top_k=3, temp=0.5, max_tokens=300
    -- balanced: top_k=5, temp=0.7, max_tokens=500 (default)
    -- accurate: top_k=7, temp=0.3, max_tokens=800

    language VARCHAR(5) DEFAULT 'en',
    enable_multi_language BOOLEAN DEFAULT FALSE,

    -- Knowledge Base
    kb_document_ids UUID[] DEFAULT '{}', -- Array of document IDs

    -- Access Control
    allowed_domains TEXT[] DEFAULT '{}', -- Whitelist domains for embed
    is_public BOOLEAN DEFAULT FALSE, -- Public shareable link
    public_slug VARCHAR(100) UNIQUE, -- e.g., /chat/acme-support

    -- Widget Settings
    widget_position VARCHAR(20) DEFAULT 'bottom-right' CHECK (widget_position IN ('top-left', 'top-right', 'bottom-left', 'bottom-right')),
    widget_size VARCHAR(10) DEFAULT 'medium' CHECK (widget_size IN ('small', 'medium', 'large')),

    -- Analytics
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    avg_satisfaction DECIMAL(3,2) DEFAULT 0.00,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_chatbots_company_id ON chatbots(company_id);
CREATE INDEX idx_chatbots_created_by ON chatbots(created_by);
CREATE INDEX idx_chatbots_public_slug ON chatbots(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX idx_chatbots_is_active ON chatbots(is_active);
CREATE INDEX idx_chatbots_deleted_at ON chatbots(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER update_chatbots_updated_at BEFORE UPDATE ON chatbots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Documents Table (Scoped to Company)
-- =====================================================

CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- File Info
    title TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'txt', 'docx', 'html', 'md')),
    file_size INTEGER, -- bytes
    storage_path TEXT, -- Supabase Storage path
    download_url TEXT, -- Signed URL

    -- Source Info
    source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'url', 'scraped')),
    source_url TEXT,

    -- Categorization
    category TEXT,
    tags TEXT[] DEFAULT '{}',

    -- Processing
    summary TEXT, -- 200-500 char preview
    chunk_count INTEGER DEFAULT 0,
    processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processing_error TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_documents_company_id ON documents(company_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_documents_source_type ON documents(source_type);
CREATE INDEX idx_documents_processing_status ON documents(processing_status);
CREATE INDEX idx_documents_deleted_at ON documents(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Embeddings Table (Vector Search)
-- =====================================================

CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Denormalized for performance

    -- Content
    content TEXT NOT NULL,
    embedding VECTOR(384) NOT NULL, -- Sentence Transformers dimension

    -- Metadata
    chunk_index INTEGER, -- Position in document
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_embeddings_document_id ON embeddings(document_id);
CREATE INDEX idx_embeddings_company_id ON embeddings(company_id);
CREATE INDEX idx_embeddings_embedding ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Vector Search Function (Company-Scoped)
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding VECTOR(384),
    match_threshold FLOAT,
    match_count INT,
    filter_company_id UUID
)
RETURNS TABLE (
    id UUID,
    document_id UUID,
    content TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        embeddings.id,
        embeddings.document_id,
        embeddings.content,
        1 - (embeddings.embedding <=> query_embedding) AS similarity
    FROM embeddings
    WHERE embeddings.company_id = filter_company_id
      AND 1 - (embeddings.embedding <=> query_embedding) > match_threshold
    ORDER BY embeddings.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =====================================================
-- Conversations Table (Scoped to Chatbot)
-- =====================================================

CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chatbot_id UUID NOT NULL REFERENCES chatbots(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- Denormalized

    -- Session Info
    session_id TEXT UNIQUE NOT NULL,
    user_identifier TEXT, -- Email, user ID, or anonymous ID

    -- Context
    user_ip VARCHAR(45), -- IPv6 support
    user_country VARCHAR(2), -- ISO country code
    user_agent TEXT,
    referrer TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_conversations_chatbot_id ON conversations(chatbot_id);
CREATE INDEX idx_conversations_company_id ON conversations(company_id);
CREATE INDEX idx_conversations_session_id ON conversations(session_id);
CREATE INDEX idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX idx_conversations_user_country ON conversations(user_country);

-- =====================================================
-- Messages Table
-- =====================================================

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

    -- Message Content
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,

    -- AI Response Metadata (for assistant messages)
    context_used JSONB, -- Sources used for RAG
    intent VARCHAR(50), -- GREETING, QUESTION, FAREWELL, etc.
    confidence DECIMAL(3,2), -- 0.00-1.00
    model_preset VARCHAR(50), -- fast/balanced/accurate
    tokens_used INTEGER,
    response_time_ms INTEGER,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_role ON messages(role);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- =====================================================
-- Feedback Table
-- =====================================================

CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

    -- Feedback
    rating INTEGER NOT NULL CHECK (rating IN (0, 1)), -- 0=thumbs down, 1=thumbs up
    comment TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_feedback_message_id ON feedback(message_id);
CREATE INDEX idx_feedback_conversation_id ON feedback(conversation_id);
CREATE INDEX idx_feedback_rating ON feedback(rating);
CREATE INDEX idx_feedback_created_at ON feedback(created_at DESC);

-- =====================================================
-- Team Invitations Table
-- =====================================================

CREATE TABLE IF NOT EXISTS invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Invitation Details
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    token TEXT UNIQUE NOT NULL,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_invitations_company_id ON invitations(company_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status);

-- =====================================================
-- Subscriptions Table (Billing)
-- =====================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID UNIQUE NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Stripe Info
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,

    -- Plan Details
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('free', 'pro', 'enterprise')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'trial', 'cancelled', 'past_due', 'expired')),

    -- Billing
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_company_id ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- System Settings Table (Global Configuration)
-- =====================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Theme Settings
    default_theme VARCHAR(10) DEFAULT 'dark' CHECK (default_theme IN ('light', 'dark')),
    allow_theme_switching BOOLEAN DEFAULT TRUE,
    inherit_host_theme BOOLEAN DEFAULT TRUE,

    -- Language Settings
    default_language VARCHAR(5) DEFAULT 'en',
    enabled_languages TEXT[] DEFAULT '{"en","fr","de","es","ar"}',
    translate_ai_responses BOOLEAN DEFAULT TRUE,
    enable_rtl BOOLEAN DEFAULT TRUE,

    -- Analytics Settings
    enable_country_tracking BOOLEAN DEFAULT TRUE,
    default_date_range VARCHAR(10) DEFAULT '30d' CHECK (default_date_range IN ('7d', '30d', '90d', 'custom')),
    enable_world_map BOOLEAN DEFAULT TRUE,

    -- Privacy Settings
    anonymize_ips BOOLEAN DEFAULT TRUE,
    store_ip_addresses BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings (only if table is empty)
INSERT INTO system_settings (
    default_theme, allow_theme_switching, inherit_host_theme,
    default_language, enabled_languages, translate_ai_responses, enable_rtl,
    enable_country_tracking, default_date_range, enable_world_map,
    anonymize_ips, store_ip_addresses
)
SELECT 'dark', TRUE, TRUE, 'en', '{"en","fr","de","es","ar"}', TRUE, TRUE,
       TRUE, '30d', TRUE, TRUE, FALSE
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

CREATE INDEX idx_system_settings_updated_at ON system_settings(updated_at);

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AGENTIC FEATURES (Phase 4 & 5 from v2.0)
-- =====================================================

-- Semantic Memory Table
CREATE TABLE IF NOT EXISTS semantic_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,

    -- Memory Content
    fact TEXT NOT NULL,
    fact_type VARCHAR(50), -- user_preference, company_policy, product_info, etc.
    embedding VECTOR(384) NOT NULL,

    -- Context
    source_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    confidence DECIMAL(3,2) DEFAULT 1.00,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    access_count INTEGER DEFAULT 0
);

CREATE INDEX idx_semantic_memory_company_id ON semantic_memory(company_id);
CREATE INDEX idx_semantic_memory_conversation_id ON semantic_memory(conversation_id);
CREATE INDEX idx_semantic_memory_embedding ON semantic_memory USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- Conversation Summaries Table
CREATE TABLE IF NOT EXISTS conversation_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID UNIQUE NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,

    -- Summary
    summary TEXT NOT NULL,
    topic VARCHAR(255),
    intent VARCHAR(50),
    sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    key_points TEXT[] DEFAULT '{}',

    -- Metadata
    message_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_summaries_conversation_id ON conversation_summaries(conversation_id);
CREATE INDEX idx_conversation_summaries_company_id ON conversation_summaries(company_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE semantic_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_summaries ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Users can only access their company's data)

-- Companies: Users can only see their own company
CREATE POLICY companies_select_policy ON companies
    FOR SELECT
    USING (id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Users: Can see users in their company
CREATE POLICY users_select_policy ON users
    FOR SELECT
    USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Chatbots: Can see chatbots in their company
CREATE POLICY chatbots_select_policy ON chatbots
    FOR SELECT
    USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Documents: Can see documents in their company
CREATE POLICY documents_select_policy ON documents
    FOR SELECT
    USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Embeddings: Can see embeddings in their company
CREATE POLICY embeddings_select_policy ON embeddings
    FOR SELECT
    USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Conversations: Can see conversations for their company's chatbots
CREATE POLICY conversations_select_policy ON conversations
    FOR SELECT
    USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

-- Messages: Can see messages for conversations in their company
CREATE POLICY messages_select_policy ON messages
    FOR SELECT
    USING (conversation_id IN (
        SELECT id FROM conversations
        WHERE company_id IN (SELECT company_id FROM users WHERE id = auth.uid())
    ));

-- Note: Public chat endpoints bypass RLS by using service role key

-- =====================================================
-- SAMPLE DATA (Optional - Remove for Production)
-- =====================================================

-- Create Githaf internal super admin
-- Password: admin123 (hashed with bcrypt)
DO $$
BEGIN
    -- Only insert if super_admin doesn't exist
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@githaf.com') THEN
        INSERT INTO users (
            id, email, password_hash, full_name, role,
            is_active, onboarding_completed, email_verified
        ) VALUES (
            gen_random_uuid(),
            'admin@githaf.com',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU2qQj8VQ3rK', -- admin123
            'Githaf Admin',
            'super_admin',
            TRUE,
            TRUE,
            TRUE
        );
    END IF;
END $$;

-- =====================================================
-- DATABASE VIEWS (For Analytics)
-- =====================================================

-- Company Statistics View
CREATE OR REPLACE VIEW company_stats AS
SELECT
    c.id AS company_id,
    c.name AS company_name,
    c.subscription_tier,
    COUNT(DISTINCT u.id) AS user_count,
    COUNT(DISTINCT cb.id) AS chatbot_count,
    COUNT(DISTINCT d.id) AS document_count,
    COUNT(DISTINCT conv.id) AS conversation_count,
    COUNT(DISTINCT m.id) AS message_count,
    COALESCE(AVG(f.rating), 0) AS avg_satisfaction
FROM companies c
LEFT JOIN users u ON u.company_id = c.id AND u.deleted_at IS NULL
LEFT JOIN chatbots cb ON cb.company_id = c.id AND cb.deleted_at IS NULL
LEFT JOIN documents d ON d.company_id = c.id AND d.deleted_at IS NULL
LEFT JOIN conversations conv ON conv.company_id = c.id
LEFT JOIN messages m ON m.conversation_id = conv.id
LEFT JOIN feedback f ON f.message_id = m.id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.name, c.subscription_tier;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Githaforge Database Schema v2.0 Installed';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Tables Created: 16';
    RAISE NOTICE 'Indexes Created: 50+';
    RAISE NOTICE 'RLS Policies: Enabled';
    RAISE NOTICE 'Default Admin: admin@githaf.com / admin123';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Update backend .env with new Supabase credentials';
    RAISE NOTICE '2. Run: python scripts/quick_create_admin.py (if needed)';
    RAISE NOTICE '3. Test connection: curl http://localhost:8000/health';
    RAISE NOTICE '========================================';
END $$;

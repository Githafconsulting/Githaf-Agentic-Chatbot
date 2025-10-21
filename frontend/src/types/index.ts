// API Response Types
export interface ChatMessage {
  id?: string;
  message: string;
  response?: string;
  session_id: string;
  timestamp?: string;
  is_user?: boolean;
  sources?: Source[];
}

export interface Source {
  id: string;
  content: string;
  similarity: number;
}

export interface ChatResponse {
  response: string;
  sources: Source[];
  context_found: boolean;
  session_id: string;
  message_id?: string;
}

export interface Conversation {
  id: string;
  session_id: string;
  created_at: string;  // When conversation started
  last_message_at: string;  // When last message was sent
  ended_at?: string;  // When user closed chatbot window (optional - may be null if still open)
  message_count?: number;  // Optional - may not be returned by backend
  avg_rating?: number;  // Optional - may not be returned by backend
}

export interface Message {
  id: string;
  conversation_id: string;
  user_message: string;
  bot_response: string;
  created_at: string;
  rating?: number;
  feedback_comment?: string;
}

// New interface for messages in conversation details (from backend)
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  context_used?: Record<string, any>;
  created_at: string;
}

export interface Document {
  id: string;
  title: string;
  file_type: string;  // pdf, txt, docx, html, webpage
  file_size?: number;  // Size in bytes
  storage_path?: string;  // Path in Supabase Storage
  download_url?: string;  // Signed download URL
  source_type: 'upload' | 'url' | 'scraped';
  source_url?: string;  // Original URL if from web
  category?: string;  // Optional category
  summary?: string;  // 200-500 char summary (NOT full content)
  chunk_count: number;  // Number of embeddings
  metadata?: Record<string, any>;  // Additional metadata
  created_at: string;
  updated_at?: string;
}

export interface Analytics {
  conversation_metrics: {
    total_conversations: number;
    total_messages: number;
    avg_messages_per_conversation: number;
    avg_conversation_duration_seconds: number;
    avg_active_chat_time_seconds: number;
  };
  satisfaction_metrics: {
    avg_satisfaction: number;
    feedback_rate: number;
    total_feedback: number;
  };
  knowledge_base_metrics: {
    total_documents: number;
    total_chunks: number;
  };
  trending_queries: Array<{
    intent: string;
    query: string;
    count: number;
    sample_queries: string[];
  }>;
  last_updated?: string;
}

export interface TrendingQuery {
  intent: string;
  query: string;
  count: number;
  sample_queries: string[];
}

export interface KnowledgeBaseStats {
  total_documents: number;
  total_chunks: number;
  last_updated: string;
}

export interface FlaggedQuery {
  feedback_id: string;  // Actual feedback ID for soft-delete operations
  message_id: string;
  conversation_id?: string;
  query: string;  // Backend returns 'query', not 'user_query'
  response: string;  // Backend returns 'response', not 'bot_response'
  rating: number;
  comment?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;  // OAuth2 expects 'username', not 'email'
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Feedback {
  message_id: string;
  rating: number;
  comment?: string;
}

export interface WidgetConfig {
  id?: string;
  apiUrl: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  primaryColor: string;
  accentColor: string;
  buttonSize: 'small' | 'medium' | 'large';
  greeting: string;
  title: string;
  subtitle: string;
  zIndex: number;
  theme: 'modern' | 'minimal' | 'classic';
  showNotificationBadge: boolean;
  paddingX: number;  // Horizontal padding in pixels
  paddingY: number;  // Vertical padding in pixels
  created_at?: string;
  updated_at?: string;
}

export interface SystemSettings {
  id?: string;
  // Theme Settings
  defaultTheme: 'light' | 'dark';
  allowThemeSwitching: boolean;
  inheritHostTheme: boolean;

  // Language Settings
  defaultLanguage: 'en' | 'fr' | 'de' | 'es' | 'ar';
  enabledLanguages: ('en' | 'fr' | 'de' | 'es' | 'ar')[];
  translateAIResponses: boolean;
  enableRTL: boolean;

  // Analytics Settings
  enableCountryTracking: boolean;
  defaultDateRange: '7d' | '30d' | '90d' | 'custom';
  enableWorldMap: boolean;

  // Privacy Settings
  anonymizeIPs: boolean;
  storeIPAddresses: boolean;

  created_at?: string;
  updated_at?: string;
}

export interface DailyStats {
  date: string;
  total_conversations: number;
  total_messages: number;
  unique_sessions: number;
  avg_satisfaction: number;
}

export interface CountryStats {
  country_code: string;
  country_name: string;
  count: number;
  percentage: number;
}

// Learning System Types
export interface FeedbackPattern {
  pattern: string;
  count: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  samples: Array<{
    query: string;
    comment: string;
    created_at: string;
  }>;
  feedback_ids: string[];
}

export interface FeedbackInsights {
  total_negative_feedback: number;
  feedback_with_comments: number;
  patterns_identified: number;
  patterns: FeedbackPattern[];
  period_days: number;
  error?: string;
}

export interface DraftDocument {
  id: string;
  title: string;
  content: string;
  category?: string;
  source_type: string;
  source_feedback_ids?: string[];
  query_pattern?: string;
  generated_by_llm: boolean;
  llm_model?: string;
  generation_prompt?: string;
  confidence_score?: number;
  status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  published_document_id?: string;
  feedback_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface GenerateDraftRequest {
  feedback_ids: string[];
  query_pattern?: string;
  category?: string;
  additional_context?: string;
}

export interface GenerateDraftResponse {
  success: boolean;
  message: string;
  draft_id?: string;
  draft?: DraftDocument;
}

export interface DraftDocumentReview {
  status: 'approved' | 'rejected' | 'needs_revision';
  review_notes?: string;
}

export interface PendingDraftsResponse {
  drafts: DraftDocument[];
  total: number;
  limit: number;
  offset: number;
  error?: string;
}

// Soft Delete Types
export interface DeletedItem {
  item_type: 'conversation' | 'message' | 'feedback' | 'draft';
  id: string;
  identifier: string; // Session ID or related ID
  content?: string;
  deleted_at: string;
  deleted_by?: string;
  created_at: string;
  deleted_by_email?: string;
  related_count: number; // Count of related items
  days_until_permanent: number;
}

export interface DeletedItemsResponse {
  items: DeletedItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface SoftDeleteResponse {
  success: boolean;
  message: string;
  item_id: string;
}

export interface RecoverResponse {
  success: boolean;
  message: string;
  item_id: string;
}

export interface PermanentDeleteResponse {
  success: boolean;
  message: string;
  item_id: string;
}

export interface UpdateConversationRequest {
  session_id?: string;
}

export interface UpdateMessageRequest {
  content: string;
}

export interface UpdateFeedbackRequest {
  rating?: number;
  comment?: string;
}

// Chatbot Configuration Types
export interface ChatbotConfig {
  id?: string;
  intentPatterns: Record<string, string[]>;
  intentEnabled: Record<string, boolean>;
  patternConfidenceThreshold: number;
  llmFallbackEnabled: boolean;
  llmConfidenceThreshold: number;
  ragTopK: number;
  ragSimilarityThreshold: number;
  chunkSize: number;
  chunkOverlap: number;
  llmModel: string;
  llmTemperature: number;
  llmMaxTokens: number;
  topicKeywords: Record<string, string[]>;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatbotConfigUpdate {
  intentPatterns?: Record<string, string[]>;
  intentEnabled?: Record<string, boolean>;
  patternConfidenceThreshold?: number;
  llmFallbackEnabled?: boolean;
  llmConfidenceThreshold?: number;
  ragTopK?: number;
  ragSimilarityThreshold?: number;
  chunkSize?: number;
  chunkOverlap?: number;
  llmModel?: string;
  llmTemperature?: number;
  llmMaxTokens?: number;
  topicKeywords?: Record<string, string[]>;
}

-- =========================================================
-- NyayaAI – Supabase PostgreSQL Schema
-- Run this SQL in Supabase Dashboard → SQL Editor
-- =========================================================

-- 1. Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Chat Sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Legal Query',
  category TEXT DEFAULT 'Other',
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);

-- 3. Documents table
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_key TEXT,
  doc_type TEXT DEFAULT 'Other',
  extracted_text TEXT DEFAULT '',
  summary TEXT DEFAULT '',
  risks JSONB DEFAULT '[]'::jsonb,
  obligations JSONB DEFAULT '[]'::jsonb,
  rights JSONB DEFAULT '[]'::jsonb,
  suggested_steps JSONB DEFAULT '[]'::jsonb,
  key_dates JSONB DEFAULT '[]'::jsonb,
  parties_involved JSONB DEFAULT '[]'::jsonb,
  qa_history JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

-- =========================================================
-- Row Level Security (RLS) — users can only see their data
-- =========================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT WITH CHECK (true);

-- Chat Sessions
CREATE POLICY "Users can manage own sessions" ON chat_sessions
  USING (auth.uid() = user_id);
CREATE POLICY "Service role full access chat" ON chat_sessions
  FOR ALL USING (true);

-- Documents
CREATE POLICY "Users can manage own documents" ON documents
  USING (auth.uid() = user_id);
CREATE POLICY "Service role full access docs" ON documents
  FOR ALL USING (true);

-- =========================================================
-- Supabase Storage Bucket
-- =========================================================
-- Go to Storage → New Bucket → Name: "legal-documents" → Private
-- (Or run below if using storage API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('legal-documents', 'legal-documents', false);

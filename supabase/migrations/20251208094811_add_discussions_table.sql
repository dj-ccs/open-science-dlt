/*
  # Add Discussion System

  1. New Tables
    - `discussions`
      - `id` (uuid, primary key)
      - `paper_id` (text) - References papers in the main system
      - `user_id` (text) - User who created the comment
      - `content` (text) - Comment content
      - `parent_id` (uuid, nullable) - For threaded replies
      - `likes` (integer) - Number of likes
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `discussions` table
    - Add policies for:
      - Anyone can view discussions
      - Authenticated users can create discussions
      - Users can update/delete their own discussions
*/

-- Create discussions table
CREATE TABLE IF NOT EXISTS discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES discussions(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_discussions_paper_id ON discussions(paper_id);
CREATE INDEX IF NOT EXISTS idx_discussions_user_id ON discussions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_parent_id ON discussions(parent_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON discussions(created_at DESC);

-- Enable Row Level Security
ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view discussions (public read)
CREATE POLICY "Anyone can view discussions"
  ON discussions
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can create discussions
CREATE POLICY "Authenticated users can create discussions"
  ON discussions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own discussions
CREATE POLICY "Users can update own discussions"
  ON discussions
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can delete their own discussions
CREATE POLICY "Users can delete own discussions"
  ON discussions
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for discussions table
DROP TRIGGER IF EXISTS update_discussions_updated_at ON discussions;
CREATE TRIGGER update_discussions_updated_at
  BEFORE UPDATE ON discussions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get discussion count for a paper
CREATE OR REPLACE FUNCTION get_discussion_count(paper_id_param TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM discussions
  WHERE paper_id = paper_id_param AND parent_id IS NULL;
$$ LANGUAGE SQL STABLE;

-- Create function to get reply count for a discussion
CREATE OR REPLACE FUNCTION get_reply_count(discussion_id_param UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM discussions
  WHERE parent_id = discussion_id_param;
$$ LANGUAGE SQL STABLE;
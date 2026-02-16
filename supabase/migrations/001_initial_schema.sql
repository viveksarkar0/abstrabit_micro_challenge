
-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bookmarks table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
-- Index on user_id for fast filtering by user
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);

-- Composite index on user_id and created_at for efficient sorting
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_created ON public.bookmarks(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can create their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can delete their own bookmarks" ON public.bookmarks;
DROP POLICY IF EXISTS "Users can update their own bookmarks" ON public.bookmarks;

-- RLS Policy: Users can only SELECT their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarks
FOR SELECT
USING (auth.uid() = user_id);

-- RLS Policy: Users can only INSERT bookmarks for themselves
CREATE POLICY "Users can create their own bookmarks"
ON public.bookmarks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can only DELETE their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarks
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policy: Users can only UPDATE their own bookmarks
-- (Not used in MVP but included for completeness)
CREATE POLICY "Users can update their own bookmarks"
ON public.bookmarks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function before any UPDATE
DROP TRIGGER IF EXISTS set_updated_at ON public.bookmarks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.bookmarks TO authenticated;
GRANT SELECT ON public.bookmarks TO anon;

-- Comments for documentation
COMMENT ON TABLE public.bookmarks IS 'Stores user bookmarks with strict RLS policies';
COMMENT ON COLUMN public.bookmarks.id IS 'Unique identifier for the bookmark';
COMMENT ON COLUMN public.bookmarks.user_id IS 'Foreign key to auth.users - owner of the bookmark';
COMMENT ON COLUMN public.bookmarks.title IS 'Display title for the bookmark';
COMMENT ON COLUMN public.bookmarks.url IS 'Target URL of the bookmark';
COMMENT ON COLUMN public.bookmarks.created_at IS 'Timestamp when bookmark was created';
COMMENT ON COLUMN public.bookmarks.updated_at IS 'Timestamp when bookmark was last updated';

-- Add is_favorite column
ALTER TABLE bookmarks 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;
ALTER TABLE bookmarks 
ADD COLUMN IF NOT EXISTS collection TEXT;
CREATE INDEX IF NOT EXISTS idx_bookmarks_is_favorite ON bookmarks(is_favorite);
CREATE INDEX IF NOT EXISTS idx_bookmarks_collection ON bookmarks(collection);


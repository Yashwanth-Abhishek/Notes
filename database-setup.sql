-- Run this SQL in your Supabase SQL Editor to add the missing fields

-- Add archive and delete fields to notebooks table
ALTER TABLE public.notebooks 
ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notebooks_archived ON public.notebooks(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_notebooks_deleted ON public.notebooks(user_id, is_deleted);
CREATE INDEX IF NOT EXISTS idx_notebooks_deleted_at ON public.notebooks(user_id, deleted_at);

-- Update existing notebooks to ensure they have the default values
UPDATE public.notebooks 
SET is_archived = false, is_deleted = false 
WHERE is_archived IS NULL OR is_deleted IS NULL;

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'notebooks' 
AND table_schema = 'public'
ORDER BY ordinal_position;


-- Add archive and delete fields to notebooks table
ALTER TABLE public.notebooks 
ADD COLUMN is_archived BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for better performance
CREATE INDEX idx_notebooks_archived ON public.notebooks(user_id, is_archived);
CREATE INDEX idx_notebooks_deleted ON public.notebooks(user_id, is_deleted);
CREATE INDEX idx_notebooks_deleted_at ON public.notebooks(user_id, deleted_at);

-- Update existing notebooks to ensure they have the default values
UPDATE public.notebooks 
SET is_archived = false, is_deleted = false 
WHERE is_archived IS NULL OR is_deleted IS NULL;



-- Add status column to reports table for tracking report states
ALTER TABLE public.reports ADD COLUMN status TEXT DEFAULT 'open';

-- Add an index for better performance when filtering by status
CREATE INDEX idx_reports_status ON public.reports(status);

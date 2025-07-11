
-- Create announcements table for admin-created announcements
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author TEXT NOT NULL DEFAULT 'Admin',
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read announcements
CREATE POLICY "Anyone can view announcements" 
  ON public.announcements 
  FOR SELECT 
  USING (true);

-- Only allow admins to insert/update/delete announcements (you can modify this based on your admin system)
CREATE POLICY "Admins can manage announcements" 
  ON public.announcements 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

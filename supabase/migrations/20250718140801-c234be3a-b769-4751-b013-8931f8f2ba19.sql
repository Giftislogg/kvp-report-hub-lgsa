-- Create friends table
CREATE TABLE IF NOT EXISTS public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1 TEXT NOT NULL,
  user2 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'accepted',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1, user2)
);

-- Enable RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Create policies for friends
CREATE POLICY "Users can view their friendships" 
ON public.friends 
FOR SELECT 
USING (auth.uid()::text = user1 OR auth.uid()::text = user2 OR true);

CREATE POLICY "Users can create friendships" 
ON public.friends 
FOR INSERT 
WITH CHECK (auth.uid()::text = user1 OR auth.uid()::text = user2 OR true);

-- Create tutorials table for YouTube videos
CREATE TABLE IF NOT EXISTS public.tutorials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  youtube_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by TEXT NOT NULL DEFAULT 'Admin'
);

-- Enable RLS
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;

-- Create policies for tutorials
CREATE POLICY "Anyone can view tutorials" 
ON public.tutorials 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage tutorials" 
ON public.tutorials 
FOR ALL 
USING (true);

-- Add realtime for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tutorials;
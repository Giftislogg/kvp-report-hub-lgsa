
-- Remove notifications table and related data
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Remove notifications from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS public.notifications;

-- Create friends table for friend requests and friendships
CREATE TABLE public.friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1 TEXT NOT NULL,
  user2 TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  requested_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1, user2)
);

-- Enable RLS on friends table
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for friends table
CREATE POLICY "Allow all operations on friends" ON public.friends FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for friends table
ALTER TABLE public.friends REPLICA IDENTITY FULL;

-- Add friends table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;

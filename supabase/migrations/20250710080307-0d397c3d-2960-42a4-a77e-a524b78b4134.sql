
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  to_user TEXT NOT NULL,
  from_user TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('admin_message', 'chat_request', 'chat_accepted')),
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create active_chats table
CREATE TABLE public.active_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1 TEXT NOT NULL,
  user2 TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1, user2)
);

-- Create posts table
CREATE TABLE public.posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create post_likes table to track who liked what
CREATE TABLE public.post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_name)
);

-- Create muted_users table for admin moderation
CREATE TABLE public.muted_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  muted_by TEXT NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.muted_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations on notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on active_chats" ON public.active_chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on posts" ON public.posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on post_likes" ON public.post_likes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on muted_users" ON public.muted_users FOR ALL USING (true) WITH CHECK (true);

-- Enable realtime for live updates
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER TABLE public.posts REPLICA IDENTITY FULL;
ALTER TABLE public.post_likes REPLICA IDENTITY FULL;
ALTER TABLE public.public_chat REPLICA IDENTITY FULL;
ALTER TABLE public.private_chats REPLICA IDENTITY FULL;
ALTER TABLE public.admin_messages REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.private_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_messages;

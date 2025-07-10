
-- Create Reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  guest_name TEXT NOT NULL,
  screenshot_url TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  admin_response TEXT,
  admin_response_timestamp TIMESTAMP WITH TIME ZONE
);

-- Create PublicChat table
CREATE TABLE public.public_chat (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create PrivateChats table
CREATE TABLE public.private_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AdminMessages table for admin responses to users
CREATE TABLE public.admin_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name TEXT NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'admin', -- 'admin' or 'guest'
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (but allow all operations since no auth is required)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for all tables (no authentication required)
CREATE POLICY "Allow all operations on reports" ON public.reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on public_chat" ON public.public_chat FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on private_chats" ON public.private_chats FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on admin_messages" ON public.admin_messages FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('screenshots', 'screenshots', true);

-- Create storage policy for screenshots
CREATE POLICY "Allow all operations on screenshots" ON storage.objects FOR ALL USING (bucket_id = 'screenshots') WITH CHECK (bucket_id = 'screenshots');

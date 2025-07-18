
-- Add image_url column to posts table for image uploads
ALTER TABLE public.posts ADD COLUMN image_url TEXT;

-- Create a storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true);

-- Create storage policy to allow authenticated users to upload post images
CREATE POLICY "Users can upload post images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

-- Create storage policy to allow anyone to view post images
CREATE POLICY "Anyone can view post images" ON storage.objects
FOR SELECT USING (bucket_id = 'post-images');

-- Create storage policy to allow users to update their own post images
CREATE POLICY "Users can update their own post images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

-- Create storage policy to allow users to delete their own post images
CREATE POLICY "Users can delete their own post images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

-- Add a dislikes column to posts table
ALTER TABLE public.posts ADD COLUMN dislikes INTEGER NOT NULL DEFAULT 0;

-- Create post_dislikes table to track who disliked what
CREATE TABLE public.post_dislikes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_name)
);

-- Enable RLS on post_dislikes
ALTER TABLE public.post_dislikes ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for post_dislikes
CREATE POLICY "Allow all operations on post_dislikes" ON public.post_dislikes FOR ALL USING (true) WITH CHECK (true);

-- Add post_dislikes to realtime
ALTER TABLE public.post_dislikes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_dislikes;

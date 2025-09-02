-- Create post-images bucket if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'post-images') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);
    END IF;
END
$$;

-- Create storage policies for post-images bucket
CREATE POLICY "Anyone can view post images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'post-images');

CREATE POLICY "Users can upload post images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Users can update their own post images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'post-images');

CREATE POLICY "Users can delete post images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'post-images');
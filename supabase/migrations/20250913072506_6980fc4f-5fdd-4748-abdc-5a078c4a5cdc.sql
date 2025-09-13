-- Add last_active column to profiles for guest account tracking
ALTER TABLE public.profiles 
ADD COLUMN last_active TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create index for performance
CREATE INDEX idx_profiles_last_active ON public.profiles(last_active);

-- Update existing profiles to have current timestamp
UPDATE public.profiles SET last_active = now();

-- Create function to clean up old data
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete messages older than 24 hours from public_chat
  DELETE FROM public_chat 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete messages older than 24 hours from private_chats
  DELETE FROM private_chats 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete messages older than 24 hours from admin_messages
  DELETE FROM admin_messages 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete voice notes older than 24 hours (assuming they start with "Voice note:")
  DELETE FROM public_chat 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  DELETE FROM private_chats 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  DELETE FROM admin_messages 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete inactive guest accounts (profiles without user_id that haven't been active for 48h)
  DELETE FROM public.profiles 
  WHERE last_active < NOW() - INTERVAL '48 hours';
  
END;
$$;

-- Create a trigger to update last_active when profile is accessed
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$$;

-- Create trigger for profiles table
CREATE TRIGGER update_profiles_last_active
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_last_active();
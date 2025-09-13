-- Fix function search path security warnings by setting search_path explicitly

-- Update cleanup_old_data function
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Delete messages older than 24 hours from public_chat
  DELETE FROM public.public_chat 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete messages older than 24 hours from private_chats
  DELETE FROM public.private_chats 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete messages older than 24 hours from admin_messages
  DELETE FROM public.admin_messages 
  WHERE timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete voice notes older than 24 hours (assuming they start with "Voice note:")
  DELETE FROM public.public_chat 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  DELETE FROM public.private_chats 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  DELETE FROM public.admin_messages 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete inactive guest accounts (profiles without user_id that haven't been active for 48h)
  DELETE FROM public.profiles 
  WHERE last_active < NOW() - INTERVAL '48 hours';
  
END;
$$;

-- Update update_last_active function
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.last_active = now();
  RETURN NEW;
END;
$$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update delete_old_voice_notes function
CREATE OR REPLACE FUNCTION public.delete_old_voice_notes()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Delete voice notes older than 24 hours from admin_messages
  DELETE FROM public.admin_messages 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete voice notes older than 24 hours from public_chat
  DELETE FROM public.public_chat 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete voice notes older than 24 hours from private_chats
  DELETE FROM public.private_chats 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
END;
$$;

-- Update create_missing_profiles function
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    -- This function can be called to create profiles for existing users
    -- Since we don't have auth.users in this setup, we'll handle it through the app
    NULL;
END;
$$;
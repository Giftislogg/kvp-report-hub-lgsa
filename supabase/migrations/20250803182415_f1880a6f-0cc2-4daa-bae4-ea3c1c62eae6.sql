-- Create a trigger to auto-delete voice notes after 24 hours
CREATE OR REPLACE FUNCTION delete_old_voice_notes()
RETURNS void AS $$
BEGIN
  -- Delete voice notes older than 24 hours from admin_messages
  DELETE FROM admin_messages 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete voice notes older than 24 hours from public_chat
  DELETE FROM public_chat 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
  
  -- Delete voice notes older than 24 hours from private_chats
  DELETE FROM private_chats 
  WHERE message LIKE 'Voice note:%' 
  AND timestamp < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled trigger to run the cleanup function every hour
-- Note: This would typically be done with pg_cron extension, but for now we'll create the function
-- and it can be called manually or through a scheduled job
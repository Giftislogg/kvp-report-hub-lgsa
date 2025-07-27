-- Add reply and reaction support to chat messages

-- Add columns to public_chat table for replies and reactions
ALTER TABLE public_chat ADD COLUMN reply_to_id uuid REFERENCES public_chat(id);
ALTER TABLE public_chat ADD COLUMN reactions jsonb DEFAULT '{}';

-- Add columns to private_chats table for replies and reactions  
ALTER TABLE private_chats ADD COLUMN reply_to_id uuid REFERENCES private_chats(id);
ALTER TABLE private_chats ADD COLUMN reactions jsonb DEFAULT '{}';

-- Add columns to admin_messages table for replies and reactions
ALTER TABLE admin_messages ADD COLUMN reply_to_id uuid REFERENCES admin_messages(id);
ALTER TABLE admin_messages ADD COLUMN reactions jsonb DEFAULT '{}';
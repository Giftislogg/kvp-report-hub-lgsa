-- Fix the constraint on notifications table to allow friend_request type
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add a new constraint that includes friend_request
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('friend_request', 'friend_accepted', 'message', 'like', 'comment', 'announcement'));
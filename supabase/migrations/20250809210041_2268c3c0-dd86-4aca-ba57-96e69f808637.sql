-- Add bio field to profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE profiles ADD COLUMN bio TEXT;
    END IF;
END $$;

-- Update existing users to have profiles if they don't exist
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void AS $function$
BEGIN
    -- This function can be called to create profiles for existing users
    -- Since we don't have auth.users in this setup, we'll handle it through the app
    NULL;
END;
$function$ LANGUAGE plpgsql;
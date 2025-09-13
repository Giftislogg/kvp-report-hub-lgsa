-- Move extensions to the extensions schema for security
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Reschedule cleanup function with correct extension schema reference
SELECT extensions.cron.schedule(
  'cleanup-old-data-daily',
  '0 2 * * *', -- Run at 2 AM every day
  $$
  SELECT extensions.net.http_post(
    url:='https://kidfllzhzhdvxibziald.supabase.co/functions/v1/cleanup-old-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZGZsbHpoemhkdnhpYnppYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMjgxMDIsImV4cCI6MjA2NzcwNDEwMn0.6DdC2HKcopCF9upne9NoikZMJe8Clzdiv4Fqk6BKNFU"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);
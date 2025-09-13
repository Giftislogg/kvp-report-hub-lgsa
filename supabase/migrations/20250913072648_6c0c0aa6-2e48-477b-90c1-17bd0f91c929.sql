-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule cleanup function to run every 24 hours at 2 AM
SELECT cron.schedule(
  'cleanup-old-data-daily',
  '0 2 * * *', -- Run at 2 AM every day
  $$
  SELECT net.http_post(
    url:='https://kidfllzhzhdvxibziald.supabase.co/functions/v1/cleanup-old-data',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpZGZsbHpoemhkdnhpYnppYWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMjgxMDIsImV4cCI6MjA2NzcwNDEwMn0.6DdC2HKcopCF9upne9NoikZMJe8Clzdiv4Fqk6BKNFU"}'::jsonb,
    body:='{"scheduled": true}'::jsonb
  ) as request_id;
  $$
);
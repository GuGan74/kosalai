-- 1. Enable the pg_net extension to make asynchronous HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Drop the trigger and function if they already exist to ensure a clean slate
DROP TRIGGER IF EXISTS trigger_delete_cloudinary_images ON public.listings;
DROP FUNCTION IF EXISTS public.execute_cloudinary_webhook();

-- 3. Create the webhook execution function
CREATE OR REPLACE FUNCTION public.execute_cloudinary_webhook()
RETURNS trigger AS $$
DECLARE
  edge_function_url text := 'https://ulbrlhcelwoojwnvznrd.supabase.co/functions/v1/cloudinary-cleanup';
  anon_key text := 'sb_publishable_YWwkOCwcVoNUM0xnC3Wbiw_y1rX3Y4i'; -- Need this for authorization
  payload jsonb;
  request_id bigint;
BEGIN
  -- Construct the webhook payload exactly how Supabase does it naturally
  payload := jsonb_build_object(
    'type', 'DELETE',
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'old_record', row_to_json(OLD)
  );

  -- Make the asynchronous POST request via pg_net
  -- This does NOT block the transaction. If it fails, the row still deletes safely.
  SELECT net.http_post(
    url := edge_function_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := payload
  ) INTO request_id;

  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the AFTER DELETE trigger on the listings table
CREATE TRIGGER trigger_delete_cloudinary_images
AFTER DELETE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.execute_cloudinary_webhook();

-- =============================================
-- Truss App - Enable Realtime for Tables
-- =============================================
-- Run this in Supabase SQL Editor to enable realtime subscriptions
-- Uses DO block to skip tables that are already added

DO $$
DECLARE
  tables_to_add TEXT[] := ARRAY['events', 'board_posts', 'board_post_replies', 'gallery_photos', 'messages', 'notifications', 'event_participants', 'users'];
  t TEXT;
BEGIN
  FOREACH t IN ARRAY tables_to_add
  LOOP
    -- Check if table is already in publication
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE %I', t);
      RAISE NOTICE 'Added table % to supabase_realtime', t;
    ELSE
      RAISE NOTICE 'Table % is already in supabase_realtime, skipping', t;
    END IF;
  END LOOP;
END $$;

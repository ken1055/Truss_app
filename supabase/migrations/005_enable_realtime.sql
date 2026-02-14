-- =============================================
-- Truss App - Enable Realtime for Tables
-- =============================================
-- Run this in Supabase SQL Editor to enable realtime subscriptions

-- Enable realtime for events table
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Enable realtime for board_posts table
ALTER PUBLICATION supabase_realtime ADD TABLE board_posts;

-- Enable realtime for board_post_replies table
ALTER PUBLICATION supabase_realtime ADD TABLE board_post_replies;

-- Enable realtime for gallery_photos table
ALTER PUBLICATION supabase_realtime ADD TABLE gallery_photos;

-- Enable realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Enable realtime for event_participants table
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;

-- Enable realtime for users table (for admin to see new registrations)
ALTER PUBLICATION supabase_realtime ADD TABLE users;

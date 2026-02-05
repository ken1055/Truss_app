-- =============================================
-- Truss App - Supabase Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM Types
-- =============================================

CREATE TYPE user_category AS ENUM ('japanese', 'regular-international', 'exchange');

CREATE TYPE registration_step AS ENUM (
  'email_input',
  'email_sent',
  'email_verified',
  'initial_registration',
  'waiting_approval',
  'approved_limited',
  'profile_completion',
  'fee_payment',
  'fully_active'
);

CREATE TYPE event_status AS ENUM ('upcoming', 'past');

CREATE TYPE board_post_tag AS ENUM ('languageExchange', 'studyGroup', 'event');

CREATE TYPE board_post_display_type AS ENUM ('story', 'board');

CREATE TYPE notification_type AS ENUM ('message', 'event', 'photo', 'board');

CREATE TYPE notification_icon AS ENUM ('mail', 'calendar', 'image', 'user');

CREATE TYPE notification_link_page AS ENUM ('admin-chat', 'events', 'gallery', 'bulletin', 'messages');

-- =============================================
-- Users Table
-- =============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  nickname TEXT NOT NULL DEFAULT '',
  furigana TEXT NOT NULL DEFAULT '',
  birthday DATE,
  languages TEXT[] DEFAULT '{}',
  country TEXT NOT NULL DEFAULT '',
  category user_category NOT NULL DEFAULT 'japanese',
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  student_id_image TEXT, -- Base64 or Storage URL (deleted after approval)
  student_number TEXT,
  grade TEXT,
  major TEXT,
  phone TEXT,
  organizations TEXT,
  blocked BOOLEAN NOT NULL DEFAULT FALSE,
  registration_step registration_step NOT NULL DEFAULT 'email_input',
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  initial_registered BOOLEAN NOT NULL DEFAULT FALSE,
  profile_completed BOOLEAN NOT NULL DEFAULT FALSE,
  fee_paid BOOLEAN NOT NULL DEFAULT FALSE,
  student_id_reupload_requested BOOLEAN NOT NULL DEFAULT FALSE,
  reupload_reason TEXT,
  requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_approved ON users(approved);
CREATE INDEX idx_users_registration_step ON users(registration_step);
CREATE INDEX idx_users_category ON users(category);

-- =============================================
-- Events Table
-- =============================================

CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL DEFAULT '',
  description_en TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  location_en TEXT,
  google_map_url TEXT,
  max_participants INTEGER NOT NULL DEFAULT 0,
  current_participants INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  tags_friends_can_meet BOOLEAN NOT NULL DEFAULT FALSE,
  tags_photo_contest BOOLEAN NOT NULL DEFAULT FALSE,
  status event_status NOT NULL DEFAULT 'upcoming',
  photos_count INTEGER NOT NULL DEFAULT 0,
  line_group_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_status ON events(status);

-- =============================================
-- Event Participants Table
-- =============================================

CREATE TABLE event_participants (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_nickname TEXT NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  photo_refusal BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(event_id, user_id)
);

CREATE INDEX idx_event_participants_event ON event_participants(event_id);
CREATE INDEX idx_event_participants_user ON event_participants(user_id);

-- =============================================
-- Event Likes Table (for tracking user likes)
-- =============================================

CREATE TABLE event_likes (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- =============================================
-- Messages Table
-- =============================================

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for broadcast
  sender_name TEXT NOT NULL,
  text TEXT NOT NULL,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  is_broadcast BOOLEAN NOT NULL DEFAULT FALSE,
  broadcast_subject TEXT,
  broadcast_subject_en TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_is_broadcast ON messages(is_broadcast);
CREATE INDEX idx_messages_time ON messages(time DESC);

-- =============================================
-- Chat Thread Metadata Table
-- =============================================

CREATE TABLE chat_thread_metadata (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Admin managing this thread
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  flagged BOOLEAN NOT NULL DEFAULT FALSE,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_chat_metadata_user ON chat_thread_metadata(user_id);
CREATE INDEX idx_chat_metadata_pinned ON chat_thread_metadata(pinned);
CREATE INDEX idx_chat_metadata_flagged ON chat_thread_metadata(flagged);

-- =============================================
-- Notifications Table
-- =============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT NOT NULL DEFAULT '',
  description_en TEXT,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  icon notification_icon NOT NULL DEFAULT 'mail',
  link TEXT,
  link_page notification_link_page,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_time ON notifications(time DESC);

-- =============================================
-- Board Posts Table
-- =============================================

CREATE TABLE board_posts (
  id SERIAL PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_avatar TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT '',
  people_needed INTEGER NOT NULL DEFAULT 0,
  interested INTEGER NOT NULL DEFAULT 0,
  tag board_post_tag NOT NULL DEFAULT 'languageExchange',
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  image TEXT,
  display_type board_post_display_type NOT NULL DEFAULT 'board',
  expiry_date DATE,
  is_hidden BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  category TEXT,
  date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_board_posts_author ON board_posts(author_id);
CREATE INDEX idx_board_posts_tag ON board_posts(tag);
CREATE INDEX idx_board_posts_display_type ON board_posts(display_type);
CREATE INDEX idx_board_posts_is_hidden ON board_posts(is_hidden);
CREATE INDEX idx_board_posts_is_deleted ON board_posts(is_deleted);
CREATE INDEX idx_board_posts_time ON board_posts(time DESC);

-- =============================================
-- Board Post Replies Table
-- =============================================

CREATE TABLE board_post_replies (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_board_post_replies_post ON board_post_replies(post_id);
CREATE INDEX idx_board_post_replies_author ON board_post_replies(author_id);

-- =============================================
-- Board Post Interests Table (tracking interested users)
-- =============================================

CREATE TABLE board_post_interests (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES board_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- =============================================
-- Gallery Photos Table
-- =============================================

CREATE TABLE gallery_photos (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  image TEXT NOT NULL, -- Storage URL
  likes INTEGER NOT NULL DEFAULT 0,
  height INTEGER, -- For masonry layout
  user_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_gallery_photos_event ON gallery_photos(event_id);
CREATE INDEX idx_gallery_photos_user ON gallery_photos(user_id);
CREATE INDEX idx_gallery_photos_approved ON gallery_photos(approved);
CREATE INDEX idx_gallery_photos_uploaded_at ON gallery_photos(uploaded_at DESC);

-- =============================================
-- Gallery Photo Likes Table
-- =============================================

CREATE TABLE gallery_photo_likes (
  id SERIAL PRIMARY KEY,
  photo_id INTEGER NOT NULL REFERENCES gallery_photos(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(photo_id, user_id)
);

-- =============================================
-- Updated At Trigger Function
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_board_posts_updated_at
  BEFORE UPDATE ON board_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_metadata_updated_at
  BEFORE UPDATE ON chat_thread_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_thread_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_post_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photo_likes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE auth_id = auth.uid() AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's UUID
CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM users WHERE auth_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Users Policies
-- =============================================

-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth_id = auth.uid() OR is_admin());

-- Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth_id = auth.uid() OR is_admin());

-- Only admins can insert new users (or through auth trigger)
CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (auth_id = auth.uid() OR is_admin());

-- Only admins can delete users
CREATE POLICY users_delete ON users
  FOR DELETE USING (is_admin());

-- Approved members can see other approved members (limited info)
CREATE POLICY users_select_members ON users
  FOR SELECT USING (
    approved = TRUE AND 
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND approved = TRUE)
  );

-- =============================================
-- Events Policies
-- =============================================

-- Everyone can read events
CREATE POLICY events_select ON events
  FOR SELECT USING (TRUE);

-- Only admins can create/update/delete events
CREATE POLICY events_insert ON events
  FOR INSERT WITH CHECK (is_admin());

CREATE POLICY events_update ON events
  FOR UPDATE USING (is_admin());

CREATE POLICY events_delete ON events
  FOR DELETE USING (is_admin());

-- =============================================
-- Event Participants Policies
-- =============================================

-- Users can see participants of events they're participating in
CREATE POLICY event_participants_select ON event_participants
  FOR SELECT USING (
    user_id = get_user_id() OR 
    is_admin() OR
    EXISTS (
      SELECT 1 FROM event_participants ep 
      WHERE ep.event_id = event_participants.event_id 
      AND ep.user_id = get_user_id()
    )
  );

-- Users can register themselves
CREATE POLICY event_participants_insert ON event_participants
  FOR INSERT WITH CHECK (user_id = get_user_id() OR is_admin());

-- Users can cancel their own registration, admins can cancel any
CREATE POLICY event_participants_delete ON event_participants
  FOR DELETE USING (user_id = get_user_id() OR is_admin());

-- =============================================
-- Event Likes Policies
-- =============================================

CREATE POLICY event_likes_select ON event_likes
  FOR SELECT USING (TRUE);

CREATE POLICY event_likes_insert ON event_likes
  FOR INSERT WITH CHECK (user_id = get_user_id());

CREATE POLICY event_likes_delete ON event_likes
  FOR DELETE USING (user_id = get_user_id());

-- =============================================
-- Messages Policies
-- =============================================

-- Users can see messages they sent or received
CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    sender_id = get_user_id() OR 
    receiver_id = get_user_id() OR 
    (is_broadcast = TRUE AND receiver_id IS NULL) OR
    is_admin()
  );

-- Users can send messages
CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (sender_id = get_user_id() OR is_admin());

-- Users can update their own messages (mark as read)
CREATE POLICY messages_update ON messages
  FOR UPDATE USING (receiver_id = get_user_id() OR is_admin());

-- =============================================
-- Chat Thread Metadata Policies
-- =============================================

CREATE POLICY chat_metadata_select ON chat_thread_metadata
  FOR SELECT USING (user_id = get_user_id() OR is_admin());

CREATE POLICY chat_metadata_insert ON chat_thread_metadata
  FOR INSERT WITH CHECK (user_id = get_user_id() OR is_admin());

CREATE POLICY chat_metadata_update ON chat_thread_metadata
  FOR UPDATE USING (user_id = get_user_id() OR is_admin());

-- =============================================
-- Notifications Policies
-- =============================================

-- Users can only see their own notifications
CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (user_id = get_user_id() OR is_admin());

-- Only system/admin can create notifications
CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (is_admin());

-- Users can update their own notifications (mark as read)
CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (user_id = get_user_id() OR is_admin());

CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (is_admin());

-- =============================================
-- Board Posts Policies
-- =============================================

-- Everyone can see non-hidden, non-deleted posts
CREATE POLICY board_posts_select ON board_posts
  FOR SELECT USING (
    (is_hidden = FALSE AND is_deleted = FALSE) OR 
    author_id = get_user_id() OR 
    is_admin()
  );

-- Approved users can create posts
CREATE POLICY board_posts_insert ON board_posts
  FOR INSERT WITH CHECK (
    author_id = get_user_id() AND 
    EXISTS (SELECT 1 FROM users WHERE id = get_user_id() AND approved = TRUE)
  );

-- Authors can update their own posts
CREATE POLICY board_posts_update ON board_posts
  FOR UPDATE USING (author_id = get_user_id() OR is_admin());

-- Authors can delete their own posts
CREATE POLICY board_posts_delete ON board_posts
  FOR DELETE USING (author_id = get_user_id() OR is_admin());

-- =============================================
-- Board Post Replies Policies
-- =============================================

CREATE POLICY board_post_replies_select ON board_post_replies
  FOR SELECT USING (TRUE);

CREATE POLICY board_post_replies_insert ON board_post_replies
  FOR INSERT WITH CHECK (
    author_id = get_user_id() AND 
    EXISTS (SELECT 1 FROM users WHERE id = get_user_id() AND approved = TRUE)
  );

CREATE POLICY board_post_replies_update ON board_post_replies
  FOR UPDATE USING (author_id = get_user_id() OR is_admin());

CREATE POLICY board_post_replies_delete ON board_post_replies
  FOR DELETE USING (author_id = get_user_id() OR is_admin());

-- =============================================
-- Board Post Interests Policies
-- =============================================

CREATE POLICY board_post_interests_select ON board_post_interests
  FOR SELECT USING (TRUE);

CREATE POLICY board_post_interests_insert ON board_post_interests
  FOR INSERT WITH CHECK (user_id = get_user_id());

CREATE POLICY board_post_interests_delete ON board_post_interests
  FOR DELETE USING (user_id = get_user_id());

-- =============================================
-- Gallery Photos Policies
-- =============================================

-- Everyone can see approved photos
CREATE POLICY gallery_photos_select ON gallery_photos
  FOR SELECT USING (approved = TRUE OR user_id = get_user_id() OR is_admin());

-- Approved users can upload photos
CREATE POLICY gallery_photos_insert ON gallery_photos
  FOR INSERT WITH CHECK (
    user_id = get_user_id() AND 
    EXISTS (SELECT 1 FROM users WHERE id = get_user_id() AND approved = TRUE)
  );

-- Users can update their own photos, admins can update any
CREATE POLICY gallery_photos_update ON gallery_photos
  FOR UPDATE USING (user_id = get_user_id() OR is_admin());

-- Users can delete their own photos, admins can delete any
CREATE POLICY gallery_photos_delete ON gallery_photos
  FOR DELETE USING (user_id = get_user_id() OR is_admin());

-- =============================================
-- Gallery Photo Likes Policies
-- =============================================

CREATE POLICY gallery_photo_likes_select ON gallery_photo_likes
  FOR SELECT USING (TRUE);

CREATE POLICY gallery_photo_likes_insert ON gallery_photo_likes
  FOR INSERT WITH CHECK (user_id = get_user_id());

CREATE POLICY gallery_photo_likes_delete ON gallery_photo_likes
  FOR DELETE USING (user_id = get_user_id());

-- =============================================
-- Storage Buckets (run in Supabase Dashboard)
-- =============================================

-- Create storage buckets for:
-- 1. student-id-images (private, auto-delete after approval)
-- 2. event-images (public)
-- 3. gallery-photos (public)
-- 4. user-avatars (public)

-- Note: Run these in Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES 
--   ('student-id-images', 'student-id-images', false),
--   ('event-images', 'event-images', true),
--   ('gallery-photos', 'gallery-photos', true),
--   ('user-avatars', 'user-avatars', true);

-- =============================================
-- Realtime Subscriptions
-- =============================================

-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_thread_metadata;

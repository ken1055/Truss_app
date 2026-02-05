-- =============================================
-- Truss App - Helper Functions
-- =============================================

-- =============================================
-- Event Participants Count Functions
-- =============================================

-- Increment participants count
CREATE OR REPLACE FUNCTION increment_participants(event_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET current_participants = current_participants + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement participants count
CREATE OR REPLACE FUNCTION decrement_participants(event_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET current_participants = GREATEST(0, current_participants - 1)
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Event Likes Count Functions
-- =============================================

-- Increment event likes
CREATE OR REPLACE FUNCTION increment_event_likes(p_event_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET likes = likes + 1
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement event likes
CREATE OR REPLACE FUNCTION decrement_event_likes(p_event_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE events
  SET likes = GREATEST(0, likes - 1)
  WHERE id = p_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Board Post Interested Count Functions
-- =============================================

-- Increment interested count
CREATE OR REPLACE FUNCTION increment_interested(post_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE board_posts
  SET interested = interested + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement interested count
CREATE OR REPLACE FUNCTION decrement_interested(post_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE board_posts
  SET interested = GREATEST(0, interested - 1)
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Gallery Photo Likes Functions
-- =============================================

-- Increment photo likes
CREATE OR REPLACE FUNCTION increment_photo_likes(photo_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE gallery_photos
  SET likes = likes + 1
  WHERE id = photo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Decrement photo likes
CREATE OR REPLACE FUNCTION decrement_photo_likes(photo_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE gallery_photos
  SET likes = GREATEST(0, likes - 1)
  WHERE id = photo_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Chat Unread Count Functions
-- =============================================

-- Increment unread count
CREATE OR REPLACE FUNCTION increment_unread_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO chat_thread_metadata (user_id, unread_count, pinned, flagged)
  VALUES (p_user_id, 1, FALSE, FALSE)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    unread_count = chat_thread_metadata.unread_count + 1,
    last_message_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reset unread count
CREATE OR REPLACE FUNCTION reset_unread_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE chat_thread_metadata
  SET unread_count = 0
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- User Creation Trigger (after auth signup)
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, registration_step)
  VALUES (NEW.id, NEW.email, 'email_verified');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- =============================================
-- Message Trigger (update unread count)
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
  -- If message has a receiver, increment their unread count
  IF NEW.receiver_id IS NOT NULL AND NEW.is_admin = TRUE THEN
    -- Admin sent message to user
    PERFORM increment_unread_count(NEW.receiver_id);
  END IF;
  
  -- If it's a broadcast, increment unread for all approved users
  IF NEW.is_broadcast = TRUE AND NEW.receiver_id IS NULL THEN
    -- Update all approved users' unread counts
    UPDATE chat_thread_metadata
    SET unread_count = unread_count + 1,
        last_message_at = NOW()
    WHERE user_id IN (
      SELECT id FROM users WHERE approved = TRUE AND is_admin = FALSE
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_message();

-- =============================================
-- Notification Creation Helper
-- =============================================

CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type notification_type,
  p_title TEXT,
  p_title_en TEXT,
  p_description TEXT,
  p_description_en TEXT,
  p_icon notification_icon,
  p_link TEXT DEFAULT NULL,
  p_link_page notification_link_page DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, title_en, description, description_en, 
    icon, link, link_page, time, read
  )
  VALUES (
    p_user_id, p_type, p_title, p_title_en, p_description, p_description_en,
    p_icon, p_link, p_link_page, NOW(), FALSE
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Broadcast Notification to All Users
-- =============================================

CREATE OR REPLACE FUNCTION broadcast_notification(
  p_type notification_type,
  p_title TEXT,
  p_title_en TEXT,
  p_description TEXT,
  p_description_en TEXT,
  p_icon notification_icon,
  p_link TEXT DEFAULT NULL,
  p_link_page notification_link_page DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  INSERT INTO notifications (
    user_id, type, title, title_en, description, description_en, 
    icon, link, link_page, time, read
  )
  SELECT 
    id, p_type, p_title, p_title_en, p_description, p_description_en,
    p_icon, p_link, p_link_page, NOW(), FALSE
  FROM users
  WHERE approved = TRUE AND is_admin = FALSE;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Event Registration Notification Trigger
-- =============================================

CREATE OR REPLACE FUNCTION handle_event_registration()
RETURNS TRIGGER AS $$
DECLARE
  v_event RECORD;
BEGIN
  -- Get event details
  SELECT * INTO v_event FROM events WHERE id = NEW.event_id;
  
  -- Create notification for the user
  PERFORM create_notification(
    NEW.user_id,
    'event'::notification_type,
    'イベント登録完了',
    'Event Registration Complete',
    v_event.title || 'への参加登録が完了しました',
    'Successfully registered for ' || COALESCE(v_event.title_en, v_event.title),
    'calendar'::notification_icon,
    NULL,
    'events'::notification_link_page
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_event_registration ON event_participants;
CREATE TRIGGER on_event_registration
  AFTER INSERT ON event_participants
  FOR EACH ROW
  EXECUTE FUNCTION handle_event_registration();

-- =============================================
-- Photo Approval Notification Trigger
-- =============================================

CREATE OR REPLACE FUNCTION handle_photo_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when approved changes from false to true
  IF OLD.approved = FALSE AND NEW.approved = TRUE THEN
    PERFORM create_notification(
      NEW.user_id,
      'photo'::notification_type,
      '写真が承認されました',
      'Photo Approved',
      'あなたがアップロードした写真が承認されました',
      'Your uploaded photo has been approved',
      'image'::notification_icon,
      NULL,
      'gallery'::notification_link_page
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_photo_approval ON gallery_photos;
CREATE TRIGGER on_photo_approval
  AFTER UPDATE ON gallery_photos
  FOR EACH ROW
  EXECUTE FUNCTION handle_photo_approval();

-- =============================================
-- User Approval Notification Trigger
-- =============================================

CREATE OR REPLACE FUNCTION handle_user_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when approved changes from false to true
  IF OLD.approved = FALSE AND NEW.approved = TRUE THEN
    PERFORM create_notification(
      NEW.id,
      'message'::notification_type,
      'アカウントが承認されました',
      'Account Approved',
      'Trussへようこそ！アカウントが承認されました。',
      'Welcome to Truss! Your account has been approved.',
      'user'::notification_icon,
      NULL,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_user_approval ON users;
CREATE TRIGGER on_user_approval
  AFTER UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION handle_user_approval();

-- =============================================
-- Board Post Reply Notification Trigger
-- =============================================

CREATE OR REPLACE FUNCTION handle_board_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_post RECORD;
BEGIN
  -- Get post details
  SELECT * INTO v_post FROM board_posts WHERE id = NEW.post_id;
  
  -- Don't notify if replying to own post
  IF v_post.author_id != NEW.author_id THEN
    PERFORM create_notification(
      v_post.author_id,
      'board'::notification_type,
      '掲示板の投稿に返信がありました',
      'New Reply on Your Post',
      v_post.title || 'に新しい返信があります',
      'New reply on your post: ' || v_post.title,
      'user'::notification_icon,
      NULL,
      'bulletin'::notification_link_page
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_board_reply ON board_post_replies;
CREATE TRIGGER on_board_reply
  AFTER INSERT ON board_post_replies
  FOR EACH ROW
  EXECUTE FUNCTION handle_board_reply();

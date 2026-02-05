-- =============================================
-- Fix RLS Infinite Recursion
-- =============================================
-- このSQLをSupabaseダッシュボードのSQL Editorで実行してください

-- 既存のポリシーを削除
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_update_own ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_delete ON users;
DROP POLICY IF EXISTS users_select_members ON users;

-- ヘルパー関数を修正（RLSをバイパス）
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  v_is_admin BOOLEAN;
BEGIN
  SELECT is_admin INTO v_is_admin 
  FROM users 
  WHERE auth_id = auth.uid();
  RETURN COALESCE(v_is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION get_user_id()
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id 
  FROM users 
  WHERE auth_id = auth.uid();
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- usersテーブルの新しいポリシー（auth.uid()を直接使用）

-- ユーザーは自分のデータを読める
CREATE POLICY users_select_own ON users
  FOR SELECT USING (
    auth_id = auth.uid()
  );

-- 管理者は全員のデータを読める
CREATE POLICY users_select_admin ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_id = auth.uid() 
      AND u.is_admin = TRUE
    )
  );

-- 承認済みメンバーは他の承認済みメンバーを見られる
CREATE POLICY users_select_approved_members ON users
  FOR SELECT USING (
    approved = TRUE 
    AND EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_id = auth.uid() 
      AND u.approved = TRUE
    )
  );

-- ユーザーは自分のデータを更新できる
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (
    auth_id = auth.uid()
  );

-- 管理者は全員のデータを更新できる
CREATE POLICY users_update_admin ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_id = auth.uid() 
      AND u.is_admin = TRUE
    )
  );

-- 新規ユーザーの挿入（認証時）
CREATE POLICY users_insert_own ON users
  FOR INSERT WITH CHECK (
    auth_id = auth.uid()
  );

-- 管理者は削除できる
CREATE POLICY users_delete_admin ON users
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.auth_id = auth.uid() 
      AND u.is_admin = TRUE
    )
  );

-- =============================================
-- 他のテーブルのポリシーも修正
-- =============================================

-- event_participants
DROP POLICY IF EXISTS event_participants_select ON event_participants;
DROP POLICY IF EXISTS event_participants_insert ON event_participants;
DROP POLICY IF EXISTS event_participants_delete ON event_participants;

CREATE POLICY event_participants_select ON event_participants
  FOR SELECT USING (TRUE);

CREATE POLICY event_participants_insert ON event_participants
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY event_participants_delete ON event_participants
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

-- messages
DROP POLICY IF EXISTS messages_select ON messages;
DROP POLICY IF EXISTS messages_insert ON messages;
DROP POLICY IF EXISTS messages_update ON messages;

CREATE POLICY messages_select ON messages
  FOR SELECT USING (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR receiver_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR (is_broadcast = TRUE AND receiver_id IS NULL)
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY messages_update ON messages
  FOR UPDATE USING (
    receiver_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

-- chat_thread_metadata
DROP POLICY IF EXISTS chat_metadata_select ON chat_thread_metadata;
DROP POLICY IF EXISTS chat_metadata_insert ON chat_thread_metadata;
DROP POLICY IF EXISTS chat_metadata_update ON chat_thread_metadata;

CREATE POLICY chat_metadata_select ON chat_thread_metadata
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY chat_metadata_insert ON chat_thread_metadata
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY chat_metadata_update ON chat_thread_metadata
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

-- notifications
DROP POLICY IF EXISTS notifications_select ON notifications;
DROP POLICY IF EXISTS notifications_insert ON notifications;
DROP POLICY IF EXISTS notifications_update ON notifications;
DROP POLICY IF EXISTS notifications_delete ON notifications;

CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY notifications_delete ON notifications
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

-- board_posts
DROP POLICY IF EXISTS board_posts_select ON board_posts;
DROP POLICY IF EXISTS board_posts_insert ON board_posts;
DROP POLICY IF EXISTS board_posts_update ON board_posts;
DROP POLICY IF EXISTS board_posts_delete ON board_posts;

CREATE POLICY board_posts_select ON board_posts
  FOR SELECT USING (
    (is_hidden = FALSE AND is_deleted = FALSE)
    OR author_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY board_posts_insert ON board_posts
  FOR INSERT WITH CHECK (
    author_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND approved = TRUE)
  );

CREATE POLICY board_posts_update ON board_posts
  FOR UPDATE USING (
    author_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY board_posts_delete ON board_posts
  FOR DELETE USING (
    author_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

-- board_post_replies
DROP POLICY IF EXISTS board_post_replies_select ON board_post_replies;
DROP POLICY IF EXISTS board_post_replies_insert ON board_post_replies;
DROP POLICY IF EXISTS board_post_replies_update ON board_post_replies;
DROP POLICY IF EXISTS board_post_replies_delete ON board_post_replies;

CREATE POLICY board_post_replies_select ON board_post_replies
  FOR SELECT USING (TRUE);

CREATE POLICY board_post_replies_insert ON board_post_replies
  FOR INSERT WITH CHECK (
    author_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND approved = TRUE)
  );

CREATE POLICY board_post_replies_update ON board_post_replies
  FOR UPDATE USING (
    author_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY board_post_replies_delete ON board_post_replies
  FOR DELETE USING (
    author_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

-- board_post_interests
DROP POLICY IF EXISTS board_post_interests_select ON board_post_interests;
DROP POLICY IF EXISTS board_post_interests_insert ON board_post_interests;
DROP POLICY IF EXISTS board_post_interests_delete ON board_post_interests;

CREATE POLICY board_post_interests_select ON board_post_interests
  FOR SELECT USING (TRUE);

CREATE POLICY board_post_interests_insert ON board_post_interests
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY board_post_interests_delete ON board_post_interests
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- gallery_photos
DROP POLICY IF EXISTS gallery_photos_select ON gallery_photos;
DROP POLICY IF EXISTS gallery_photos_insert ON gallery_photos;
DROP POLICY IF EXISTS gallery_photos_update ON gallery_photos;
DROP POLICY IF EXISTS gallery_photos_delete ON gallery_photos;

CREATE POLICY gallery_photos_select ON gallery_photos
  FOR SELECT USING (
    approved = TRUE
    OR user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY gallery_photos_insert ON gallery_photos
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND approved = TRUE)
  );

CREATE POLICY gallery_photos_update ON gallery_photos
  FOR UPDATE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

CREATE POLICY gallery_photos_delete ON gallery_photos
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
    OR EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND is_admin = TRUE)
  );

-- gallery_photo_likes
DROP POLICY IF EXISTS gallery_photo_likes_select ON gallery_photo_likes;
DROP POLICY IF EXISTS gallery_photo_likes_insert ON gallery_photo_likes;
DROP POLICY IF EXISTS gallery_photo_likes_delete ON gallery_photo_likes;

CREATE POLICY gallery_photo_likes_select ON gallery_photo_likes
  FOR SELECT USING (TRUE);

CREATE POLICY gallery_photo_likes_insert ON gallery_photo_likes
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY gallery_photo_likes_delete ON gallery_photo_likes
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- event_likes
DROP POLICY IF EXISTS event_likes_select ON event_likes;
DROP POLICY IF EXISTS event_likes_insert ON event_likes;
DROP POLICY IF EXISTS event_likes_delete ON event_likes;

CREATE POLICY event_likes_select ON event_likes
  FOR SELECT USING (TRUE);

CREATE POLICY event_likes_insert ON event_likes
  FOR INSERT WITH CHECK (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY event_likes_delete ON event_likes
  FOR DELETE USING (
    user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

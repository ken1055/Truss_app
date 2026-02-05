// =============================================
// Truss App - Supabase Client Configuration
// =============================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  );
}

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// =============================================
// Auth Helper Functions
// =============================================

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

/**
 * Sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  return { data, error };
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });
  return { data, error };
}

/**
 * Send email verification (magic link)
 */
export async function sendMagicLink(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  return { data, error };
}

// =============================================
// Storage Helper Functions
// =============================================

const BUCKETS = {
  STUDENT_ID_IMAGES: 'student-id-images',
  EVENT_IMAGES: 'event-images',
  GALLERY_PHOTOS: 'gallery-photos',
  USER_AVATARS: 'user-avatars',
} as const;

/**
 * Upload student ID image
 */
export async function uploadStudentIdImage(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/student-id.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.STUDENT_ID_IMAGES)
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) return { url: null, error };

  // Get the URL (private bucket, use signed URL)
  const { data: urlData } = await supabase.storage
    .from(BUCKETS.STUDENT_ID_IMAGES)
    .createSignedUrl(fileName, 60 * 60 * 24); // 24 hours

  return { url: urlData?.signedUrl || null, error: null };
}

/**
 * Delete student ID image (after approval)
 */
export async function deleteStudentIdImage(userId: string) {
  const { error } = await supabase.storage
    .from(BUCKETS.STUDENT_ID_IMAGES)
    .remove([`${userId}/student-id.jpg`, `${userId}/student-id.png`, `${userId}/student-id.jpeg`]);
  return { error };
}

/**
 * Upload event image
 */
export async function uploadEventImage(eventId: number, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `event-${eventId}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.EVENT_IMAGES)
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from(BUCKETS.EVENT_IMAGES)
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Upload gallery photo
 */
export async function uploadGalleryPhoto(userId: string, eventId: number, file: File) {
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const fileName = `${eventId}/${userId}-${timestamp}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.GALLERY_PHOTOS)
    .upload(fileName, file);

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from(BUCKETS.GALLERY_PHOTOS)
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Delete gallery photo
 */
export async function deleteGalleryPhoto(filePath: string) {
  const { error } = await supabase.storage
    .from(BUCKETS.GALLERY_PHOTOS)
    .remove([filePath]);
  return { error };
}

/**
 * Upload user avatar
 */
export async function uploadUserAvatar(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKETS.USER_AVATARS)
    .upload(fileName, file, {
      upsert: true,
    });

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from(BUCKETS.USER_AVATARS)
    .getPublicUrl(fileName);

  return { url: urlData.publicUrl, error: null };
}

// =============================================
// Realtime Subscription Helpers
// =============================================

/**
 * Subscribe to messages for a user
 */
export function subscribeToMessages(
  userId: string,
  callback: (payload: { new: Database['public']['Tables']['messages']['Row'] }) => void
) {
  return supabase
    .channel(`messages:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to notifications for a user
 */
export function subscribeToNotifications(
  userId: string,
  callback: (payload: { new: Database['public']['Tables']['notifications']['Row'] }) => void
) {
  return supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to event participants
 */
export function subscribeToEventParticipants(
  eventId: number,
  callback: (payload: { 
    eventType: 'INSERT' | 'DELETE';
    new?: Database['public']['Tables']['event_participants']['Row'];
    old?: Database['public']['Tables']['event_participants']['Row'];
  }) => void
) {
  return supabase
    .channel(`event_participants:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'event_participants',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'DELETE',
          new: payload.new as Database['public']['Tables']['event_participants']['Row'],
          old: payload.old as Database['public']['Tables']['event_participants']['Row'],
        });
      }
    )
    .subscribe();
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(channel: ReturnType<typeof supabase.channel>) {
  supabase.removeChannel(channel);
}

export default supabase;

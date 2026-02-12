// =============================================
// Truss App - Data Context (Supabase)
// =============================================

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import type { 
  User, Event, EventParticipant, Message, MessageThread, 
  ChatThreadMetadata, Notification, BoardPost, BoardPostReply, GalleryPhoto 
} from '../App';

interface DataContextType {
  // Data state
  events: Event[];
  pendingUsers: User[];
  approvedMembers: User[];
  messageThreads: MessageThread;
  chatThreadMetadata: ChatThreadMetadata;
  notifications: Notification[];
  boardPosts: BoardPost[];
  eventParticipants: { [eventId: number]: EventParticipant[] };
  galleryPhotos: GalleryPhoto[];
  
  // Loading states
  loading: boolean;
  
  // Event methods
  createEvent: (event: Omit<Event, 'id' | 'currentParticipants' | 'likes'>) => Promise<void>;
  updateEvent: (eventId: number, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (eventId: number) => Promise<void>;
  registerForEvent: (eventId: number, photoRefusal?: boolean) => Promise<void>;
  unregisterFromEvent: (eventId: number) => Promise<void>;
  toggleEventLike: (eventId: number) => Promise<void>;
  
  // User management (admin)
  approveUser: (userId: string) => Promise<void>;
  rejectUser: (userId: string) => Promise<void>;
  requestReupload: (userId: string, reason: string) => Promise<void>;
  confirmFeePayment: (userId: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  
  // Message methods
  sendMessage: (receiverId: string, text: string, isAdmin?: boolean) => Promise<void>;
  sendBroadcast: (text: string, subjectJa: string, subjectEn: string) => Promise<void>;
  markMessageAsRead: (messageId: number) => Promise<void>;
  markAllMessagesAsReadForUser: (userId: string) => Promise<void>;
  updateChatMetadata: (userId: string, updates: Partial<{ pinned: boolean; flagged: boolean }>) => Promise<void>;
  
  // Notification methods
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  dismissNotification: (notificationId: string) => Promise<void>;
  
  // Board methods
  createBoardPost: (post: Omit<BoardPost, 'id' | 'replies'>) => Promise<void>;
  addReply: (postId: number, reply: Omit<BoardPostReply, 'id'>) => Promise<void>;
  toggleInterest: (postId: number) => Promise<void>;
  deleteBoardPost: (postId: number) => Promise<void>;
  
  // Gallery methods
  uploadGalleryPhoto: (photo: Omit<GalleryPhoto, 'id' | 'likes' | 'uploadedAt' | 'approved'>) => Promise<void>;
  deleteGalleryPhoto: (photoId: number) => Promise<void>;
  approveGalleryPhoto: (photoId: number) => Promise<void>;
  likeGalleryPhoto: (photoId: number) => Promise<void>;
  
  // Refresh methods
  refreshEvents: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  refreshBoardPosts: () => Promise<void>;
  refreshGalleryPhotos: () => Promise<void>;
  
  // Setters for backward compatibility
  setMessageThreads: React.Dispatch<React.SetStateAction<MessageThread>>;
  setChatThreadMetadata: React.Dispatch<React.SetStateAction<ChatThreadMetadata>>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  setBoardPosts: React.Dispatch<React.SetStateAction<BoardPost[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedMembers, setApprovedMembers] = useState<User[]>([]);
  const [messageThreads, setMessageThreads] = useState<MessageThread>({});
  const [chatThreadMetadata, setChatThreadMetadata] = useState<ChatThreadMetadata>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>([]);
  const [eventParticipants, setEventParticipants] = useState<{ [eventId: number]: EventParticipant[] }>({});
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // =============================================
  // Fetch Functions
  // =============================================

  const fetchEvents = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const appEvents: Event[] = (data || []).map(e => ({
        id: e.id,
        title: e.title,
        titleEn: e.title_en || undefined,
        description: e.description,
        descriptionEn: e.description_en || undefined,
        date: e.date,
        time: e.time,
        location: e.location,
        locationEn: e.location_en || undefined,
        googleMapUrl: e.google_map_url || undefined,
        maxParticipants: e.max_participants,
        currentParticipants: e.current_participants,
        likes: e.likes,
        image: e.image || '',
        tags: {
          friendsCanMeet: e.tags_friends_can_meet,
          photoContest: e.tags_photo_contest,
        },
        status: e.status,
        photos: e.photos_count,
        lineGroupLink: e.line_group_link || undefined,
      }));

      setEvents(appEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      // Fetch pending users
      const { data: pending, error: pendingError } = await supabase
        .from('users')
        .select('*')
        .eq('approved', false)
        .eq('registration_step', 'waiting_approval');

      if (pendingError) throw pendingError;

      // Fetch approved users
      const { data: approved, error: approvedError } = await supabase
        .from('users')
        .select('*')
        .eq('approved', true);

      if (approvedError) throw approvedError;

      const convertUser = (u: any): User => ({
        id: u.id,
        email: u.email,
        name: u.name || '',
        nickname: u.nickname || '',
        furigana: u.furigana || '',
        birthday: u.birthday || '',
        languages: u.languages || [],
        birthCountry: u.country || '',
        category: u.category,
        approved: u.approved,
        isAdmin: u.is_admin,
        studentIdImage: u.student_id_image || undefined,
        studentNumber: u.student_number || undefined,
        grade: u.grade || undefined,
        major: u.major || undefined,
        phone: u.phone || undefined,
        organizations: u.organizations || undefined,
        blocked: u.blocked,
        registrationStep: u.registration_step,
        emailVerified: u.email_verified,
        initialRegistered: u.initial_registered,
        profileCompleted: u.profile_completed,
        feePaid: u.fee_paid,
        studentIdReuploadRequested: u.student_id_reupload_requested,
        reuploadReason: u.reupload_reason || undefined,
        requestedAt: u.requested_at || undefined,
      });

      setPendingUsers((pending || []).map(convertUser));
      setApprovedMembers((approved || []).map(convertUser));
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('time', { ascending: true });

      if (error) throw error;

      // Group messages by user
      const threads: MessageThread = {};
      (data || []).forEach(m => {
        const threadUserId = m.is_admin ? m.receiver_id : m.sender_id;
        if (!threadUserId) return;

        if (!threads[threadUserId]) {
          threads[threadUserId] = [];
        }

        threads[threadUserId].push({
          id: m.id,
          senderId: m.sender_id,
          senderName: m.sender_name,
          text: m.text,
          time: m.time,
          isAdmin: m.is_admin,
          read: m.read,
          pinned: m.pinned,
          flagged: m.flagged,
          isBroadcast: m.is_broadcast,
          broadcastSubject: m.broadcast_subject || undefined,
          broadcastSubjectEn: m.broadcast_subject_en || undefined,
        });
      });

      setMessageThreads(threads);

      // Fetch chat metadata
      const { data: metaData, error: metaError } = await supabase
        .from('chat_thread_metadata')
        .select('*');

      if (!metaError && metaData) {
        const metadata: ChatThreadMetadata = {};
        metaData.forEach(m => {
          metadata[m.user_id] = {
            pinned: m.pinned,
            flagged: m.flagged,
            unreadCount: m.unread_count,
          };
        });
        setChatThreadMetadata(metadata);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('time', { ascending: false });

      if (error) throw error;

      const appNotifications: Notification[] = (data || []).map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        titleEn: n.title_en || undefined,
        description: n.description,
        descriptionEn: n.description_en || undefined,
        time: n.time,
        icon: n.icon,
        link: n.link || undefined,
        linkPage: n.link_page || undefined,
        read: n.read,
      }));

      setNotifications(appNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  const fetchBoardPosts = useCallback(async () => {
    try {
      const { data: posts, error: postsError } = await supabase
        .from('board_posts')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_hidden', false)
        .order('time', { ascending: false });

      if (postsError) throw postsError;

      const postIds = (posts || []).map(p => p.id);

      const { data: replies, error: repliesError } = await supabase
        .from('board_post_replies')
        .select('*')
        .in('post_id', postIds)
        .order('time', { ascending: true });

      if (repliesError) throw repliesError;

      const repliesByPost: { [key: number]: BoardPostReply[] } = {};
      (replies || []).forEach(r => {
        if (!repliesByPost[r.post_id]) repliesByPost[r.post_id] = [];
        repliesByPost[r.post_id].push({
          id: r.id,
          author: r.author,
          authorAvatar: r.author_avatar || '',
          content: r.content,
          time: r.time,
        });
      });

      const appPosts: BoardPost[] = (posts || []).map(p => ({
        id: p.id,
        author: p.author,
        authorAvatar: p.author_avatar || '',
        title: p.title,
        content: p.content,
        language: p.language,
        peopleNeeded: p.people_needed,
        interested: p.interested,
        tag: p.tag,
        time: p.time,
        image: p.image || undefined,
        displayType: p.display_type,
        expiryDate: p.expiry_date || undefined,
        isHidden: p.is_hidden,
        isDeleted: p.is_deleted,
        category: p.category || undefined,
        date: p.date || undefined,
        replies: repliesByPost[p.id] || [],
      }));

      setBoardPosts(appPosts);
    } catch (error) {
      console.error('Error fetching board posts:', error);
    }
  }, []);

  const fetchGalleryPhotos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      const photos: GalleryPhoto[] = (data || []).map(p => ({
        id: p.id,
        eventId: p.event_id,
        eventName: p.event_name,
        eventDate: p.event_date,
        image: p.image,
        likes: p.likes,
        height: p.height || undefined,
        userId: p.user_id,
        userName: p.user_name,
        uploadedAt: p.uploaded_at,
        approved: p.approved,
      }));

      setGalleryPhotos(photos);
    } catch (error) {
      console.error('Error fetching gallery photos:', error);
    }
  }, []);

  const fetchEventParticipants = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('event_participants')
        .select('*');

      if (error) throw error;

      const participants: { [eventId: number]: EventParticipant[] } = {};
      (data || []).forEach(p => {
        if (!participants[p.event_id]) participants[p.event_id] = [];
        participants[p.event_id].push({
          userId: p.user_id,
          userName: p.user_name,
          userNickname: p.user_nickname,
          registeredAt: p.registered_at,
          photoRefusal: p.photo_refusal,
        });
      });

      setEventParticipants(participants);
    } catch (error) {
      console.error('Error fetching event participants:', error);
    }
  }, []);

  // =============================================
  // Initialize Data
  // =============================================

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      await Promise.all([
        fetchEvents(),
        fetchUsers(),
        fetchBoardPosts(),
        fetchEventParticipants(),
        fetchGalleryPhotos(),
      ]);
      setLoading(false);
    };

    initData();
  }, [fetchEvents, fetchUsers, fetchBoardPosts, fetchEventParticipants, fetchGalleryPhotos]);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchNotifications();
    }
  }, [user, fetchMessages, fetchNotifications]);

  // =============================================
  // Event Methods
  // =============================================

  const createEvent = async (eventData: Omit<Event, 'id' | 'currentParticipants' | 'likes'>) => {
    console.log('=== createEvent called ===');
    console.log('Event data:', eventData);
    
    // Check current auth session
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Current session:', sessionData?.session ? 'Active' : 'None');
    console.log('Session user:', sessionData?.session?.user?.email);
    
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: eventData.title,
          title_en: eventData.titleEn || null,
          description: eventData.description,
          description_en: eventData.descriptionEn || null,
          date: eventData.date,
          time: eventData.time,
          location: eventData.location,
          location_en: eventData.locationEn || null,
          google_map_url: eventData.googleMapUrl || null,
          max_participants: eventData.maxParticipants,
          current_participants: 0,
          likes: 0,
          image: eventData.image || null,
          tags_friends_can_meet: eventData.tags.friendsCanMeet,
          tags_photo_contest: eventData.tags.photoContest,
          status: eventData.status,
          line_group_link: eventData.lineGroupLink || null,
        })
        .select();

      console.log('Insert result - data:', data);
      console.log('Insert result - error:', error);

      if (error) throw error;
      await fetchEvents();
      console.log('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const updateEvent = async (eventId: number, updates: Partial<Event>) => {
    try {
      const dbUpdates: Record<string, unknown> = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.titleEn !== undefined) dbUpdates.title_en = updates.titleEn;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.descriptionEn !== undefined) dbUpdates.description_en = updates.descriptionEn;
      if (updates.date !== undefined) dbUpdates.date = updates.date;
      if (updates.time !== undefined) dbUpdates.time = updates.time;
      if (updates.location !== undefined) dbUpdates.location = updates.location;
      if (updates.locationEn !== undefined) dbUpdates.location_en = updates.locationEn;
      if (updates.googleMapUrl !== undefined) dbUpdates.google_map_url = updates.googleMapUrl;
      if (updates.maxParticipants !== undefined) dbUpdates.max_participants = updates.maxParticipants;
      if (updates.image !== undefined) dbUpdates.image = updates.image;
      if (updates.tags !== undefined) {
        dbUpdates.tags_friends_can_meet = updates.tags.friendsCanMeet;
        dbUpdates.tags_photo_contest = updates.tags.photoContest;
      }
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.lineGroupLink !== undefined) dbUpdates.line_group_link = updates.lineGroupLink;

      const { error } = await supabase
        .from('events')
        .update(dbUpdates)
        .eq('id', eventId);

      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const deleteEvent = async (eventId: number) => {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
      await fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const registerForEvent = async (eventId: number, photoRefusal: boolean = false) => {
    if (!user) {
      console.error('registerForEvent: No user logged in');
      return;
    }

    try {
      console.log('Registering for event:', eventId, 'User:', user.id);
      const { data, error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id,
          user_name: user.name,
          user_nickname: user.nickname,
          photo_refusal: photoRefusal,
        })
        .select();

      if (error) {
        console.error('Event registration insert error:', error);
        throw error;
      }
      console.log('Event registration successful:', data);
      
      // Increment participant count
      const { error: rpcError } = await supabase.rpc('increment_participants', { event_id: eventId });
      if (rpcError) {
        console.error('increment_participants RPC error:', rpcError);
      }
      
      await Promise.all([fetchEvents(), fetchEventParticipants()]);
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  const unregisterFromEvent = async (eventId: number) => {
    if (!user) {
      console.error('unregisterFromEvent: No user logged in');
      return;
    }

    try {
      console.log('Unregistering from event:', eventId, 'User:', user.id);
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Event unregistration delete error:', error);
        throw error;
      }
      console.log('Event unregistration successful');
      
      // Decrement participant count
      const { error: rpcError } = await supabase.rpc('decrement_participants', { event_id: eventId });
      if (rpcError) {
        console.error('decrement_participants RPC error:', rpcError);
      }
      
      await Promise.all([fetchEvents(), fetchEventParticipants()]);
    } catch (error) {
      console.error('Error unregistering from event:', error);
    }
  };

  const toggleEventLike = async (eventId: number) => {
    if (!user) {
      console.error('toggleEventLike: No user logged in');
      return;
    }

    try {
      console.log('Toggling like for event:', eventId, 'User:', user.id);
      
      // Check if already liked
      const { data: existing, error: checkError } = await supabase
        .from('event_likes')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing like:', checkError);
      }

      if (existing) {
        console.log('Removing like...');
        const { error: deleteError } = await supabase
          .from('event_likes')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);
        if (deleteError) console.error('Delete like error:', deleteError);
        
        const { error: rpcError } = await supabase.rpc('decrement_event_likes', { p_event_id: eventId });
        if (rpcError) console.error('decrement_event_likes RPC error:', rpcError);
      } else {
        console.log('Adding like...');
        const { error: insertError } = await supabase
          .from('event_likes')
          .insert({ event_id: eventId, user_id: user.id });
        if (insertError) console.error('Insert like error:', insertError);
        
        const { error: rpcError } = await supabase.rpc('increment_event_likes', { p_event_id: eventId });
        if (rpcError) console.error('increment_event_likes RPC error:', rpcError);
      }

      await fetchEvents();
      console.log('Like toggle completed');
    } catch (error) {
      console.error('Error toggling event like:', error);
    }
  };

  // =============================================
  // User Management Methods
  // =============================================

  const approveUser = async (userId: string) => {
    try {
      const userToApprove = pendingUsers.find(u => u.id === userId);
      if (!userToApprove) return;

      let registrationStep = 'approved_limited';
      let profileCompleted = false;
      let feePaid = false;

      if (userToApprove.category === 'exchange') {
        registrationStep = 'fully_active';
        profileCompleted = true;
        feePaid = true;
      } else if (userToApprove.category === 'regular-international') {
        feePaid = true;
      }

      const { error } = await supabase
        .from('users')
        .update({
          approved: true,
          registration_step: registrationStep,
          profile_completed: profileCompleted,
          fee_paid: feePaid,
          student_id_image: null, // Remove student ID after approval
        })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const requestReupload = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          student_id_reupload_requested: true,
          reupload_reason: reason,
        })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers();
    } catch (error) {
      console.error('Error requesting reupload:', error);
    }
  };

  // 年会費支払い確認（管理者用）
  const confirmFeePayment = async (userId: string) => {
    try {
      console.log('Confirming fee payment for user:', userId);
      const { error } = await supabase
        .from('users')
        .update({
          fee_paid: true,
          registration_step: 'fully_active',
        })
        .eq('id', userId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('Fee payment confirmed successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error confirming fee payment:', error);
    }
  };

  // ユーザー削除（管理者用）
  const deleteUser = async (userId: string) => {
    try {
      console.log('Deleting user:', userId);
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      console.log('User deleted successfully');
      await fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // =============================================
  // Message Methods
  // =============================================

  const sendMessage = async (receiverId: string, text: string, isAdmin: boolean = false) => {
    console.log('=== sendMessage called ===');
    console.log('User:', user);
    console.log('Receiver ID:', receiverId);
    
    if (!user) {
      console.log('No user, returning');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          sender_name: user.name,
          text,
          is_admin: isAdmin,
        })
        .select();

      console.log('Message insert result - data:', data);
      console.log('Message insert result - error:', error);

      if (error) throw error;
      await fetchMessages();
      console.log('Message sent successfully!');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendBroadcast = async (text: string, subjectJa: string, subjectEn: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: null,
          sender_name: user.name,
          text,
          is_admin: true,
          is_broadcast: true,
          broadcast_subject: subjectJa,
          broadcast_subject_en: subjectEn,
        });

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error sending broadcast:', error);
    }
  };

  const markMessageAsRead = async (messageId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;
      await fetchMessages();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Mark all messages as read for a specific user (when they open the chat)
  const markAllMessagesAsReadForUser = async (userId: string) => {
    try {
      console.log('Marking all messages as read for user:', userId);
      
      // Update local state immediately for instant UI feedback
      setMessageThreads(prev => {
        const updated = { ...prev };
        if (updated[userId]) {
          updated[userId] = updated[userId].map(msg => 
            msg.isAdmin ? { ...msg, read: true } : msg
          );
        }
        return updated;
      });
      
      // Update in Supabase (fire and forget, don't wait)
      supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', userId)
        .eq('is_admin', true)
        .eq('read', false)
        .then(({ error }) => {
          if (error) {
            console.error('Supabase update error:', error);
          } else {
            console.log('Supabase messages marked as read');
          }
        });
      
      console.log('All messages marked as read successfully');
    } catch (error) {
      console.error('Error marking all messages as read:', error);
    }
  };

  const updateChatMetadata = async (userId: string, updates: Partial<{ pinned: boolean; flagged: boolean }>) => {
    try {
      const { data: existing } = await supabase
        .from('chat_thread_metadata')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        await supabase
          .from('chat_thread_metadata')
          .update(updates)
          .eq('user_id', userId);
      } else {
        await supabase
          .from('chat_thread_metadata')
          .insert({
            user_id: userId,
            pinned: updates.pinned || false,
            flagged: updates.flagged || false,
            unread_count: 0,
          });
      }

      await fetchMessages();
    } catch (error) {
      console.error('Error updating chat metadata:', error);
    }
  };

  // =============================================
  // Notification Methods
  // =============================================

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      await fetchNotifications();
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  // =============================================
  // Board Methods
  // =============================================

  const createBoardPost = async (post: Omit<BoardPost, 'id' | 'replies'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('board_posts')
        .insert({
          author_id: user.id,
          author: post.author,
          author_avatar: post.authorAvatar,
          title: post.title,
          content: post.content,
          language: post.language,
          people_needed: post.peopleNeeded,
          interested: 0,
          tag: post.tag,
          image: post.image || null,
          display_type: post.displayType,
          expiry_date: post.expiryDate || null,
          is_hidden: false,
          is_deleted: false,
          category: post.category || null,
          date: post.date || null,
        });

      if (error) throw error;
      await fetchBoardPosts();
    } catch (error) {
      console.error('Error creating board post:', error);
    }
  };

  const addReply = async (postId: number, reply: Omit<BoardPostReply, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('board_post_replies')
        .insert({
          post_id: postId,
          author_id: user.id,
          author: reply.author,
          author_avatar: reply.authorAvatar,
          content: reply.content,
        });

      if (error) throw error;
      await fetchBoardPosts();
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const toggleInterest = async (postId: number) => {
    if (!user) return;

    try {
      const { data: existing } = await supabase
        .from('board_post_interests')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('board_post_interests')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        await supabase.rpc('decrement_interested', { post_id: postId });
      } else {
        await supabase
          .from('board_post_interests')
          .insert({ post_id: postId, user_id: user.id });
        await supabase.rpc('increment_interested', { post_id: postId });
      }

      await fetchBoardPosts();
    } catch (error) {
      console.error('Error toggling interest:', error);
    }
  };

  const deleteBoardPost = async (postId: number) => {
    try {
      const { error } = await supabase
        .from('board_posts')
        .update({ is_deleted: true })
        .eq('id', postId);

      if (error) throw error;
      await fetchBoardPosts();
    } catch (error) {
      console.error('Error deleting board post:', error);
    }
  };

  // =============================================
  // Gallery Methods
  // =============================================

  const uploadGalleryPhoto = async (photoData: Omit<GalleryPhoto, 'id' | 'likes' | 'uploadedAt' | 'approved'>) => {
    console.log('=== uploadGalleryPhoto called ===');
    console.log('Photo data:', photoData);
    
    try {
      const { data, error } = await supabase
        .from('gallery_photos')
        .insert({
          event_id: photoData.eventId,
          event_name: photoData.eventName,
          event_date: photoData.eventDate,
          image: photoData.image,
          user_id: photoData.userId,
          user_name: photoData.userName,
          height: photoData.height || null,
          likes: 0,
          approved: false,
        })
        .select()
        .single();

      console.log('Gallery photo insert result:', { data, error });
      
      if (error) throw error;
      await fetchGalleryPhotos();
      console.log('Gallery photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading gallery photo:', error);
      throw error;
    }
  };

  const deleteGalleryPhoto = async (photoId: number) => {
    console.log('=== deleteGalleryPhoto called ===');
    
    try {
      const { error } = await supabase
        .from('gallery_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;
      await fetchGalleryPhotos();
      console.log('Gallery photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting gallery photo:', error);
      throw error;
    }
  };

  const approveGalleryPhoto = async (photoId: number) => {
    console.log('=== approveGalleryPhoto called ===');
    
    try {
      const { error } = await supabase
        .from('gallery_photos')
        .update({ approved: true })
        .eq('id', photoId);

      if (error) throw error;
      await fetchGalleryPhotos();
      console.log('Gallery photo approved successfully!');
    } catch (error) {
      console.error('Error approving gallery photo:', error);
      throw error;
    }
  };

  const likeGalleryPhoto = async (photoId: number) => {
    console.log('=== likeGalleryPhoto called ===');
    
    try {
      // Get current likes count
      const { data: currentPhoto, error: fetchError } = await supabase
        .from('gallery_photos')
        .select('likes')
        .eq('id', photoId)
        .single();

      if (fetchError) throw fetchError;

      // Increment likes
      const { error } = await supabase
        .from('gallery_photos')
        .update({ likes: (currentPhoto?.likes || 0) + 1 })
        .eq('id', photoId);

      if (error) throw error;
      await fetchGalleryPhotos();
      console.log('Gallery photo liked successfully!');
    } catch (error) {
      console.error('Error liking gallery photo:', error);
      throw error;
    }
  };

  const value: DataContextType = {
    events,
    pendingUsers,
    approvedMembers,
    messageThreads,
    chatThreadMetadata,
    notifications,
    boardPosts,
    eventParticipants,
    galleryPhotos,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    registerForEvent,
    unregisterFromEvent,
    toggleEventLike,
    approveUser,
    rejectUser,
    requestReupload,
    confirmFeePayment,
    deleteUser,
    sendMessage,
    sendBroadcast,
    markMessageAsRead,
    markAllMessagesAsReadForUser,
    updateChatMetadata,
    markNotificationAsRead,
    dismissNotification,
    createBoardPost,
    addReply,
    toggleInterest,
    deleteBoardPost,
    uploadGalleryPhoto,
    deleteGalleryPhoto,
    approveGalleryPhoto,
    likeGalleryPhoto,
    refreshEvents: fetchEvents,
    refreshUsers: fetchUsers,
    refreshMessages: fetchMessages,
    refreshNotifications: fetchNotifications,
    refreshBoardPosts: fetchBoardPosts,
    refreshGalleryPhotos: fetchGalleryPhotos,
    setMessageThreads,
    setChatThreadMetadata,
    setNotifications,
    setBoardPosts,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

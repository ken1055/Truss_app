import { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { AuthSelection } from './components/AuthSelection';
import { EmailVerification } from './components/EmailVerification';
import { InitialRegistration, InitialRegistrationData } from './components/InitialRegistration';
import { ProfileRegistration } from './components/ProfileRegistration';
import { Dashboard } from './components/Dashboard';
import { AdminPage } from './components/AdminPage';
import { AdminLogin } from './components/AdminLogin';
import { WaitingApproval } from './components/WaitingApproval';
import { LoginScreen } from './components/LoginScreen';
import { AuthCompleteScreen } from './components/AuthCompleteScreen';
import { Toaster, toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import { supabase } from './lib/supabase';
import './styles/globals.css';

export type Language = 'ja' | 'en';

export type RegistrationStep = 
  | 'email_input'
  | 'email_sent'
  | 'email_verified'
  | 'initial_registration'
  | 'waiting_approval'
  | 'approved_limited'
  | 'profile_completion'
  | 'fee_payment'
  | 'fully_active';

export interface User {
  id: string;
  email: string;
  name: string;
  nickname: string;
  furigana: string;
  birthday: string;
  languages: string[];
  birthCountry: string;
  category: 'japanese' | 'regular-international' | 'exchange';
  approved: boolean;
  isAdmin?: boolean;
  studentIdImage?: string;
  studentNumber?: string;
  grade?: string;
  major?: string;
  phone?: string;
  organizations?: string;
  blocked?: boolean;
  registrationStep: RegistrationStep;
  emailVerified: boolean;
  initialRegistered: boolean;
  profileCompleted: boolean;
  feePaid: boolean;
  membershipYear?: number; // 会員登録年度（例: 2025）
  isRenewal?: boolean; // 継続会員かどうか（入会金不要）
  studentIdReuploadRequested?: boolean;
  reuploadReason?: string;
  requestedAt?: string;
}

export interface Event {
  id: number;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  date: string;
  time: string;
  location: string;
  locationEn?: string;
  googleMapUrl?: string;
  maxParticipants: number;
  currentParticipants: number;
  likes: number;
  image: string;
  tags: {
    friendsCanMeet: boolean;
    photoContest: boolean;
  };
  status: 'upcoming' | 'past';
  photos?: number;
  lineGroupLink?: string;
}

export interface EventParticipant {
  userId: string;
  userName: string;
  userNickname: string;
  registeredAt: string;
  photoRefusal?: boolean;
}

export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isAdmin: boolean;
  read?: boolean;
  pinned?: boolean;
  flagged?: boolean;
  isBroadcast?: boolean;
  broadcastSubject?: string;
  broadcastSubjectEn?: string;
}

export interface MessageThread {
  [userId: string]: Message[];
}

export interface ChatThreadMetadata {
  [userId: string]: {
    pinned?: boolean;
    flagged?: boolean;
    unreadCount?: number;
  };
}

export interface Notification {
  id: string;
  type: 'message' | 'event' | 'photo' | 'board';
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  time: string;
  icon: 'mail' | 'calendar' | 'image' | 'user';
  link?: string;
  linkPage?: 'admin-chat' | 'events' | 'gallery' | 'bulletin' | 'messages';
  read?: boolean;
}

export interface BoardPost {
  id: number;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  language: string;
  peopleNeeded: number;
  interested: number;
  tag: 'languageExchange' | 'studyGroup' | 'event';
  time: string;
  image?: string;
  displayType: 'story' | 'board';
  expiryDate?: string;
  isHidden: boolean;
  isDeleted: boolean;
  category?: string;
  date?: string;
  replies?: BoardPostReply[];
}

export interface BoardPostReply {
  id: number;
  author: string;
  authorAvatar: string;
  content: string;
  time: string;
}

export interface GalleryPhoto {
  id: number;
  eventId: number;
  eventName: string;
  eventDate: string;
  image: string;
  likes: number;
  height?: number;
  userId: string;
  userName: string;
  uploadedAt: string;
  approved: boolean;
}

function App() {
  // Auth context
  const { 
    user: authUser, 
    loading: authLoading, 
    session,
    signInWithGoogle, 
    signOut,
    updateUser: updateAuthUser,
    refreshUser
  } = useAuth();

  // Data context
  const {
    events,
    pendingUsers,
    approvedMembers,
    messageThreads,
    chatThreadMetadata,
    notifications,
    boardPosts,
    eventParticipants,
    loading: dataLoading,
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
    setRenewalStatus,
    deleteUser,
    sendMessage,
    markNotificationAsRead,
    dismissNotification,
    createBoardPost,
    addReply,
    toggleInterest,
    deleteBoardPost,
    setMessageThreads,
    setChatThreadMetadata,
    setNotifications,
    setBoardPosts,
    refreshUsers,
    refreshBoardPosts,
  } = useData();

  const [currentPage, setCurrentPage] = useState<'landing' | 'auth-selection' | 'auth-complete' | 'login' | 'admin-login' | 'email-verification' | 'initial-registration' | 'profile' | 'dashboard' | 'admin'>('landing');
  const [language, setLanguage] = useState<Language>('ja');
  const [user, setUser] = useState<User | null>(null);
  const [tempEmail, setTempEmail] = useState('');
  const [tempInitialData, setTempInitialData] = useState<InitialRegistrationData | null>(null);
  
  const [attendingEvents, setAttendingEvents] = useState<Set<number>>(new Set());
  const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());

  // 管理画面からメンバーチャットを開く
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'members' | 'events' | 'boards' | 'chat'>('members');

  // OAuth認証後のURLパラメータをチェック
  const isOAuthCallback = () => {
    const hash = window.location.hash;
    const search = window.location.search;
    // アクセストークンやコードがURLに含まれている場合はOAuth処理中
    return hash.includes('access_token') || 
           hash.includes('error') || 
           search.includes('code=') ||
           search.includes('error=');
  };

  // Sync auth user with local user state
  useEffect(() => {
    if (authUser) {
      setUser(authUser);
      
      // OAuth処理後、URLをクリーンアップ
      if (isOAuthCallback()) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Navigate based on user state
      if (authUser.isAdmin) {
        setCurrentPage('admin');
      } else if (!authUser.initialRegistered) {
        // 初期登録がまだの場合、初期登録画面へ
        setTempEmail(authUser.email);
        setCurrentPage('initial-registration');
      } else if (!authUser.approved) {
        // 承認待ち
        setCurrentPage('dashboard');
      } else if (!authUser.profileCompleted && authUser.category !== 'exchange') {
        // プロフィール未完了（交換留学生以外）
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    } else if (!authLoading && !session) {
      // OAuth処理中の場合はランディングページへのリダイレクトを防ぐ
      if (isOAuthCallback()) {
        console.log('🔄 OAuth callback detected, waiting for session...');
        return;
      }
      // セッションがない場合のみランディングページへ
      setUser(null);
      setCurrentPage('landing');
    }
  }, [authUser, authLoading, session]);

  // Load user's event participation status
  useEffect(() => {
    if (user && eventParticipants) {
      const attending = new Set<number>();
      Object.entries(eventParticipants).forEach(([eventId, participants]) => {
        if (participants.some(p => p.userId === user.id)) {
          attending.add(parseInt(eventId));
        }
      });
      setAttendingEvents(attending);
    }
  }, [user, eventParticipants]);

  const handleGetStarted = () => {
    setCurrentPage('auth-selection');
  };

  const handleAdminLoginClick = () => {
    setCurrentPage('admin-login');
  };

  const handleAdminLogin = async (email: string, password: string) => {
    // デモ用簡易認証（開発中のみ）- Supabaseに接続しないローカルのみのデモ
    if (email === 'demo@truss.local' && password === 'demo') {
      const adminUser: User = {
        id: 'admin-001',
        email: email,
        name: 'デモ管理者',
        nickname: 'Demo',
        furigana: 'デモカンリシャ',
        birthday: '1990-01-01',
        languages: ['日本語', 'English'],
        birthCountry: 'Japan',
        category: 'japanese',
        approved: true,
        isAdmin: true,
        registrationStep: 'fully_active',
        emailVerified: true,
        initialRegistered: true,
        profileCompleted: true,
        feePaid: true,
      };
      setUser(adminUser);
      setCurrentPage('admin');
      return;
    }

    // Supabase認証
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        alert(language === 'ja' ? 'メールアドレスまたはパスワードが正しくありません' : 'Invalid email or password');
        return;
      }

      // User state will be updated by auth listener
    } catch (error) {
      console.error('Admin login error:', error);
      alert(language === 'ja' ? 'ログインエラーが発生しました' : 'Login error occurred');
    }
  };

  const handleEmailVerified = (email: string) => {
    setTempEmail(email);
    setCurrentPage('initial-registration');
  };

  const handleLogin = async (email: string) => {
    // This will be handled by Supabase auth
    toast.info(language === 'ja' ? 'ログイン処理中...' : 'Logging in...');
  };

  const handleGoogleSignup = async () => {
    toast.loading(language === 'ja' ? 'Googleで認証中...' : 'Authenticating with Google...');
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast.dismiss();
      toast.error(language === 'ja' ? 'Google認証エラー' : 'Google auth error');
      return;
    }
    
    // Auth state change will handle the rest
  };

  const handleGoogleLogin = async () => {
    toast.loading(language === 'ja' ? 'Googleで認証中...' : 'Authenticating with Google...');
    
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast.dismiss();
      toast.error(language === 'ja' ? 'Google認証エラー' : 'Google auth error');
      return;
    }
    
    // Auth state change will handle the rest
  };

  const handleAuthComplete = () => {
    if (authUser) {
      setUser(authUser);
      
      if (!authUser.initialRegistered) {
        setTempEmail(authUser.email);
        setCurrentPage('initial-registration');
      } else if (!authUser.approved) {
        setCurrentPage('dashboard');
      } else {
        setCurrentPage('dashboard');
      }
    } else {
      // New user - go to initial registration
      setCurrentPage('initial-registration');
    }
  };

  const handleInitialRegistrationComplete = async (data: InitialRegistrationData) => {
    setTempInitialData(data);
    
    if (user && user.studentIdReuploadRequested) {
      // Re-upload case
      const { error } = await updateAuthUser({
        studentIdImage: data.studentIdImage,
        studentIdReuploadRequested: false,
        reuploadReason: undefined,
      });

      if (error) {
        toast.error(language === 'ja' ? 'エラーが発生しました' : 'An error occurred');
        return;
      }

      toast.success(language === 'ja' ? '学生証を再アップロードしました' : 'Student ID re-uploaded successfully');
      setCurrentPage('dashboard');
      return;
    }
    
    // New user registration or update existing user
    const now = new Date();
    const requestedAt = now.toISOString().split('T')[0];
    
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData?.user) {
        toast.error(language === 'ja' ? '認証エラー' : 'Auth error');
        return;
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', authData.user.id)
        .single();

      const userData = {
        name: data.name,
        furigana: data.furigana,
        category: data.category,
        approved: false,
        student_id_image: data.studentIdImage,
        student_number: data.studentNumber,
        grade: data.grade,
        major: data.major,
        registration_step: 'waiting_approval',
        email_verified: true,
        initial_registered: true,
        profile_completed: false,
        fee_paid: false,
        requested_at: requestedAt,
      };

      let error;
      
      if (existingUser) {
        // Update existing user
        const result = await supabase
          .from('users')
          .update(userData)
          .eq('auth_id', authData.user.id);
        error = result.error;
      } else {
        // Insert new user
        const result = await supabase
          .from('users')
          .insert({
            auth_id: authData.user.id,
            email: tempEmail || authData.user.email,
            ...userData,
          });
        error = result.error;
      }

      if (error) {
        console.error('Error saving user:', error);
        toast.error(language === 'ja' ? 'ユーザー登録エラー' : 'User registration error');
        return;
      }

      // Refresh user data
      await refreshUser();
      await refreshUsers();
      
      toast.success(language === 'ja' ? '登録申請を送信しました' : 'Registration submitted');
      setCurrentPage('dashboard');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(language === 'ja' ? 'エラーが発生しました' : 'An error occurred');
    }
  };

  const handleProfileComplete = async (userData: User) => {
    const { error } = await updateAuthUser({
      ...userData,
      profileCompleted: true,
      registrationStep: userData.category === 'japanese' ? 'fee_payment' : 'fully_active',
    });

    if (error) {
      toast.error(language === 'ja' ? 'プロフィール更新エラー' : 'Profile update error');
      return;
    }

    await refreshUser();
    setCurrentPage('dashboard');
  };

  const handleOpenProfile = () => {
    setCurrentPage('profile');
  };

  const handleReopenInitialRegistration = () => {
    if (!user) return;
    setTempEmail(user.email);
    setCurrentPage('initial-registration');
  };

  const handleOpenMemberChat = (userId: string) => {
    setSelectedChatUserId(userId);
    setAdminActiveTab('chat');
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setTempEmail('');
    setCurrentPage('landing');
  };
  
  const handleApproveUser = async (userId: string) => {
    await approveUser(userId);
    await refreshUsers();
    
    // If the approved user is the current user, refresh their data
    if (user && user.id === userId) {
      await refreshUser();
    }
    
    toast.success(language === 'ja' ? 'ユーザーを承認しました' : 'User approved');
  };
  
  const handleRejectUser = async (userId: string) => {
    await rejectUser(userId);
    await refreshUsers();
    
    toast.success(language === 'ja' ? 'ユーザーを拒否しました' : 'User rejected');
  };
  
  const handleRequestReupload = async (userId: string, reasons?: string[]) => {
    const reasonLabels = reasons?.map(reason => {
      switch (reason) {
        case 'unclear':
          return language === 'ja' ? '画像が不鮮明' : 'Image is unclear';
        case 'not-valid':
          return language === 'ja' ? '本学の学生証ではない' : 'Not a valid student ID from this university';
        case 'mismatch':
          return language === 'ja' ? '学生証情報と入力情報が異なる' : 'Student ID information does not match the input information';
        default:
          return reason;
      }
    }) || [];
    
    const reasonText = reasonLabels.length > 0 ? reasonLabels.join('、') : '';
    
    await requestReupload(userId, reasonText);
    
    // Send message to user
    const messageText = language === 'ja' 
      ? `学生証の再アップロードをお願いします。\n\n理由: ${reasonText}`
      : `Please re-upload your student ID card.\n\nReason: ${reasonText}`;
    
    await sendMessage(userId, messageText, true);
    await refreshUsers();
    
    toast.success(language === 'ja' ? '学生証の再アップロードを依頼しました' : 'Student ID re-upload requested');
  };
  
  const handleReuploadStudentId = async (studentIdImage: string) => {
    if (!user) return;
    
    const { error } = await updateAuthUser({
      studentIdImage,
      studentIdReuploadRequested: false,
    });

    if (error) {
      toast.error(language === 'ja' ? 'エラーが発生しました' : 'An error occurred');
      return;
    }

    await refreshUser();
    toast.success(language === 'ja' ? '学生証を再アップロードしました' : 'Student ID re-uploaded successfully');
  };

  const handleDismissReuploadNotification = async () => {
    if (!user) return;
    
    const { error } = await updateAuthUser({
      studentIdReuploadRequested: false,
      reuploadReason: undefined,
    });

    if (error) {
      toast.error(language === 'ja' ? 'エラーが発生しました' : 'An error occurred');
      return;
    }

    await refreshUser();
    toast.success(language === 'ja' ? '通知を閉じました' : 'Notification dismissed');
  };
  
  const handleDismissNotification = async (notificationId: string) => {
    await dismissNotification(notificationId);
    // トーストは表示しない（バッジの減少で十分）
  };
  
  // Event handlers
  const toggleAttending = async (eventId: number) => {
    if (!user) return;

    const isCurrentlyAttending = attendingEvents.has(eventId);
    
    if (isCurrentlyAttending) {
      await unregisterFromEvent(eventId);
      setAttendingEvents(prev => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    } else {
      await registerForEvent(eventId);
      setAttendingEvents(prev => {
        const newSet = new Set(prev);
        newSet.add(eventId);
        return newSet;
      });
    }
  };
  
  const toggleLike = async (eventId: number) => {
    if (!user) return;

    await toggleEventLike(eventId);
    
    setLikedEvents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(eventId)) {
        newSet.delete(eventId);
      } else {
        newSet.add(eventId);
      }
      return newSet;
    });
  };
  
  const handleCreateEvent = async (eventData: Omit<Event, 'id' | 'currentParticipants' | 'likes'>) => {
    await createEvent(eventData);
  };
  
  const handleUpdateEvent = async (eventId: number, eventData: Partial<Event>) => {
    await updateEvent(eventId, eventData);
  };
  
  const handleDeleteEvent = async (eventId: number) => {
    await deleteEvent(eventId);
    setAttendingEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
    setLikedEvents(prev => {
      const newSet = new Set(prev);
      newSet.delete(eventId);
      return newSet;
    });
  };

  const addEventParticipant = async (eventId: number, photoRefusal: boolean = false) => {
    if (!user) return;
    await registerForEvent(eventId, photoRefusal);
  };

  const handleSendBulkEmail = async (userIds: string[], subjectJa: string, subjectEn: string, messageJa: string, messageEn: string, sendInApp: boolean, sendEmail: boolean) => {
    if (sendInApp) {
      for (const userId of userIds) {
        await sendMessage(userId, language === 'ja' ? messageJa : messageEn, true);
      }
    }
    
    if (sendEmail) {
      // TODO: Implement email sending via backend
      console.log('Email sending:', { userIds, subjectJa, subjectEn, messageJa, messageEn });
    }
    
    const messageType = sendInApp && sendEmail ? (language === 'ja' ? '通知とメール' : 'notification and email') 
                        : sendInApp ? (language === 'ja' ? '通知' : 'notification') 
                        : (language === 'ja' ? 'メール' : 'email');
    toast.success(language === 'ja' ? `${userIds.length}人に${messageType}を送信しました` : `Sent ${messageType} to ${userIds.length} members`);
  };

  // Show loading screen while auth is loading or session exists but user data is not yet loaded
  const isLoadingUser = authLoading || (session && !authUser);
  
  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          {/* Truss Logo Animation */}
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* Animated truss structure */}
                <g className="animate-pulse">
                  <line x1="10" y1="80" x2="50" y2="20" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
                  <line x1="50" y1="20" x2="90" y2="80" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
                  <line x1="10" y1="80" x2="90" y2="80" stroke="#f97316" strokeWidth="4" strokeLinecap="round" />
                  <line x1="30" y1="50" x2="70" y2="50" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" className="opacity-70" />
                </g>
                {/* Loading dots */}
                <circle cx="50" cy="50" r="3" fill="#f97316" className="animate-ping" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-bold text-orange-600 mb-2">TRUSS</h2>
          <p className="text-gray-500 text-sm">
            {language === 'ja' ? '読み込み中...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {currentPage === 'landing' && (
        <LoginScreen 
          onLogin={handleGoogleLogin}
          onAdminLogin={() => setCurrentPage('admin-login')}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
      {currentPage === 'auth-selection' && (
        <AuthSelection 
          language={language}
          onLanguageChange={setLanguage}
          onGoogleAuth={handleGoogleLogin}
        />
      )}
      {currentPage === 'login' && (
        <LoginScreen 
          onLogin={handleGoogleLogin}
          onAdminLogin={() => setCurrentPage('admin-login')}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
      {currentPage === 'email-verification' && (
        <EmailVerification 
          onVerified={handleEmailVerified} 
          onBack={() => setCurrentPage('auth-selection')}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
      {currentPage === 'initial-registration' && (
        <InitialRegistration 
          email={tempEmail}
          onComplete={handleInitialRegistrationComplete}
          language={language}
          onLanguageChange={setLanguage}
          onBack={() => setCurrentPage('landing')}
          existingUser={user || undefined}
        />
      )}
      {currentPage === 'profile' && (
        <ProfileRegistration 
          email={tempEmail}
          onComplete={handleProfileComplete}
          language={language}
          onBack={() => setCurrentPage('dashboard')}
          existingUser={user}
        />
      )}
      {currentPage === 'dashboard' && user && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout}
          language={language}
          onLanguageChange={setLanguage}
          events={events}
          attendingEvents={attendingEvents}
          likedEvents={likedEvents}
          onToggleAttending={toggleAttending}
          onToggleLike={toggleLike}
          onAddEventParticipant={addEventParticipant}
          onOpenProfile={handleOpenProfile}
          onReopenInitialRegistration={handleReopenInitialRegistration}
          onDismissReuploadNotification={handleDismissReuploadNotification}
          messageThreads={messageThreads}
          onUpdateMessageThreads={setMessageThreads}
          onSendMessage={sendMessage}
          chatThreadMetadata={chatThreadMetadata}
          onUpdateChatThreadMetadata={setChatThreadMetadata}
          notifications={notifications}
          onDismissNotification={handleDismissNotification}
          boardPosts={boardPosts}
          onUpdateBoardPosts={setBoardPosts}
          onCreateBoardPost={createBoardPost}
          onAddReply={addReply}
          onToggleInterest={toggleInterest}
        />
      )}
      {currentPage === 'admin' && user && (
        <AdminPage 
          user={user} 
          onLogout={handleLogout}
          language={language}
          onLanguageChange={setLanguage}
          events={events}
          eventParticipants={eventParticipants}
          onCreateEvent={handleCreateEvent}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          pendingUsers={pendingUsers}
          approvedMembers={approvedMembers}
          onApproveUser={handleApproveUser}
          onRejectUser={handleRejectUser}
          onRequestReupload={handleRequestReupload}
          onConfirmFeePayment={confirmFeePayment}
          onSetRenewalStatus={setRenewalStatus}
          onDeleteUser={deleteUser}
          messageThreads={messageThreads}
          onUpdateMessageThreads={setMessageThreads}
          onSendMessage={sendMessage}
          chatThreadMetadata={chatThreadMetadata}
          onUpdateChatThreadMetadata={setChatThreadMetadata}
          selectedChatUserId={selectedChatUserId}
          onOpenMemberChat={handleOpenMemberChat}
          onUpdateNotifications={setNotifications}
          boardPosts={boardPosts}
          onUpdateBoardPosts={setBoardPosts}
          onDeleteBoardPost={deleteBoardPost}
          onSendBulkEmail={handleSendBulkEmail}
        />
      )}
      {currentPage === 'admin-login' && (
        <AdminLogin 
          onLogin={handleAdminLogin}
          language={language}
          onBack={() => setCurrentPage('landing')}
        />
      )}
      {currentPage === 'auth-complete' && (
        <AuthCompleteScreen 
          onContinue={handleAuthComplete}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
      <Toaster />
    </div>
  );
}

export default App;

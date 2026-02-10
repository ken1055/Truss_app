import { useState } from 'react';
import { Home, Calendar, Users, Image, Mail, Bell, LogOut, X, Check, Clock, AlertCircle, Upload, FileText, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { HomePage } from './HomePage';
import { EventsPage } from './EventsPage';
import { MembersPage } from './MembersPage';
import { BulletinBoard } from './BulletinBoard';
import { GalleryPage } from './GalleryPage';
import { ProfilePage } from './ProfilePage';
import { NotificationsPage } from './NotificationsPage';
import { MessagesPage } from './MessagesPage';
import { LimitedAccessBanner } from './LimitedAccessBanner';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/bd10685cae8608f82fd9e782ed0442fecb293fc5.png';
import type { User as UserType, Language, Event, MessageThread, ChatThreadMetadata, Notification, BoardPost } from '../App';

type User = UserType;

interface DashboardProps {
  user: User;
  onLogout: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  events: Event[];
  attendingEvents: Set<number>;
  likedEvents: Set<number>;
  onToggleAttending: (eventId: number) => void;
  onToggleLike: (eventId: number) => void;
  onAddEventParticipant: (eventId: number, photoRefusal: boolean) => void;
  onOpenProfile: () => void;
  onReopenInitialRegistration: () => void;
  onDismissReuploadNotification?: () => void;
  messageThreads: MessageThread;
  onUpdateMessageThreads: (threads: MessageThread) => void;
  onSendMessage?: (receiverId: string, text: string, isAdmin?: boolean) => Promise<void>;
  chatThreadMetadata: ChatThreadMetadata;
  onUpdateChatThreadMetadata: (metadata: ChatThreadMetadata) => void;
  notifications: Notification[];
  onDismissNotification: (notificationId: string) => void;
  boardPosts: BoardPost[];
  onUpdateBoardPosts: (posts: BoardPost[]) => void;
}

type Page = 'home' | 'events' | 'members' | 'bulletin' | 'gallery' | 'profile' | 'notifications' | 'messages' | 'message-detail';

interface SelectedNotification {
  senderName: string;
  senderAvatar: string;
  isAdmin: boolean;
}

interface InterestedPost {
  postId: number;
  author: string;
  authorAvatar: string;
  title: string;
}

interface MessageHistory {
  [recipientId: string]: Array<{
    id: number;
    sender: 'user' | 'other';
    text: string;
    time: string;
  }>;
}

const translations = {
  ja: {
    appName: 'Truss',
    home: 'ホーム',
    events: 'イベント',
    members: 'メンバー',
    boards: '掲示板',
    gallery: 'ギャラリー',
    messages: 'メッセジ',
    logout: 'ログアウト',
  },
  en: {
    appName: 'Truss',
    home: 'Home',
    events: 'Events',
    members: 'Members',
    boards: 'Boards',
    gallery: 'Gallery',
    messages: 'Messages',
    logout: 'Logout',
  }
};

export function Dashboard({
  user,
  onLogout,
  language,
  onLanguageChange,
  events,
  attendingEvents,
  likedEvents,
  onToggleAttending,
  onToggleLike,
  onAddEventParticipant,
  onOpenProfile,
  onReopenInitialRegistration,
  onDismissReuploadNotification,
  messageThreads,
  onUpdateMessageThreads,
  chatThreadMetadata,
  onUpdateChatThreadMetadata,
  notifications,
  onDismissNotification,
  boardPosts,
  onUpdateBoardPosts
}: DashboardProps) {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<SelectedNotification | null>(null);
  const [interestedPosts, setInterestedPosts] = useState<Array<{ postId: number; author: string; authorAvatar: string; title: string }>>([]);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [highlightEventId, setHighlightEventId] = useState<number | undefined>(undefined);
  const [messageHistory, setMessageHistory] = useState<MessageHistory>({});
  const t = translations[language];

  // 未読メッセージ数を計算
  const unreadMessageCount = () => {
    const userMessages = messageThreads[user.id] || [];
    return userMessages.filter(msg => msg.isAdmin && !msg.read).length;
  };

  const handleInterested = (post: { author: string; authorAvatar: string; title: string }) => {
    setInterestedPosts(prev => [...prev, { postId: Date.now(), ...post }]);
  };

  const handleMessageClick = (notification: any) => {
    // 通知から運営チャットを開く
    if (notification.linkPage === 'admin-chat' || notification.type === 'message') {
      setSelectedNotification({
        senderName: language === 'ja' ? '運営管理者' : 'Admin',
        senderAvatar: 'A',
        isAdmin: true,
      });
      setCurrentPage('messages');
    }
  };

  const handleAdminChatClick = () => {
    // 運営チャットボックスをクリックしたときの処理
    setSelectedNotification({
      senderName: language === 'ja' ? '運営管理者' : 'Admin',
      senderAvatar: 'A',
      isAdmin: true,
    });
    setCurrentPage('messages');
  };

  const handleAdminMessageClick = (messageId: number) => {
    setSelectedMessage(messageId.toString());
    setCurrentPage('messages');
  };

  const handleBackFromMessages = () => {
    setSelectedMessage(null);
    setCurrentPage('notifications');
  };

  const handleNavigateToEvent = (eventId: number) => {
    setHighlightEventId(eventId);
    setCurrentPage('events');
    // Reset highlight after a short delay
    setTimeout(() => setHighlightEventId(undefined), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Header */}
      <header className="bg-[#F5F1E8] border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <button 
                onClick={onLogout}
                className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0 hover:opacity-80 transition-opacity"
              >
                <ImageWithFallback
                  src={logoImage}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-[#3D3D4E] text-2xl" style={{ fontFamily: "'Island Moments', cursive" }}>{t.appName}</span>
              </button>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLanguageChange(language === 'ja' ? 'en' : 'ja')}
                  className="text-[#3D3D4E] hover:bg-[#E8E4DB]"
                >
                  {language === 'ja' ? 'English' : '日本語'}
                </Button>
                
                {/* Notification Bell */}
                <Popover open={notificationOpen} onOpenChange={setNotificationOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="relative hover:bg-[#E8E4DB] p-2 w-8 h-8 flex items-center justify-center"
                    >
                      <Bell className="w-5 h-5 text-[#3D3D4E]" />
                      {notifications.length > 0 && (
                        <Badge className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center p-0 bg-red-500 text-white text-[10px] border-2 border-[#F5F1E8]">
                          {notifications.length}
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <div className="p-4 border-b flex items-center justify-between">
                      <h3 className="font-semibold text-[#3D3D4E]">
                        {language === 'ja' ? '通知' : 'Notifications'}
                      </h3>
                      <button
                        onClick={() => setNotificationOpen(false)}
                        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          {language === 'ja' ? '通知はありません' : 'No notifications'}
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const IconComponent = notif.icon === 'mail' ? Mail : notif.icon === 'calendar' ? Calendar : notif.icon === 'image' ? Image : Users;
                          const title = language === 'ja' ? notif.title : (notif.titleEn || notif.title);
                          const description = language === 'ja' ? notif.description : (notif.descriptionEn || notif.description);
                          
                          return (
                            <div key={notif.id} className="relative group border-b last:border-b-0">
                              <button
                                onClick={() => {
                                  if (notif.linkPage) {
                                    // メッセージ通知の場合は運営チャットを開く
                                    if (notif.linkPage === 'messages' || notif.type === 'message') {
                                      setSelectedNotification({
                                        senderName: language === 'ja' ? '運営管理者' : 'Admin',
                                        senderAvatar: 'A',
                                        isAdmin: true,
                                      });
                                      setCurrentPage('messages');
                                    } else {
                                      setCurrentPage(notif.linkPage);
                                    }
                                    onDismissNotification(notif.id);
                                    setNotificationOpen(false);
                                  }
                                }}
                                className="w-full p-4 pr-12 hover:bg-[#F5F1E8] transition-colors text-left"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="w-10 h-10 rounded-full bg-[#49B1E4] flex items-center justify-center flex-shrink-0">
                                    <IconComponent className="w-5 h-5 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[#3D3D4E]">
                                      {title}
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">
                                      {description}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                                  </div>
                                </div>
                              </button>
                              {/* 削除ボタン */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDismissNotification(notif.id);
                                }}
                                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                                aria-label="Close notification"
                              >
                                <X className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          );
                        })
                      )}
                    </div>
                    <div className="p-3 border-t">
                      <Button
                        onClick={() => setCurrentPage('notifications')}
                        variant="ghost"
                        className="w-full text-[#49B1E4] hover:bg-[#F5F1E8]"
                      >
                        {language === 'ja' ? 'すべての通知を見る' : 'View All Notifications'}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Popover open={profileOpen} onOpenChange={setProfileOpen}>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full p-0 hover:bg-[#E8E4DB]"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-[#3D3D4E] text-white text-sm">
                          {user.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="end">
                    <ProfilePage language={language} user={user} isCompact={true} isProfileComplete={user.profileCompleted} />
                    <div className="p-4 border-t">
                      <Button
                        onClick={() => {
                          setCurrentPage('profile');
                          setProfileOpen(false);
                        }}
                        className="w-full bg-[#49B1E4] hover:bg-[#3A9FD3] mb-2"
                      >
                        {language === 'ja' ? 'プロフィールを見る' : 'View Profile'}
                      </Button>
                      <Button
                        onClick={onLogout}
                        variant="outline"
                        className="w-full"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        {t.logout}
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={`${currentPage === 'messages' ? 'px-0 py-0 pb-0 h-[calc(100vh-4rem)]' : currentPage === 'notifications' ? 'container mx-auto px-4 py-8 pb-32 h-[calc(100vh-4rem-8rem)]' : 'container mx-auto px-4 py-8 pb-32'} ${currentPage === 'profile' ? 'bg-[#3D3D4E] min-h-screen' : ''}`}>
        {/* プログレスバー - 承認待ちの場合 */}
        {user.registrationStep === 'waiting_approval' && currentPage !== 'messages' && (
          <div className="mb-6 space-y-4">
            {/* 学生証再アップロード警告 */}
            {user.studentIdReuploadRequested && (
              <div className="border-2 rounded-lg p-5 shadow-md" style={{ backgroundColor: '#E0F3FB', borderColor: '#49B1E4' }}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#49B1E4' }}>
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2" style={{ color: '#3D3D4E' }}>
                      {language === 'ja' ? '学生証の再アップロードが必要です' : 'Student ID Re-upload Required'}
                    </h3>
                    {user.reuploadReason && (
                      <div className="mb-3">
                        <p className="text-sm font-medium mb-1" style={{ color: '#3D3D4E' }}>
                          {language === 'ja' ? '理由：' : 'Reason:'}
                        </p>
                        <p className="text-sm bg-white/50 p-2 rounded" style={{ color: '#3D3D4E' }}>
                          {user.reuploadReason}
                        </p>
                      </div>
                    )}
                    <p className="text-sm mb-3" style={{ color: '#3D3D4E' }}>
                      {language === 'ja' 
                        ? '運営チームから学生証の再アップロードが依頼されました。以下のボタンから学生証を再度アップロードしてください。' 
                        : 'The administration team has requested you to re-upload your student ID. Please re-upload it using the button below.'}
                    </p>
                    <Button
                      onClick={onReopenInitialRegistration}
                      className="text-white hover:opacity-90"
                      style={{ backgroundColor: '#49B1E4' }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {language === 'ja' ? '学生証を再アップロード' : 'Re-upload Student ID'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* プログレスバー */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between">
                {/* ステップ1: メール認証 */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-[#49B1E4] text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-center font-medium text-green-600">
                    {language === 'ja' ? '認証' : 'Verified'}
                  </p>
                </div>

                {/* 線 */}
                <div className="flex-1 h-1 bg-gray-200 mx-2 relative top-[-20px]">
                  <div className="h-full bg-[#49B1E4] transition-all duration-500" style={{ width: '100%' }} />
                </div>

                {/* ステップ2: 初期登録 */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-[#49B1E4] text-white">
                    <Check className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-center font-medium text-green-600">
                    {language === 'ja' ? '初期登録' : 'Registration'}
                  </p>
                </div>

                {/* 線 */}
                <div className="flex-1 h-1 bg-gray-200 mx-2 relative top-[-20px]">
                  <div className="h-full bg-gray-200 transition-all duration-500" style={{ width: '0%' }} />
                </div>

                {/* ステップ3: 運営の承認 */}
                <div className="flex flex-col items-center flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2 bg-[#49B1E4] text-white animate-pulse">
                    <Clock className="w-5 h-5" />
                  </div>
                  <p className="text-xs text-center font-medium text-[#49B1E4]">
                    {language === 'ja' ? '承認待ち' : 'Awaiting Approval'}
                  </p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                {language === 'ja' 
                  ? '承認後、メールでお知らせします。' 
                  : 'We will notify you by email after approval.'}
              </p>
            </div>
          </div>
        )}

        {/* 次のステップバナー - 承認済みだが次のテップが必要な場合 */}
        {user.registrationStep === 'approved_limited' && (!user.profileCompleted || !user.feePaid) && (
          <div className="mb-6 bg-gradient-to-r from-[#49B1E4] to-[#3A9BD4] rounded-lg p-6 shadow-lg text-white">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">
                  {language === 'ja' ? '運営による承認が完了しました。以下のステップを完了してください。' : 'Your registration has been approved. Please complete the following steps.'}
                </h3>
                <div className="space-y-3">
                  {/* プロフィール登録 */}
                  <div className={`flex items-center gap-3 p-3 rounded-lg ${
                    user.profileCompleted ? 'bg-white/20' : 'bg-white/30'
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      user.profileCompleted ? 'bg-green-500' : 'bg-white'
                    }`}>
                      {user.profileCompleted ? (
                        <Check className="w-5 h-5 text-white" />
                      ) : (
                        <FileText className="w-5 h-5 text-[#49B1E4]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">
                        {language === 'ja' ? 'プロフィール登録' : 'Profile Registration'}
                      </p>
                      {!user.profileCompleted && (
                        <button
                          onClick={onOpenProfile}
                          className="text-sm underline hover:no-underline mt-1"
                        >
                          {language === 'ja' ? '今すぐ登録 →' : 'Register Now →'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 年会費支払い - 日本人学生のみ表示 */}
                  {user.category === 'japanese' && (
                    <div className={`flex items-center gap-3 p-3 rounded-lg ${
                      user.feePaid ? 'bg-white/20' : 'bg-white/30'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        user.feePaid ? 'bg-green-500' : 'bg-white'
                      }`}>
                        {user.feePaid ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <CreditCard className="w-5 h-5 text-[#49B1E4]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {language === 'ja' ? '年会費の支払い' : 'Annual Fee Payment'}
                        </p>
                        {!user.feePaid && (
                          <p className="text-sm opacity-90 mt-1">
                            {language === 'ja' ? '¥3,000（デモ版では自動的に完了します）' : '¥3,000 (Auto-completed in demo)'}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Limited Access Banner */}
        <LimitedAccessBanner 
          language={language}
          user={user}
          onOpenProfile={onOpenProfile}
        />
        
        {currentPage === 'home' && <HomePage language={language} user={user} events={events} onNavigateToEvent={handleNavigateToEvent} onOpenProfile={onOpenProfile} onReopenInitialRegistration={onReopenInitialRegistration} onDismissReuploadNotification={onDismissReuploadNotification} />}
        {currentPage === 'events' && <EventsPage language={language} events={events} attendingEvents={attendingEvents} likedEvents={likedEvents} onToggleAttending={onToggleAttending} onToggleLike={onToggleLike} highlightEventId={highlightEventId} onAddEventParticipant={onAddEventParticipant} user={user} />}
        {currentPage === 'members' && <MembersPage language={language} />}
        {currentPage === 'bulletin' && <BulletinBoard language={language} user={user} onInterested={handleInterested} boardPosts={boardPosts} onUpdateBoardPosts={onUpdateBoardPosts} />}
        {currentPage === 'gallery' && <GalleryPage language={language} />}
        {currentPage === 'profile' && <ProfilePage language={language} user={user} isProfileComplete={user.isProfileComplete} onClose={() => setCurrentPage('home')} />}
        {currentPage === 'notifications' && <NotificationsPage language={language} user={user} onMessageClick={handleMessageClick} interestedPosts={interestedPosts} notifications={notifications} onDismissNotification={onDismissNotification} unreadAdminMessagesCount={unreadMessageCount()} onAdminChatClick={handleAdminChatClick} />}
        {currentPage === 'messages' && selectedNotification && (
          <MessagesPage 
            language={language} 
            user={user} 
            recipientName={selectedNotification.senderName}
            recipientAvatar={selectedNotification.senderAvatar}
            isAdmin={selectedNotification.isAdmin}
            onBack={handleBackFromMessages}
            messageHistory={messageHistory}
            setMessageHistory={setMessageHistory}
            messageThreads={messageThreads}
            onUpdateMessageThreads={onUpdateMessageThreads}
            chatThreadMetadata={chatThreadMetadata}
            onUpdateChatThreadMetadata={onUpdateChatThreadMetadata}
          />
        )}
      </main>

      {/* Bottom Navigation - Hide on messages page */}
      {currentPage !== 'messages' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#F5F1E8] border-t z-50 shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex justify-around items-end">
              <NavButton
                icon={<Home className="w-5 h-5" />}
                label={t.home}
                active={currentPage === 'home'}
                onClick={() => setCurrentPage('home')}
              />
              <NavButton
                icon={<Calendar className="w-5 h-5" />}
                label={t.events}
                active={currentPage === 'events'}
                onClick={() => setCurrentPage('events')}
              />
              <NavButton
                icon={<Image className="w-5 h-5" />}
                label={t.gallery}
                active={currentPage === 'gallery'}
                onClick={() => setCurrentPage('gallery')}
              />
              <NavButton
                icon={<Users className="w-5 h-5" />}
                label={t.bulletin}
                active={currentPage === 'bulletin'}
                onClick={() => setCurrentPage('bulletin')}
              />
              <NavButton
                icon={<Mail className="w-5 h-5" />}
                label={t.messages}
                active={currentPage === 'messages' || currentPage === 'notifications'}
                badgeCount={unreadMessageCount()}
                onClick={() => setCurrentPage('notifications')}
              />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}

function NavButton({ 
  icon, 
  label, 
  active, 
  onClick,
  badgeCount
}: { 
  icon: React.ReactNode; 
  label: string; 
  active: boolean; 
  onClick: () => void;
  badgeCount?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center py-3 px-4 transition-all duration-300 group ${
        active
          ? 'text-[#3D3D4E]'
          : 'text-[#6B6B7A] hover:text-[#3D3D4E]'
      }`}
    >
      {/* ボコっと上がる丸いアイコン背景 */}
      <div className={`
        transition-all duration-300 ease-out
        flex items-center justify-center relative
        ${active 
          ? 'bg-[#3D3D4E] text-white rounded-full w-14 h-14 -translate-y-4 shadow-xl' 
          : 'group-hover:bg-[#E8E4DB] group-hover:rounded-full group-hover:w-12 group-hover:h-12 group-hover:-translate-y-2 group-hover:shadow-lg w-10 h-10'
        }
      `}>
        {icon}
        {badgeCount !== undefined && badgeCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 border-2 border-[#F5F1E8] flex items-center justify-center">
            <span className="text-white text-xs font-medium">{badgeCount}</span>
          </div>
        )}
      </div>
    </button>
  );
}
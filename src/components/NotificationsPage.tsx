import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Bell, Calendar, MessageSquare, Users, Image as ImageIcon, AlertCircle, Mail, X } from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import type { Language, User, Notification } from '../App';

interface NotificationsPageProps {
  language: Language;
  user: User;
  onMessageClick?: (notification: any) => void;
  interestedPosts?: Array<{ postId: number; author: string; authorAvatar: string; title: string }>;
  notifications: Notification[];
  onDismissNotification: (notificationId: string) => void;
  unreadAdminMessagesCount?: number;
  onAdminChatClick?: () => void;
}

const translations = {
  ja: {
    title: 'お知らせ',
    today: '今日',
    thisWeek: '今週',
    earlier: '以前',
    eventReminder: 'イベントリマインダー',
    newPost: '新しい投稿',
    eventUpdate: 'イベント更新',
    newMember: '新規メンバー',
    photoUploaded: '写真がアップロードされました',
    importantNotice: '重要なお知らせ',
    markAllRead: 'すべて既読にする',
    noNotifications: 'お知らせはありません',
    adminChat: '運営',
    tapToOpenChat: 'タップしてチャットを開く →',
  },
  en: {
    title: 'Notifications',
    today: 'Today',
    thisWeek: 'This Week',
    earlier: 'Earlier',
    eventReminder: 'Event Reminder',
    newPost: 'New Post',
    eventUpdate: 'Event Update',
    newMember: 'New Member',
    photoUploaded: 'Photo Uploaded',
    importantNotice: 'Important Notice',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications',
    adminChat: 'Admin',
    tapToOpenChat: 'Tap to open chat →',
  }
};

export function NotificationsPage({ language, user, onMessageClick, interestedPosts = [], notifications, onDismissNotification, unreadAdminMessagesCount, onAdminChatClick }: NotificationsPageProps) {
  const t = translations[language];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* 運営チャットボックス + 区切り線 - 固定位置 */}
      {onAdminChatClick && (
        <div className="flex-shrink-0">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all border-2 border-[#49B1E4] bg-gradient-to-r from-white to-[#E0F3FB]"
            onClick={onAdminChatClick}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#49B1E4] to-[#3A9FD3] flex items-center justify-center shadow-md">
                  <MessageSquare className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg text-[#3D3D4E] mb-1">{t.adminChat}</p>
                  <p className="text-[#49B1E4] text-sm font-semibold flex items-center gap-1">
                    {t.tapToOpenChat}
                  </p>
                </div>
                {unreadAdminMessagesCount && unreadAdminMessagesCount > 0 && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                    <span className="text-white text-sm font-bold">{unreadAdminMessagesCount}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <div className="border-t-2 border-gray-300 my-4"></div>
        </div>
      )}

      {/* お知らせ部分 - スクロール可能 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 pb-4">
          <h2 className="text-2xl font-bold text-[#3D3D4E] mb-6">{t.title}</h2>

          <div className="space-y-2">
            {notifications.map((notification) => {
              const IconComponent = notification.icon === 'mail' ? Mail : notification.icon === 'calendar' ? Calendar : notification.icon === 'image' ? ImageIcon : Users;
              const title = language === 'ja' ? notification.title : (notification.titleEn || notification.title);
              const description = language === 'ja' ? notification.description : (notification.descriptionEn || notification.description);
              
              return (
                <Card 
                  key={notification.id} 
                  className={`group relative hover:shadow-md transition-all ${
                    notification.type === 'message' || notification.linkPage === 'admin-chat' 
                      ? 'cursor-pointer hover:border-[#49B1E4]' 
                      : ''
                  }`}
                  onClick={() => {
                    if ((notification.type === 'message' || notification.linkPage === 'admin-chat') && onMessageClick) {
                      onMessageClick(notification);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#49B1E4] flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-medium text-[#3D3D4E]">{title}</p>
                          <span className="text-[#6B6B7A] text-xs flex-shrink-0">{notification.time}</span>
                        </div>
                        <p className="text-[#6B6B7A] text-sm">{description}</p>
                        {(notification.type === 'message' || notification.linkPage === 'admin-chat') && (
                          <p className="text-[#49B1E4] text-xs mt-2 font-medium">
                            {language === 'ja' ? 'タップしてメッセージを開く →' : 'Tap to open message →'}
                          </p>
                        )}
                      </div>
                      {/* 削除ボタン */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismissNotification(notification.id);
                        }}
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Close notification"
                      >
                        <X className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {notifications.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-12 h-12 text-[#6B6B7A] mx-auto mb-4" />
                <p className="text-[#6B6B7A]">{t.noNotifications}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
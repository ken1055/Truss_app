import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { MessageCircle, Send, Pin, Flag, ArrowLeft } from 'lucide-react';
import type { Language, MessageThread, User as UserType, Message, ChatThreadMetadata } from '../App';

interface AdminChatMessagesProps {
  language: Language;
  messageThreads: MessageThread;
  onUpdateMessageThreads: (threads: MessageThread) => void;
  approvedMembers?: UserType[];
  pendingUsers?: UserType[];
  chatThreadMetadata: ChatThreadMetadata;
  onUpdateChatThreadMetadata: (metadata: ChatThreadMetadata) => void;
  selectedChatUserId?: string | null;
  onOpenMemberChat?: (userId: string) => void;
}

const translations = {
  ja: {
    noMessages: 'まだメッセージがありません',
    typeMessage: 'メッセージを入力...',
    send: '送信',
    selectUser: 'ユーザーを選択してください',
    pinThread: 'スレッドをピン留め',
    unpinThread: 'ピンを外す',
    flagThread: 'スレッドにフラグ',
    unflagThread: 'フラグを外す',
  },
  en: {
    noMessages: 'No messages yet',
    typeMessage: 'Type a message...',
    send: 'Send',
    selectUser: 'Select a user',
    pinThread: 'Pin thread',
    unpinThread: 'Unpin thread',
    flagThread: 'Flag thread',
    unflagThread: 'Unflag thread',
  }
};

export function AdminChatMessages({ language, messageThreads, onUpdateMessageThreads, approvedMembers = [], pendingUsers = [], chatThreadMetadata, onUpdateChatThreadMetadata, selectedChatUserId, onOpenMemberChat }: AdminChatMessagesProps) {
  const t = translations[language];
  const [selectedUserId, setSelectedUserId] = useState<string | null>(selectedChatUserId || null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedUserId, messageThreads]);

  // selectedChatUserIdが変更されたときに選択ユーザーを更新
  useEffect(() => {
    if (selectedChatUserId) {
      setSelectedUserId(selectedChatUserId);
      
      // もしそのユーザーとのチャットスレッドが存在しない場合は作成
      if (!messageThreads[selectedChatUserId]) {
        const updatedThreads = {
          ...messageThreads,
          [selectedChatUserId]: [],
        };
        onUpdateMessageThreads(updatedThreads);
      }

      // 全てのメッセージを既読にする
      const messages = messageThreads[selectedChatUserId] || [];
      const hasUnread = messages.some(m => !m.isAdmin && !m.read);
      
      if (hasUnread) {
        const updatedMessages = messages.map(m => 
          m.isAdmin ? m : { ...m, read: true }
        );
        const updatedThreads = {
          ...messageThreads,
          [selectedChatUserId]: updatedMessages,
        };
        onUpdateMessageThreads(updatedThreads);
      }

      // 未読数を0にリセット
      const currentMetadata = chatThreadMetadata[selectedChatUserId] || {};
      if (currentMetadata.unreadCount && currentMetadata.unreadCount > 0) {
        const updatedMetadata = {
          ...chatThreadMetadata,
          [selectedChatUserId]: {
            ...currentMetadata,
            unreadCount: 0,
          },
        };
        onUpdateChatThreadMetadata(updatedMetadata);
      }
    }
  }, [selectedChatUserId]);

  // ユーザーリストを取得（全ての承認済みユーザー + メッセージがあるユーザー）
  // 全ての承認済みユーザーをベースにする
  const allUserIds = new Set<string>();
  
  // 承認済みメンバーを追加
  approvedMembers.forEach(member => allUserIds.add(member.id));
  
  // メッセージスレッドがあるユーザーを追加（承認待ちユーザーも含む）
  Object.keys(messageThreads).forEach(userId => allUserIds.add(userId));
  
  const usersWithMessages = Array.from(allUserIds).map(userId => {
    const messages = messageThreads[userId] || [];
    const lastMessage = messages[messages.length - 1];
    const user = approvedMembers.find(m => m.id === userId) || pendingUsers?.find(m => m.id === userId);
    const metadata = chatThreadMetadata[userId] || {};
    
    return {
      userId,
      userName: user?.name || 'Unknown User',
      userAvatar: user?.nickname ? user.nickname.charAt(0).toUpperCase() : 'U',
      lastMessage: lastMessage?.text || '',
      lastMessageTime: lastMessage?.time || '',
      unreadCount: messages.filter(m => !m.isAdmin && !m.read).length,
      pinned: metadata.pinned || false,
      flagged: metadata.flagged || false,
    };
  });

  // ピン留めされたスレッドを上に表示
  const sortedUsers = [...usersWithMessages].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  const selectedUser = selectedUserId ? usersWithMessages.find(u => u.userId === selectedUserId) : null;
  const currentMessages = selectedUserId ? (messageThreads[selectedUserId] || []) : [];

  // ユーザー選択時に未読数をリセット
  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    
    // 全てのメッセージを既読にする
    const messages = messageThreads[userId] || [];
    const hasUnread = messages.some(m => !m.isAdmin && !m.read);
    
    if (hasUnread) {
      const updatedMessages = messages.map(m => 
        m.isAdmin ? m : { ...m, read: true }
      );
      const updatedThreads = {
        ...messageThreads,
        [userId]: updatedMessages,
      };
      onUpdateMessageThreads(updatedThreads);
    }
    
    // 未読数を0にリセット
    const currentMetadata = chatThreadMetadata[userId] || {};
    if (currentMetadata.unreadCount && currentMetadata.unreadCount > 0) {
      const updatedMetadata = {
        ...chatThreadMetadata,
        [userId]: {
          ...currentMetadata,
          unreadCount: 0,
        },
      };
      onUpdateChatThreadMetadata(updatedMetadata);
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUserId) return;

    const message: Message = {
      id: Date.now(),
      senderId: 'admin-001',
      senderName: language === 'ja' ? '運営管理者' : 'Admin',
      text: newMessage,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      isAdmin: true,
      read: false, // ユーザーがまだ読んでいない
    };

    const updatedThreads = {
      ...messageThreads,
      [selectedUserId]: [...(messageThreads[selectedUserId] || []), message],
    };

    console.log('Sending message:', message);
    console.log('Updated threads:', updatedThreads);
    onUpdateMessageThreads(updatedThreads);
    
    // メタデータを更新（最終メッセージ時刻などを記録）
    const currentMetadata = chatThreadMetadata[selectedUserId] || {};
    const updatedMetadata = {
      ...chatThreadMetadata,
      [selectedUserId]: {
        ...currentMetadata,
        lastMessageTime: message.time,
      },
    };
    onUpdateChatThreadMetadata(updatedMetadata);
    
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePin = (messageId: number) => {
    if (!selectedUserId) return;
    
    const updatedMessages = (messageThreads[selectedUserId] || []).map(msg =>
      msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
    );
    
    const updatedThreads = {
      ...messageThreads,
      [selectedUserId]: updatedMessages,
    };
    
    onUpdateMessageThreads(updatedThreads);
  };

  const toggleFlag = (messageId: number) => {
    if (!selectedUserId) return;
    
    const updatedMessages = (messageThreads[selectedUserId] || []).map(msg =>
      msg.id === messageId ? { ...msg, flagged: !msg.flagged } : msg
    );
    
    const updatedThreads = {
      ...messageThreads,
      [selectedUserId]: updatedMessages,
    };
    
    onUpdateMessageThreads(updatedThreads);
  };

  // チャットスレッド全体のピン・フラグ切り替え
  const toggleThreadPin = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentMetadata = chatThreadMetadata[userId] || {};
    const updatedMetadata = {
      ...chatThreadMetadata,
      [userId]: {
        ...currentMetadata,
        pinned: !currentMetadata.pinned,
      },
    };
    onUpdateChatThreadMetadata(updatedMetadata);
  };

  const toggleThreadFlag = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentMetadata = chatThreadMetadata[userId] || {};
    const updatedMetadata = {
      ...chatThreadMetadata,
      [userId]: {
        ...currentMetadata,
        flagged: !currentMetadata.flagged,
      },
    };
    onUpdateChatThreadMetadata(updatedMetadata);
  };

  // メッセージをピン済みと通常に分ける
  const pinnedMessages = currentMessages.filter(msg => msg.pinned);
  const regularMessages = currentMessages.filter(msg => !msg.pinned);

  const renderMessage = (message: Message) => (
    <div
      key={message.id}
      className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'} group`}
    >
      <div className={`max-w-[75%] ${message.isAdmin ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-2 relative overflow-visible ${
            message.isAdmin
              ? 'bg-[#3D3D4E] text-white'
              : 'bg-gray-100 text-[#3D3D4E]'
          } ${message.pinned ? 'ring-2 ring-[#FFD700]' : ''}`}
        >
          {/* フラグアイコンをメッセージの右上に表示 */}
          {message.flagged && (
            <Flag className="w-3 h-3 text-red-500 absolute -top-1 -right-1 fill-red-500" />
          )}
          {/* ピンアイコンをメッセージの左上に表示 */}
          {message.pinned && (
            <Pin className="w-3 h-3 text-yellow-500 absolute -top-1 -left-1 fill-yellow-500" />
          )}
          <p className="break-words">{message.text}</p>
        </div>
        <div className={`flex items-center gap-2 mt-1 ${message.isAdmin ? 'justify-end' : 'justify-start'}`}>
          <p className="text-xs text-gray-400">
            {message.time}
          </p>
          {/* ホバー時にアクションボタンを表示 */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button
              onClick={() => togglePin(message.id)}
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                message.pinned ? 'text-yellow-500' : 'text-gray-400'
              }`}
              title={message.pinned ? 'ピンを外す' : 'ピンする'}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => toggleFlag(message.id)}
              className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                message.flagged ? 'text-red-500' : 'text-gray-400'
              }`}
              title={message.flagged ? 'フラグを外す' : 'フラグする'}
            >
              <Flag className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-[600px] gap-4">
      {/* ユーザーリスト - モバイルではユーザー選択時に非表示 */}
      <div className={`w-full md:w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col ${
        selectedUserId ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {sortedUsers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                {t.noMessages}
              </div>
            ) : (
              <div>
                {sortedUsers.map((user) => (
                  <div
                    key={user.userId}
                    className={`relative w-full text-left hover:bg-gray-50 transition-colors border-b border-gray-200 group ${
                      selectedUserId === user.userId ? 'bg-blue-50 border-l-4 border-[#49B1E4]' : ''
                    }`}
                  >
                    <button
                      onClick={() => handleSelectUser(user.userId)}
                      className="w-full p-4 text-left relative"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-[#49B1E4] text-white">
                              {user.userAvatar}
                            </AvatarFallback>
                          </Avatar>
                          {/* スレッドのピン・フラグアイコン（アバターの横に表示） */}
                          <div className="absolute -right-1 top-0 flex flex-col gap-0.5">
                            {user.pinned && (
                              <Pin className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            )}
                            {user.flagged && (
                              <Flag className="w-3 h-3 text-red-500 fill-red-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <p className="font-medium text-gray-900 truncate">{user.userName}</p>
                          </div>
                          <p className="text-xs text-gray-500 truncate">{user.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-gray-400">{user.lastMessageTime}</p>
                            {/* 未読バッジ - 時刻の横（左下）に配置 */}
                            {user.unreadCount > 0 && (
                              <div className="bg-red-500 text-white text-xs rounded-full h-4 min-w-[16px] px-1.5 flex items-center justify-center font-medium">
                                {user.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* アクションボタン - ホバー時に表示 */}
                    <div 
                      className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <button
                        onClick={(e) => toggleThreadPin(user.userId, e)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-yellow-600 transition-colors"
                        title={user.pinned ? t.unpinThread : t.pinThread}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => toggleThreadFlag(user.userId, e)}
                        className="p-1 rounded hover:bg-gray-200 text-gray-600 hover:text-red-600 transition-colors"
                        title={user.flagged ? t.unflagThread : t.flagThread}
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>

      {/* チャットエリア - モバイルではユーザー未選択時に非表示 */}
      <div className={`flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden ${
        !selectedUserId ? 'hidden md:flex' : 'flex'
      }`}>
        {selectedUser ? (
          <>
            {/* ヘッダー */}
            <div className="p-4 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
              {/* モバイル用の戻るボタン */}
              <button
                onClick={() => setSelectedUserId(null)}
                className="md:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[#3D3D4E]" />
              </button>
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-[#49B1E4] text-white">
                  {selectedUser.userAvatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-gray-900">{selectedUser.userName}</h3>
              </div>
            </div>

            {/* メッセージ */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="space-y-4 p-4">
                  {/* ピン済みメッセージ */}
                  {pinnedMessages.length > 0 && (
                    <>
                      {pinnedMessages.map(renderMessage)}
                      {/* 区切り線 */}
                      {regularMessages.length > 0 && (
                        <div className="relative py-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="px-3 bg-white text-gray-500">
                              {language === 'ja' ? 'ピン済みメッセージ ↑' : 'Pinned Messages ↑'}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {/* 通常メッセージ */}
                  {regularMessages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* 入力エリア */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.typeMessage}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-[#49B1E4] hover:bg-[#3A9BD4] px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{t.selectUser}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
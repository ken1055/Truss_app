import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, Pin, Flag } from 'lucide-react';
import type { Language, User, Message as AppMessage, MessageThread, ChatThreadMetadata } from '../App';
import { useData } from '../contexts/DataContext';

interface MessagesPageProps {
  language: Language;
  user: User;
  recipientName: string;
  recipientAvatar: string;
  isAdmin?: boolean;
  onBack: () => void;
  messageHistory: MessageHistory;
  setMessageHistory: (history: MessageHistory | ((prev: MessageHistory) => MessageHistory)) => void;
  messageThreads: MessageThread;
  onUpdateMessageThreads: (threads: MessageThread) => void;
  chatThreadMetadata: ChatThreadMetadata;
  onUpdateChatThreadMetadata: (metadata: ChatThreadMetadata) => void;
}

interface Message {
  id: number;
  sender: 'user' | 'other';
  text: string;
  time: string;
  pinned?: boolean;
  flagged?: boolean;
  isBroadcast?: boolean; // 一斉送信メッセージかどうか
  broadcastSubject?: string; // 一斉送信のタイトル（日本語）
  broadcastSubjectEn?: string; // 一斉送信のタイトル（英語）
}

interface MessageHistory {
  [recipientId: string]: Message[];
}

const translations = {
  ja: {
    typeMessage: 'メッセージを入力...',
    send: '送信',
  },
  en: {
    typeMessage: 'Type a message...',
    send: 'Send',
  }
};

export function MessagesPage({ language, user, recipientName, recipientAvatar, isAdmin = false, onBack, messageHistory, setMessageHistory, messageThreads, onUpdateMessageThreads, chatThreadMetadata, onUpdateChatThreadMetadata }: MessagesPageProps) {
  const t = translations[language];
  const { markAllMessagesAsReadForUser } = useData();
  
  // チャットを開いたときに全メッセージを既読にする（運営からのメッセージの場合）
  // 一度だけ実行するためにuseRefを使用
  const hasMarkedAsRead = useRef(false);
  useEffect(() => {
    if (isAdmin && user.id && !hasMarkedAsRead.current) {
      hasMarkedAsRead.current = true;
      console.log('MessagesPage opened - marking all messages as read for user:', user.id);
      markAllMessagesAsReadForUser(user.id);
    }
  }, [isAdmin, user.id, markAllMessagesAsReadForUser]);
  
  // 各相手ごとの初期メッセージを設定
  const getInitialMessage = () => {
    if (isAdmin) {
      return {
        id: 1,
        sender: 'other' as const,
        text: language === 'ja' 
          ? '次回のイベントは12月25日に開催されます。参加登録をお忘れなく！'
          : 'The next event will be held on December 25th. Don\'t forget to register!',
        time: '14:30',
      };
    } else {
      return {
        id: 1,
        sender: 'other' as const,
        text: language === 'ja' 
          ? 'こんにちは！リアクションありがとうございます。'
          : 'Hello! Thanks for your reaction.',
        time: '14:30',
      };
    }
  };
  
  // recipientNameをキーにして、その相手との会話履歴を取得または初期化
  const recipientId = recipientName;
  const initialMessages = messageHistory[recipientId] || [getInitialMessage()];
  
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // recipientNameが変わったら、その相手のメッセージ履歴を読み込む
  useEffect(() => {
    const loadedMessages = messageHistory[recipientId] || [getInitialMessage()];
    setMessages(loadedMessages);
  }, [recipientId, isAdmin, language]);

  // 運営向けのメッセージの場合、messageThreadsから運営の返信を取得して表示
  useEffect(() => {
    if (isAdmin && messageThreads[user.id]) {
      const threadMessages = messageThreads[user.id];
      
      // messageThreadsのメッセージをMessagesPage形式に変換
      const convertedMessages: Message[] = threadMessages.map(msg => ({
        id: msg.id,
        sender: msg.isAdmin ? 'other' : 'user',
        text: msg.text,
        time: msg.time,
        pinned: msg.pinned,
        flagged: msg.flagged,
        isBroadcast: msg.isBroadcast,
        broadcastSubject: msg.broadcastSubject,
        broadcastSubjectEn: msg.broadcastSubjectEn,
      }));
      
      setMessages(convertedMessages);
      
      // メッセージ履歴も更新
      setMessageHistory(prev => ({
        ...prev,
        [recipientId]: convertedMessages
      }));
      
      // チャットを開いたら運営からのメッセージを既読にする
      const hasUnreadAdminMessages = threadMessages.some(msg => msg.isAdmin && !msg.read);
      if (hasUnreadAdminMessages) {
        const updatedThreadMessages = threadMessages.map(msg => ({
          ...msg,
          read: true,
        }));
        
        onUpdateMessageThreads({
          ...messageThreads,
          [user.id]: updatedThreadMessages,
        });
      }
    }
  }, [messageThreads, user.id, isAdmin]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: messages.length + 1,
        sender: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      };
      const updatedMessages = [...messages, message];
      setMessages(updatedMessages);
      setNewMessage('');
      
      // 全体のメッセージ履歴を更新
      setMessageHistory(prev => ({
        ...prev,
        [recipientId]: updatedMessages
      }));
      
      // 運営向けのメッセージの場合、App.tsxのmessageThreadsにも追加
      if (isAdmin) {
        const appMessage: AppMessage = {
          id: Date.now(),
          senderId: user.id,
          senderName: user.name,
          text: newMessage,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          isAdmin: false,
        };
        
        const updatedThreads = {
          ...messageThreads,
          [user.id]: [...(messageThreads[user.id] || []), appMessage],
        };
        
        onUpdateMessageThreads(updatedThreads);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const togglePin = (messageId: number) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
    );
    setMessages(updatedMessages);
    setMessageHistory(prev => ({
      ...prev,
      [recipientId]: updatedMessages
    }));
  };

  const toggleFlag = (messageId: number) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, flagged: !msg.flagged } : msg
    );
    setMessages(updatedMessages);
    setMessageHistory(prev => ({
      ...prev,
      [recipientId]: updatedMessages
    }));
  };

  // メッセージをピン済みと通常に分ける
  const pinnedMessages = messages.filter(msg => msg.pinned);
  const regularMessages = messages.filter(msg => !msg.pinned);

  const renderMessage = (message: Message) => {
    // 一斉送信メッセージの場合は特別なスタイルで表示
    if (message.isBroadcast) {
      const subject = language === 'ja' ? message.broadcastSubject : (message.broadcastSubjectEn || message.broadcastSubject);
      
      return (
        <div key={message.id} className="flex justify-start">
          <div className="w-full max-w-[90%] border-2 border-[#49B1E4] rounded-lg overflow-hidden bg-gradient-to-br from-white to-[#E0F3FB]">
            {/* タイトルバー */}
            <div className="bg-[#49B1E4] px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              <p className="text-white font-bold text-sm">{subject}</p>
            </div>
            {/* メッセージ本文 */}
            <div className="px-4 py-3">
              <p className="text-[#3D3D4E] whitespace-pre-wrap">{message.text}</p>
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#49B1E4]/20">
                <p className="text-xs text-[#6B6B7A]">{message.time}</p>
                <span className="text-xs px-2 py-1 rounded-full bg-[#49B1E4]/10 text-[#49B1E4] font-medium">
                  {language === 'ja' ? '全員へ' : 'Broadcast'}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // 通常メッセージ
    return (
      <div
        key={message.id}
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} group`}
      >
        <div className={`max-w-[75%] ${message.sender === 'user' ? 'order-2' : 'order-1'} relative`}>
          <div
            className={`rounded-2xl px-4 py-2 relative ${
              message.sender === 'user'
                ? 'bg-[#49B1E4] text-white'
                : 'bg-white text-[#3D3D4E]'
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
            <p className="break-words whitespace-pre-wrap">{message.text}</p>
          </div>
          <div className={`flex items-center gap-1 mt-1 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <p className="text-xs text-[#6B6B7A]">
              {message.time}
            </p>
            {/* ホバー時にアクションボタンを表示 */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-2">
              <button
                onClick={() => togglePin(message.id)}
                className={`p-1 rounded hover:bg-[#E8E4DB] transition-colors ${
                  message.pinned ? 'text-yellow-500' : 'text-gray-400'
                }`}
                title={message.pinned ? 'ピンを外す' : 'ピンする'}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => toggleFlag(message.id)}
                className={`p-1 rounded hover:bg-[#E8E4DB] transition-colors ${
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
  };

  return (
    <div className="flex flex-col bg-[#F5F1E8] h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="bg-white border-b border-[#E8E4DB] px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-1 hover:bg-[#E8E4DB] rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#3D3D4E]" />
        </button>
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-[#49B1E4] text-white">
            {recipientAvatar}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-[#3D3D4E]">{recipientName}</h2>
          {isAdmin && (
            <p className="text-xs text-[#6B6B7A]">{language === 'ja' ? '運営' : 'Admin'}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
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
                  <span className="px-3 bg-[#F5F1E8] text-gray-500">
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

      {/* Input - Fixed at bottom */}
      <div className="bg-white border-t border-[#E8E4DB] px-4 py-3 flex items-center gap-2 flex-shrink-0 sticky bottom-0">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t.typeMessage}
          className="flex-1"
          autoComplete="off"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className="bg-[#49B1E4] hover:bg-[#3A9FD3] px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
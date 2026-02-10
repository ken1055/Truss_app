import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, Pin, Flag, Mail } from 'lucide-react';
import type { Language, User, Message as AppMessage } from '../App';
import { useData } from '../contexts/DataContext';

interface AdminChatPageProps {
  language: Language;
  user: User;
  onBack: () => void;
}

interface Message {
  id: number;
  sender: 'user' | 'admin';
  text: string;
  time: string;
  pinned?: boolean;
  flagged?: boolean;
  subject?: string; // 運営からのメッセージの件名
}

const translations = {
  ja: {
    adminName: '運営',
    typeMessage: 'メッセージを入力...',
    send: '送信',
  },
  en: {
    adminName: 'Admin',
    typeMessage: 'Type a message...',
    send: 'Send',
  }
};

// 初期の運営からのメッセージ
const initialAdminMessages: Message[] = [
  {
    id: 1,
    sender: 'admin',
    subject: '【重要】春の交流会について',
    text: '春の交流会の開催日程が決定しました。\n\n日時: 3月20日（水）18:00-21:00\n場所: 学生会館3階ホール\n\n参加費: 無料\n内容: 新入生歓迎交流会、ゲーム、軽食あり\n\n参加希望の方は、イベントページから登録をお願いします。たくさんのご参加をお待ちしております！',
    time: '10:30',
  },
  {
    id: 2,
    sender: 'admin',
    subject: '年会費のお支払いについて',
    text: '年会費のお支払い期限が近づいております。\n\nお支払い期限: 2月末日まで\n金額: ¥3,000\n\nお支払い方法については、運営メンバーにお声がけください。ご協力をお願いいたします。',
    time: '昨日 14:20',
  },
  {
    id: 3,
    sender: 'admin',
    subject: 'プロフィール登録のお願い',
    text: 'プロフィール登録がまだ完了していません。\n\nメンバー同士の交流を促進するため、プロフィールの登録をお願いします。特に以下の項目をご記入ください：\n\n- 自己紹介\n- 興味のあること\n- 学年・専攻\n\nご協力をお願いします！',
    time: '1/15 16:45',
  },
  {
    id: 4,
    sender: 'admin',
    subject: '新しいイベントのお知らせ',
    text: '来月開催予定の新しいイベントについてお知らせします。\n\nイベント名: 「国際料理交流会」\n日時: 2月10日（土）13:00-17:00\n\n各国の料理を持ち寄って文化交流を行います。詳細は後日お知らせします。お楽しみに！',
    time: '1/14 11:00',
  },
];

export function AdminChatPage({ language, user, onBack }: AdminChatPageProps) {
  const t = translations[language];
  const { messageThreads, sendMessage } = useData();
  
  // Supabaseからメッセージを取得し、ローカル形式に変換
  const getMessagesFromSupabase = (): Message[] => {
    const thread = messageThreads[user.id];
    if (thread && thread.length > 0) {
      return thread.map((msg, index) => ({
        id: msg.id,
        sender: msg.isAdmin ? 'admin' as const : 'user' as const,
        text: msg.text,
        time: msg.time,
        pinned: msg.pinned,
        flagged: msg.flagged,
        subject: msg.isBroadcast ? msg.broadcastSubject : undefined,
      }));
    }
    return initialAdminMessages;
  };
  
  const [messages, setMessages] = useState<Message[]>(getMessagesFromSupabase());
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Supabaseのデータが変更されたら更新
  useEffect(() => {
    const updatedMessages = getMessagesFromSupabase();
    if (updatedMessages.length > 0) {
      setMessages(updatedMessages);
    }
  }, [messageThreads, user.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && !isSending) {
      setIsSending(true);
      
      try {
        // Supabaseにメッセージを保存
        console.log('Sending message to admin from user:', user.id);
        await sendMessage('admin-001', newMessage, false);  // ユーザーから運営へ
        
        // ローカルステートも更新（楽観的更新）
        const message: Message = {
          id: Date.now(),
          sender: 'user',
          text: newMessage,
          time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, message]);
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setIsSending(false);
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
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, pinned: !msg.pinned } : msg
    ));
  };

  const toggleFlag = (messageId: number) => {
    setMessages(messages.map(msg =>
      msg.id === messageId ? { ...msg, flagged: !msg.flagged } : msg
    ));
  };

  // メッセージをピン済みと通常に分ける
  const pinnedMessages = messages.filter(msg => msg.pinned);
  const regularMessages = messages.filter(msg => !msg.pinned);

  const renderMessage = (message: Message) => (
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
          
          {/* 運営からのメッセージに件名がある場合 */}
          {message.sender === 'admin' && message.subject && (
            <div className="font-semibold mb-2 pb-2 border-b border-gray-200">
              {language === 'ja' ? message.subject : message.subject}
            </div>
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
              <Pin className="w-3 h-3" />
            </button>
            <button
              onClick={() => toggleFlag(message.id)}
              className={`p-1 rounded hover:bg-[#E8E4DB] transition-colors ${
                message.flagged ? 'text-red-500' : 'text-gray-400'
              }`}
              title={message.flagged ? 'フラグを外す' : 'フラグをつける'}
            >
              <Flag className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-[#F5F1E8]">
      {/* Header - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b px-4 py-3 flex items-center gap-3 shadow-sm z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <Avatar className="w-10 h-10 bg-[#49B1E4]">
          <AvatarFallback className="bg-[#49B1E4] text-white">
            <Mail className="w-5 h-5" />
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h2 className="font-semibold text-[#3D3D4E]">{t.adminName}</h2>
          <p className="text-xs text-[#6B6B7A]">
            {language === 'ja' ? 'Truss運営チーム' : 'Truss Admin Team'}
          </p>
        </div>
      </div>

      {/* Messages - Scrollable area with top and bottom padding */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 mt-[73px] mb-[73px]">
        {/* ピン留めされたメッセージ */}
        {pinnedMessages.length > 0 && (
          <div className="bg-yellow-50 rounded-lg p-3 mb-4 border border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Pin className="w-4 h-4 text-yellow-600" />
              <p className="text-sm font-semibold text-yellow-800">
                {language === 'ja' ? 'ピン留めされたメッセージ' : 'Pinned Messages'}
              </p>
            </div>
            <div className="space-y-3">
              {pinnedMessages.map(renderMessage)}
            </div>
          </div>
        )}

        {/* 通常のメッセージ */}
        {regularMessages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Input - Fixed */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 z-50">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.typeMessage}
            className="flex-1 bg-[#EEEBE3] border-0"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isSending}
            className="bg-[#49B1E4] hover:bg-[#3A9BD4] px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
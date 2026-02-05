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
  birthCountry: string; // 生まれた国
  category: 'japanese' | 'regular-international' | 'exchange';
  approved: boolean;
  isAdmin?: boolean;
  studentIdImage?: string; // Base64 encoded image
  studentNumber?: string;
  grade?: string;
  major?: string;
  phone?: string; // 電話番号
  organizations?: string; // 他の所属団体
  blocked?: boolean;
  registrationStep: RegistrationStep;
  emailVerified: boolean;
  initialRegistered: boolean;
  profileCompleted: boolean;
  feePaid: boolean; // 日本人学生・国内学生のみ必要
  studentIdReuploadRequested?: boolean; // 学生証再アップロード依頼中
  reuploadReason?: string; // 再アップロード理由
  requestedAt?: string; // 申請日時
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
  photoRefusal?: boolean; // 写真撮影NGかどうか
}

export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  text: string;
  time: string;
  isAdmin: boolean;
  read?: boolean; // 既読フラグ
  pinned?: boolean;
  flagged?: boolean;
  isBroadcast?: boolean; // 一斉送信メッセージかどうか
  broadcastSubject?: string; // 一斉送信のタイトル（日本語）
  broadcastSubjectEn?: string; // 一斉送信のタイトル（英語）
}

export interface MessageThread {
  [userId: string]: Message[];
}

export interface ChatThreadMetadata {
  [userId: string]: {
    pinned?: boolean;
    flagged?: boolean;
    unreadCount?: number; // 未読数
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
  link?: string; // クリック時の遷移先
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

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth-selection' | 'auth-complete' | 'login' | 'admin-login' | 'email-verification' | 'initial-registration' | 'profile' | 'dashboard' | 'admin'>(() => {
    // ページロード時にログイン状態を確認
    try {
      const stored = localStorage.getItem('truss_currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.isAdmin) {
          return 'admin';
        } else {
          return 'dashboard';
        }
      }
    } catch (error) {
      console.error('Error loading initial page:', error);
    }
    return 'landing';
  });
  const [language, setLanguage] = useState<Language>('ja');
  const [user, setUser] = useState<User | null>(() => {
    // localStorageから現在のユーザー情報を読み込む
    try {
      const stored = localStorage.getItem('truss_currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // 別キーに保存された画像データがあれば復元
        if (parsed.id) {
          const studentIdImage = localStorage.getItem(`truss_studentId_${parsed.id}`);
          if (studentIdImage) {
            parsed.studentIdImage = studentIdImage;
          }
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('Error loading currentUser from localStorage:', error);
    }
    return null;
  });
  const [tempEmail, setTempEmail] = useState('');
  const [tempInitialData, setTempInitialData] = useState<InitialRegistrationData | null>(null);
  
  // 承認待ちユーザーリスト
  const [pendingUsers, setPendingUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('truss_pendingUsers');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading pendingUsers from localStorage:', error);
    }
    // デモ用の承認待ちユーザー
    const defaultPendingUsers = [
      {
        id: 'pending-001',
        email: 'yamada.taro@example.ac.jp',
        name: '山田太郎',
        nickname: 'やまだ',
        furigana: 'ヤマダタロウ',
        birthday: '2003-05-20',
        languages: ['日本語'],
        birthCountry: 'Japan', // 生まれた国を追加
        category: 'japanese',
        approved: false,
        registrationStep: 'pending_approval' as RegistrationStep,
        emailVerified: true,
        initialRegistered: true,
        profileCompleted: false,
        feePaid: false,
        studentNumber: 'T20230104',
        grade: '2年生',
        major: '理学部物理学科',
        studentIdImage: 'https://images.unsplash.com/photo-1613826488523-b537c0cab318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwaWQlMjBjYXJkfGVufDF8fHx8MTc2ODQ1NjczNXww&ixlib=rb-4.1.0&q=80&w=1080',
        requestedAt: '2025-01-15',
      },
      {
        id: 'pending-002',
        email: 'emily.chen@example.ac.jp',
        name: 'Emily Chen',
        nickname: 'Em',
        furigana: 'エミリーチェン',
        birthday: '2002-11-12',
        languages: ['English', 'Mandarin'],
        birthCountry: 'Singapore', // 生まれた国を追加
        category: 'exchange',
        approved: false,
        registrationStep: 'pending_approval' as RegistrationStep,
        emailVerified: true,
        initialRegistered: true,
        profileCompleted: false,
        feePaid: false,
        studentNumber: 'E20230105',
        grade: 'Year 2',
        major: 'Computer Science',
        studentIdImage: 'https://images.unsplash.com/photo-1613826488523-b537c0cab318?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50JTIwaWQlMjBjYXJkfGVufDF8fHx8MTc2ODQ1NjczNXww&ixlib=rb-4.1.0&q=80&w=1080',
        requestedAt: '2025-01-20',
      },
    ];
    // localStorageに保存
    localStorage.setItem('truss_pendingUsers', JSON.stringify(defaultPendingUsers));
    return defaultPendingUsers;
  });
  
  // 承認済みメンバーリスト
  const [approvedMembers, setApprovedMembers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem('truss_approvedMembers');
      const storedPending = localStorage.getItem('truss_pendingUsers');
      
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // pendingUsersのIDを取得
          let pendingIds: string[] = [];
          if (storedPending) {
            try {
              const pendingParsed = JSON.parse(storedPending);
              if (Array.isArray(pendingParsed)) {
                pendingIds = pendingParsed.map((u: User) => u.id);
              }
            } catch (e) {
              // ignore
            }
          }
          
          // approvedMembersからpendingUsersと重複するIDを除外
          const filtered = parsed.filter((u: User) => !pendingIds.includes(u.id));
          return filtered;
        }
      }
    } catch (error) {
      console.error('Error loading approvedMembers from localStorage:', error);
    }
    // デモ用初期メンバー
    return [
      {
        id: 'user-001',
        email: 'hanako.tanaka@example.ac.jp',
        name: '田中花子',
        nickname: 'はこ',
        furigana: 'タナカハナコ',
        birthday: '2003-04-15',
        languages: ['日本語', 'English'],
        birthCountry: 'Japan', // 生まれた国を追加
        category: 'japanese',
        approved: true,
        registrationStep: 'fully_active',
        emailVerified: true,
        initialRegistered: true,
        profileCompleted: true,
        feePaid: true,
        studentNumber: 'T20230101',
        grade: '2年生',
        major: '国関係学',
      },
      {
        id: 'user-002',
        email: 'john.smith@example.ac.jp',
        name: 'John Smith',
        nickname: 'John',
        furigana: 'ジョンスミス',
        birthday: '2002-08-22',
        languages: ['English', '日本語'],
        birthCountry: 'USA', // 生まれた国を追加
        category: 'regular-international',
        approved: true,
        registrationStep: 'fully_active',
        emailVerified: true,
        initialRegistered: true,
        profileCompleted: true,
        feePaid: true,
        studentNumber: 'I20230102',
        grade: 'Year 3',
        major: 'Business',
      },
      {
        id: 'user-003',
        email: 'taro.sato@example.ac.jp',
        name: '佐藤太郎',
        nickname: 'たろう',
        furigana: 'サトウタロウ',
        birthday: '2004-02-10',
        languages: ['日本語'],
        birthCountry: 'Japan', // 生まれた国を追加
        category: 'japanese',
        approved: true,
        registrationStep: 'fully_active',
        emailVerified: true,
        initialRegistered: true,
        profileCompleted: true,
        feePaid: true,
        studentNumber: 'T20240103',
        grade: '1年生',
        major: '経済学',
      },
    ];
  });
  
  // Event management - localStorageから初期値を読み込む
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const stored = localStorage.getItem('truss_events');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading events from localStorage:', error);
    }
    // デフォルトイント
    return [
      {
        id: 1,
        title: 'お花見パーティー',
        titleEn: 'Cherry Blossom Party',
        description: '上野公園でお花見をしましょう！',
        descriptionEn: 'Let\'s enjoy cherry blossoms at Ueno Park!',
        date: '2025-03-28',
        time: '13:00',
        location: '上野公園',
        locationEn: 'Ueno Park',
        googleMapUrl: 'https://www.google.com/maps/place/Ueno+Park/@35.7100605,139.7636285,17z/data=!3m1!4b1!4m6!3m5!1s0x60188c5999999999:0x9c59999999999999!8m2!3d35.7100605!4d139.7658172!16s%2Fg%2F11c4xq5q5q5',
        maxParticipants: 50,
        currentParticipants: 32,
        likes: 45,
        image: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&q=75',
        tags: { friendsCanMeet: true, photoContest: false },
        status: 'upcoming',
        lineGroupLink: 'https://line.me/ti/g/example-hanami',
      },
      {
        id: 2,
        title: '国際料理大会',
        titleEn: 'International Cooking Contest',
        description: '各国の料理を作って競争しましょう！',
        descriptionEn: 'Cook and compete with international dishes!',
        date: '2025-04-15',
        time: '16:00',
        location: '大学キャンパス',
        locationEn: 'University Campus',
        maxParticipants: 40,
        currentParticipants: 28,
        likes: 38,
        image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=75',
        tags: { friendsCanMeet: true, photoContest: true },
        status: 'upcoming',
        lineGroupLink: 'https://line.me/ti/g/example-cooking',
      },
      {
        id: 3,
        title: '言語交換カフェ',
        titleEn: 'Language Exchange Cafe',
        description: 'カフェで楽しく言語交換',
        descriptionEn: 'Fun language exchange at cafe',
        date: '2025-03-20',
        time: '18:00',
        location: 'スターバックス渋谷',
        locationEn: 'Starbucks Shibuya',
        maxParticipants: 30,
        currentParticipants: 25,
        likes: 52,
        image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=75',
        tags: { friendsCanMeet: true, photoContest: false },
        status: 'upcoming',
      },
      {
        id: 4,
        title: '夏祭り',
        titleEn: 'Summer Festival',
        description: '浅草神社で夏祭りを楽しみましょう！',
        descriptionEn: 'Enjoy summer festival at Asakusa Shrine!',
        date: '2024-08-10',
        time: '17:00',
        location: '浅草神社',
        locationEn: 'Asakusa Shrine',
        maxParticipants: 80,
        currentParticipants: 67,
        likes: 89,
        image: 'https://images.unsplash.com/photo-1528698127598-bca12doi7d40?w=800&q=75',
        tags: { friendsCanMeet: true, photoContest: true },
        status: 'past',
        photos: 124,
      },
    ];
  });
  
  const [attendingEvents, setAttendingEvents] = useState<Set<number>>(new Set());
  const [likedEvents, setLikedEvents] = useState<Set<number>>(new Set());
  const [eventParticipants, setEventParticipants] = useState<{ [eventId: number]: EventParticipant[] }>(() => {
    try {
      const stored = localStorage.getItem('truss_eventParticipants');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading eventParticipants from localStorage:', error);
    }
    return {};
  });

  // 掲示板管理
  const [boardPosts, setBoardPosts] = useState<BoardPost[]>(() => {
    try {
      const stored = localStorage.getItem('truss_boardPosts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading boardPosts from localStorage:', error);
    }
    // デフォルト掲示板
    return [
      {
        id: 1,
        author: 'Yuki Tanaka',
        authorAvatar: 'YT',
        title: language === 'ja' ? '英語を教えてくれる人募集！' : 'Looking for English teacher!',
        content: language === 'ja' 
          ? 'TOEIC対策のために英語を教えてくれるパートナーを探しています。週1-2回くらい話せる方、よろしくお願いします！'
          : 'Looking for a partner to help me prepare for TOEIC. Anyone who can talk 1-2 times a week, please let me know!',
        language: 'English',
        peopleNeeded: 1,
        interested: 3,
        tag: 'languageExchange',
        time: '2時間前',
        displayType: 'board',
        expiryDate: '2025-02-28',
        isHidden: false,
        isDeleted: false,
        category: 'japanese',
        date: '2025-11-05',
      },
      {
        id: 2,
        author: 'Carlos Rodriguez',
        authorAvatar: 'CR',
        title: language === 'ja' ? '日本語を勉強したい！' : 'Want to learn Japanese!',
        content: language === 'ja'
          ? '来年日本に留学予定です。日本語を教えてくれる友達がほしいです。私は英語とスペイン語を話せます。'
          : 'I\'m planning to study in Japan next year. I\'m looking for friends who can teach me Japanese. I can speak English and Spanish.',
        language: 'Japanese',
        peopleNeeded: 2,
        interested: 5,
        tag: 'languageExchange',
        time: '5時間前',
        displayType: 'board',
        expiryDate: '2025-03-15',
        isHidden: false,
        isDeleted: false,
        category: 'exchange',
        date: '2025-11-06',
      },
      {
        id: 3,
        author: 'Emma Wilson',
        authorAvatar: 'EW',
        title: language === 'ja' ? 'TOEIC勉強会メンバー募集' : 'Looking for TOEIC study group members',
        content: language === 'ja'
          ? '毎週土曜日の午後にTOEIC勉強会を開催したいと思います。目標スコア800点以上の方、一緒に頑張りましょう！'
          : 'I want to organize a weekly TOEIC study group on Saturday afternoons. Looking for people aiming for 800+ scores!',
        language: 'English',
        peopleNeeded: 5,
        interested: 8,
        tag: 'studyGroup',
        time: '1日前',
        displayType: 'board',
        expiryDate: '2025-02-20',
        isHidden: false,
        isDeleted: false,
      },
    ];
  });

  // メッセージスレッド管理
  const [messageThreads, setMessageThreads] = useState<MessageThread>(() => {
    // デモ用初期データ
    // 全ユーザー共通の一斉送信メッセージ
    const broadcastMessages: Message[] = [
      {
        id: 9001,
        senderId: 'admin-001',
        senderName: '運営管理者',
        text: `皆さん、こんにちは。

春の交流会の開催日程が決定しましたのでお知らせいたします。

【日時】
2025年3月28日（土）13:00〜17:00

【場所】
上野公園

【参加費】
無料

【持ち物】
・レジャーシート
・飲み物（アルコール不可）
・お菓子など（各自で持ち寄り）

【参加申込】
イベントページから参加登録をお願いします。
定員は50名となっておりますので、お早めにご登録ください。

皆さんのご参加をお待ちしております！

運営一同`,
        time: '10:00',
        isAdmin: true,
        isBroadcast: true,
        broadcastSubject: '【重要】春の交流会について',
        broadcastSubjectEn: '[Important] About Spring Meetup',
      },
      {
        id: 9002,
        senderId: 'admin-001',
        senderName: '運営管理者',
        text: `会員の皆様へ

年会費のお支払い期限が近づいておりますのでお知らせいたします。

【対象者】
日本人学生・国内学生

【金額】
3,000円

【支払期限】
2025年3月31日（月）

【支払方法】
プロフィールページの「年会費支払い」ボタンからお手続きください。

※交換留学生・正規留学生の方は年会費は不要です。

ご不明な点がございましたら、運営までお問い合わせください。

よろしくお願いいたします。

運営一同`,
        time: '昨日 14:00',
        isAdmin: true,
        isBroadcast: true,
        broadcastSubject: '年会費のお支払いについて',
        broadcastSubjectEn: 'About Annual Fee Payment',
      },
    ];

    return {
      'user-001': [
        ...broadcastMessages,
        {
          id: 1,
          senderId: 'user-001',
          senderName: '田中花子',
          text: '次回のイベントについて質問があります。',
          time: '10:30',
          isAdmin: false,
          read: true, // 運営が返信済みなので既読
        },
        {
          id: 2,
          senderId: 'admin-001',
          senderName: '運営管理者',
          text: 'はい、どのようなことでしょうか？',
          time: '10:35',
          isAdmin: true,
        },
        {
          id: 3,
          senderId: 'user-001',
          senderName: '田中花子',
          text: '持ち物について教えてください。',
          time: '10:40',
          isAdmin: false,
          read: false, // 最新のメッセージで運営未返信なので未読
        },
      ],
      'user-003': [
        ...broadcastMessages,
        {
          id: 1,
          senderId: 'user-003',
          senderName: '佐藤太郎',
          text: 'イベントの参加方法を教えてください',
          time: '09:15',
          isAdmin: false,
          read: false, // 運営未返信なので未読
        },
      ],
    };
  });

  // チャットスレッドのメタデータ（ピン・フラグ）
  const [chatThreadMetadata, setChatThreadMetadata] = useState<ChatThreadMetadata>(() => {
    try {
      const stored = localStorage.getItem('truss_chatThreadMetadata');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading chatThreadMetadata from localStorage:', error);
    }
    return {};
  });

  // 通知管理
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const stored = localStorage.getItem('truss_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
    // デモ用初期通知
    return [
      {
        id: 'notif-001',
        type: 'message',
        title: '新着メッセージ',
        titleEn: 'New Message',
        description: '運営から重要なお知らせが届いています',
        descriptionEn: 'Important message from admin',
        time: '30分前',
        icon: 'mail',
        linkPage: 'admin-chat',
        read: false,
      },
      {
        id: 'notif-002',
        type: 'event',
        title: '新しいイベント',
        titleEn: 'New Event',
        description: '運営が「春の交流会」イベントを投稿しました',
        descriptionEn: 'Admin posted "Spring Meetup" event',
        time: '2時間前',
        icon: 'calendar',
        linkPage: 'events',
        read: false,
      },
      {
        id: 'notif-003',
        type: 'photo',
        title: '新しい写真',
        titleEn: 'New Photo',
        description: '運営がギャラリーに写真を追加しました',
        descriptionEn: 'Admin added photos to gallery',
        time: '5時間前',
        icon: 'image',
        linkPage: 'gallery',
        read: false,
      },
      {
        id: 'notif-004',
        type: 'board',
        title: '新しい掲示板投稿',
        titleEn: 'New Board Post',
        description: '田中さんが「英語を教えてください」を投稿しました',
        descriptionEn: 'Tanaka posted "Looking for English tutor"',
        time: '1日前',
        icon: 'user',
        linkPage: 'bulletin',
        read: false,
      },
    ];
  });

  // approvedMembersが変更されたらlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('truss_approvedMembers', JSON.stringify(approvedMembers));
    } catch (error) {
      console.error('Error saving approvedMembers to localStorage:', error);
    }
  }, [approvedMembers]);

  // pendingUsersが変更されたらlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('truss_pendingUsers', JSON.stringify(pendingUsers));
    } catch (error) {
      console.error('Error saving pendingUsers to localStorage:', error);
    }
  }, [pendingUsers]);

  // userが変更されたらlocalStorageに保存（画像データを除外してサイズを削減）
  useEffect(() => {
    try {
      if (user) {
        // studentIdImageを除外してlocalStorageに保存
        const { studentIdImage, ...userWithoutImage } = user;
        localStorage.setItem('truss_currentUser', JSON.stringify(userWithoutImage));
        
        // 画像データは別のキーで保存（オプショナル）
        if (studentIdImage) {
          try {
            localStorage.setItem(`truss_studentId_${user.id}`, studentIdImage);
          } catch (imgError) {
            // 画像が大きすぎる場合はスキップ
            console.warn('Student ID image too large for localStorage, skipping image save');
          }
        }
      } else {
        localStorage.removeItem('truss_currentUser');
      }
    } catch (error) {
      console.error('Error saving currentUser to localStorage:', error);
      // エラーが発生した場合でもアプリは継続動作
    }
  }, [user]);

  // eventParticipantsが変更されたらlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('truss_eventParticipants', JSON.stringify(eventParticipants));
    } catch (error) {
      console.error('Error saving eventParticipants to localStorage:', error);
    }
  }, [eventParticipants]);

  // messageThreadsが変更されたらlocalStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem('truss_messageThreads', JSON.stringify(messageThreads));
    } catch (error) {
      console.error('Error saving messageThreads to localStorage:', error);
    }
  }, [messageThreads]);

  // chatThreadMetadataが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('truss_chatThreadMetadata', JSON.stringify(chatThreadMetadata));
  }, [chatThreadMetadata]);

  // notificationsが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('truss_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // boardPostsが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('truss_boardPosts', JSON.stringify(boardPosts));
  }, [boardPosts]);

  // pendingUsersのreuploadReasonを変換するuseEffect
  useEffect(() => {
    const convertReasonKey = (key: string): string => {
      switch (key) {
        case 'unclear':
          return language === 'ja' ? '画像が不鮮明' : 'Image is unclear';
        case 'not-valid':
          return language === 'ja' ? '本学の学生証ではない' : 'Not a valid student ID from this university';
        case 'mismatch':
          return language === 'ja' ? '学生証情報と入力情報が異なる' : 'Student ID information does not match the input information';
        default:
          return key;
      }
    };

    // pendingUsersの中にキー形式の理由がある場合、変換する
    const hasKeyFormat = pendingUsers.some(u => 
      u.reuploadReason && (
        u.reuploadReason.includes('unclear') || 
        u.reuploadReason.includes('not-valid') || 
        u.reuploadReason.includes('mismatch')
      )
    );

    if (hasKeyFormat) {
      const updatedUsers = pendingUsers.map(u => {
        if (u.reuploadReason) {
          // カンマまたは中黒分割して各理由を変換
          const reasons = u.reuploadReason.split(/[,、]/).map(r => r.trim());
          const convertedReasons = reasons.map(r => convertReasonKey(r));
          return {
            ...u,
            reuploadReason: convertedReasons.join('、')
          };
        }
        return u;
      });
      
      setPendingUsers(updatedUsers);
      
      // ログイン中のユーザーも更新
      if (user && user.reuploadReason) {
        const reasons = user.reuploadReason.split(/[,、]/).map(r => r.trim());
        const convertedReasons = reasons.map(r => convertReasonKey(r));
        const convertedReason = convertedReasons.join('、');
        
        if (convertedReason !== user.reuploadReason) {
          setUser({
            ...user,
            reuploadReason: convertedReason
          });
        }
      }
    }
  }, [language]); // languageが変わった時に再変換

  // 他のタブでの変更を検知して同期
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'truss_pendingUsers' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setPendingUsers(parsed);
            
            // もし現在のユーザーがpendingUsersに含まれている場合、userを更新
            if (user && !user.isAdmin) {
              const updatedUser = parsed.find((u: User) => u.id === user.id);
              if (updatedUser) {
                console.log('Updating user from pendingUsers storage event:', updatedUser);
                setUser(updatedUser);
              }
            }
          }
        } else if (e.key === 'truss_approvedMembers' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setApprovedMembers(parsed);
            
            // もし現在のユーザーがapprovedMembersに含まれている場合、userを更新
            if (user && !user.isAdmin) {
              const updatedUser = parsed.find((u: User) => u.id === user.id);
              if (updatedUser) {
                setUser(updatedUser);
              }
            }
          }
        } else if (e.key === 'truss_currentUser' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          // 現在のユーザーと異なる場合のみ更新（無限ループ防止）
          if (user && parsed.id === user.id && JSON.stringify(parsed) !== JSON.stringify(user)) {
            setUser(parsed);
          }
        } else if (e.key === 'truss_events' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setEvents(parsed);
          }
        } else if (e.key === 'truss_eventParticipants' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed === 'object') {
            setEventParticipants(parsed);
          }
        } else if (e.key === 'truss_messageThreads' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed === 'object') {
            setMessageThreads(parsed);
          }
        } else if (e.key === 'truss_chatThreadMetadata' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (typeof parsed === 'object') {
            setChatThreadMetadata(parsed);
          }
        } else if (e.key === 'truss_notifications' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        } else if (e.key === 'truss_boardPosts' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setBoardPosts(parsed);
          }
        }
      } catch (error) {
        console.error('Error handling storage change:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const handleGetStarted = () => {
    console.log('Get Started clicked - navigating to auth-selection');
    setCurrentPage('auth-selection');
  };

  const handleAdminLoginClick = () => {
    setCurrentPage('admin-login');
  };

  const handleAdminLogin = (email: string, password: string) => {
    // デモ用簡易認証
    if (email === 'admin@truss.com' && password === 'password') {
      const adminUser: User = {
        id: 'admin-001',
        email: email,
        name: '運営管理者',
        nickname: 'Admin',
        furigana: 'ウンエイカンリシャ',
        birthday: '1990-01-01',
        languages: ['日本語', 'English'],
        birthCountry: 'Japan', // 生まれた国を追加
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
    } else {
      alert(language === 'ja' ? 'メールアドレスまたはパスワードが正しくありません' : 'Invalid email or password');
    }
  };

  const handleEmailVerified = (email: string) => {
    setTempEmail(email);
    setCurrentPage('initial-registration');
  };

  const handleLogin = (email: string) => {
    // Find user in approvedMembers or pendingUsers
    const foundUser = [...approvedMembers, ...pendingUsers].find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      setCurrentPage('dashboard');
    } else {
      alert(language === 'ja' ? 'このメールアドレスは登録されていません' : 'This email is not registered');
    }
  };

  const handleGoogleSignup = () => {
    // デモ用Google新規登録シミュレーション
    toast.loading(language === 'ja' ? 'Googleで認証中...' : 'Authenticating with Google...');
    
    setTimeout(() => {
      toast.dismiss();
      
      // Googleからメールアドレスを取得したと仮定
      const googleEmail = `google.user.${Date.now()}@gmail.com`;
      
      // メール認証済みとして初期登録画面へ
      setTempEmail(googleEmail);
      toast.success(language === 'ja' ? 'Google認証が完了しました' : 'Google authentication completed');
      setCurrentPage('initial-registration');
    }, 1500);
  };

  const handleGoogleLogin = () => {
    // デモ用Googleログインシミュレーション
    toast.loading(language === 'ja' ? 'Googleで認証中...' : 'Authenticating with Google...');
    
    setTimeout(() => {
      toast.dismiss();
      // 認証完了画面を表示
      setCurrentPage('auth-complete');
    }, 1500);
  };

  // 認証完了後の「次へ」ボタン処理
  const handleAuthComplete = () => {
    // デモ用: 既存のGoogleユーザーを探す（メールアドレスで検索）
    const googleEmail = 'demo.google.user@gmail.com';
    const existingUser = [...approvedMembers, ...pendingUsers].find(u => u.email === googleEmail);
    
    if (existingUser) {
      // 既存ユーザーが見つかった場合、そのregistrationStepに応じた画面へ
      setUser(existingUser);
      
      // registrationStepに応じた画面遷移
      if (!existingUser.approved) {
        // 承認待ち
        setCurrentPage('dashboard'); // WaitingApprovalバナーが表示される
      } else if (!existingUser.profileCompleted && existingUser.category !== 'exchange') {
        // プロフィール登録が必要
        setCurrentPage('dashboard'); // LimitedAccessバナーが表示される
      } else {
        // 全機能利用可能
        setCurrentPage('dashboard');
      }
    } else {
      // 新規ユーザーの場合、初期登録画面へ
      setTempEmail(googleEmail);
      setCurrentPage('initial-registration');
    }
  };

  const handleInitialRegistrationComplete = (data: InitialRegistrationData) => {
    setTempInitialData(data);
    
    console.log('=== handleInitialRegistrationComplete ===');
    console.log('Current user:', user);
    console.log('User studentIdReuploadRequested:', user?.studentIdReuploadRequested);
    console.log('Data:', data);
    
    // 既存のユーザー（再アップロード）の場合
    if (user && user.studentIdReuploadRequested) {
      console.log('Re-upload path - updating existing user');
      
      const updatedUser: User = {
        ...user,
        studentIdImage: data.studentIdImage,
        studentIdReuploadRequested: false,
        reuploadReason: undefined,
      };
      
      console.log('Updated user:', updatedUser);
      
      // 承認時と同じパターン：先にuserを更新、後でpendingUsersを更新
      setUser(updatedUser);
      
      // pendingUsersを更新（承認時と同じアルゴリズム）
      const newPendingUsers = pendingUsers.map(u => 
        u.id === user.id ? updatedUser : u
      );
      setPendingUsers(newPendingUsers);
      
      console.log('PendingUsers after update:', newPendingUsers);
      
      toast.success(language === 'ja' ? '学生証を再アップロードしました' : 'Student ID re-uploaded successfully');
      setCurrentPage('dashboard');
      return;
    }
    
    console.log('New user path - creating new user');
    
    // 新規ユーザーの場合
    // より体系的なユーザーIDを生成
    // フォーマット: TRUSS + タイムスタンプ(8桁) + ランダム(4桁)
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    const userId = `TRUSS${timestamp}${random}`;
    
    // 現在の日付を取得（YYYY-MM-DD形式）
    const now = new Date();
    const requestedAt = now.toISOString().split('T')[0];
    
    // ユーザーを作成（承認待ち状態）
    const newUser: User = {
      id: userId,
      email: tempEmail,
      name: data.name,
      nickname: '',
      furigana: data.furigana,
      birthday: '',
      languages: [],
      birthCountry: '', // 生まれた国を追加
      category: data.category, // フォームから取得したカテゴリを使用
      approved: false, // 承認待ち
      studentIdImage: data.studentIdImage,
      studentNumber: data.studentNumber,
      grade: data.grade,
      major: data.major,
      registrationStep: 'waiting_approval',
      emailVerified: true,
      initialRegistered: true,
      profileCompleted: false,
      feePaid: false,
      requestedAt,
    };
    
    setUser(newUser);
    setPendingUsers([...pendingUsers, newUser]); // 承認待ちリストに追加
    
    setCurrentPage('dashboard');
  };

  const handleProfileComplete = (userData: User) => {
    setUser(userData);
    
    // approvedMembersも更新
    setApprovedMembers(approvedMembers.map(member => 
      member.id === userData.id ? userData : member
    ));
    
    setCurrentPage('dashboard');
  };

  const handleOpenProfile = () => {
    setCurrentPage('profile');
  };

  // 学生証再アップロード用に新規登録画面を開く
  const handleReopenInitialRegistration = () => {
    if (!user) return;
    console.log('=== handleReopenInitialRegistration ===');
    console.log('Current user:', user);
    console.log('User studentIdReuploadRequested:', user.studentIdReuploadRequested);
    setTempEmail(user.email);
    setCurrentPage('initial-registration');
  };

  // 管理画面からメンバーチャットを開く
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<'members' | 'events' | 'boards' | 'chat'>('members');

  const handleOpenMemberChat = (userId: string) => {
    setSelectedChatUserId(userId);
    setAdminActiveTab('chat');
  };

  const handleLogout = () => {
    // localStorageをクリア
    localStorage.removeItem('truss_currentUser');
    localStorage.removeItem('truss_pendingUsers');
    localStorage.removeItem('truss_approvedMembers');
    localStorage.removeItem('truss_events');
    localStorage.removeItem('truss_eventParticipants');
    localStorage.removeItem('truss_messageThreads');
    localStorage.removeItem('truss_chatThreadMetadata');
    localStorage.removeItem('truss_notifications');
    localStorage.removeItem('truss_boardPosts');
    
    setUser(null);
    setTempEmail('');
    setCurrentPage('landing');
  };
  
  // ユーザー承認ハンドラー
  const handleApproveUser = (userId: string) => {
    // pendingUsersから該当ユーザーを見つける
    const userToApprove = pendingUsers.find(u => u.id === userId);
    
    if (userToApprove) {
      // カテゴリに応じた registrationStep を決定
      let registrationStep: RegistrationStep;
      let profileCompleted = false;
      let feePaid = false;
      
      if (userToApprove.category === 'exchange') {
        // 交換留学生: 承認後すぐに全機能利用可能
        registrationStep = 'fully_active';
        profileCompleted = true; // プロフィール登録不要
        feePaid = true; // 年会費不要
      } else if (userToApprove.category === 'regular-international') {
        // 正規留学生: プロフィール登録が必要
        registrationStep = 'approved_limited';
        profileCompleted = false;
        feePaid = true; // 年会費不要
      } else {
        // 日本人学生・国内学生: プロフィール登録と年会費が必要
        registrationStep = 'approved_limited';
        profileCompleted = false;
        feePaid = false;
      }
      
      // 承認済みユーザーを作成（学生証写真を削除）
      const approvedUser: User = {
        ...userToApprove,
        approved: true,
        registrationStep,
        profileCompleted,
        feePaid,
        studentIdImage: undefined, // 承認後、学生証写真を削除
      };
      
      // pendingUsersから削除してapprovedMembersに追加（同時に実行）
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
      setApprovedMembers(prev => [...prev, approvedUser]);
      
      // ログインしているユーザーが承認される場合、userも更新
      if (user && user.id === userId) {
        setUser(approvedUser);
      }
    }
  };
  
  // ユーザー拒否ハンドラー
  const handleRejectUser = (userId: string) => {
    // pendingUsersから該当ユーザーを削除
    setPendingUsers(pendingUsers.filter(u => u.id !== userId));
  };
  
  // 学生証再アップロード依頼ハンドラー
  const handleRequestReupload = (userId: string, reasons?: string[]) => {
    // 理由のキーを日本語/英語のラベルに変換
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
    
    console.log('Reupload request - Original reasons:', reasons);
    console.log('Reupload request - Converted reasonText:', reasonText);
    
    // pendingUsersから該当ユーザーを見つける
    const userToUpdate = pendingUsers.find(u => u.id === userId);
    
    if (userToUpdate) {
      // 更新されたユーザーオブジェクトを作成
      const updatedUser = { 
        ...userToUpdate, 
        studentIdReuploadRequested: true, 
        reuploadReason: reasonText 
      };
      
      // pendingUsersを更新
      setPendingUsers(pendingUsers.map(u => 
        u.id === userId ? updatedUser : u
      ));
      
      // ログインしているユーザーが該当する場合、userも更新
      if (user && user.id === userId) {
        console.log('Updating current user with reupload reason:', updatedUser);
        setUser(updatedUser);
      }
      
      // 承認時と同じアルゴリズム：メッセージスレッドに自動メッセージを追加
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      const messageText = language === 'ja' 
        ? `学生証の再アップロードをお願いします。\n\n理由: ${reasonText}`
        : `Please re-upload your student ID card.\n\nReason: ${reasonText}`;
      
      const newMessage = {
        id: Date.now(),
        senderId: 'admin-001',
        senderName: language === 'ja' ? '運営管理者' : 'Admin',
        text: messageText,
        time: timeString,
        isAdmin: true,
        read: true,
      };
      
      // メッセージスレッドを更新（承認時と同じパターン）
      setMessageThreads(prev => ({
        ...prev,
        [userId]: [...(prev[userId] || []), newMessage],
      }));
    }
    
    toast.success(language === 'ja' ? '学生証の再アップロードを依頼しました' : 'Student ID re-upload requested');
  };
  
  // ユーザーが学生証を再アップロードするハンドラー
  const handleReuploadStudentId = (studentIdImage: string) => {
    if (!user) return;
    
    const updatedUser = { 
      ...user, 
      studentIdImage, 
      studentIdReuploadRequested: false 
    };
    
    setUser(updatedUser);
    
    setPendingUsers(pendingUsers.map(u => 
      u.id === user.id 
        ? updatedUser
        : u
    ));
    
    toast.success(language === 'ja' ? '学生証を再アップロードしました' : 'Student ID re-uploaded successfully');
  };

  // 学生証再アップロード通知を閉じるハンドラー
  const handleDismissReuploadNotification = () => {
    if (!user) return;
    
    const updatedUser = { 
      ...user, 
      studentIdReuploadRequested: false,
      reuploadReason: undefined
    };
    
    setUser(updatedUser);
    
    setPendingUsers(pendingUsers.map(u => 
      u.id === user.id 
        ? updatedUser
        : u
    ));
    
    toast.success(language === 'ja' ? '通知を閉じました' : 'Notification dismissed');
  };
  
  // 通知を削除するハンドラー
  const handleDismissNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    toast.success(language === 'ja' ? '通知を削除しました' : 'Notification dismissed');
  };
  
  // Event handlers
  const toggleAttending = (eventId: number) => {
    setAttendingEvents(prev => {
      const newSet = new Set(prev);
      const isCurrentlyAttending = newSet.has(eventId);
      
      if (isCurrentlyAttending) {
        newSet.delete(eventId);
        // Decrease participant count
        setEvents(events.map(e => 
          e.id === eventId 
            ? { ...e, currentParticipants: Math.max(0, e.currentParticipants - 1) }
            : e
        ));
      } else {
        newSet.add(eventId);
        // Increase participant count
        setEvents(events.map(e => 
          e.id === eventId 
            ? { ...e, currentParticipants: Math.min(e.maxParticipants, e.currentParticipants + 1) }
            : e
        ));
      }
      
      return newSet;
    });
  };
  
  const toggleLike = (eventId: number) => {
    setLikedEvents(prev => {
      const newSet = new Set(prev);
      const isCurrentlyLiked = newSet.has(eventId);
      
      if (isCurrentlyLiked) {
        newSet.delete(eventId);
        // Decrease like count
        setEvents(events.map(e => 
          e.id === eventId 
            ? { ...e, likes: Math.max(0, e.likes - 1) }
            : e
        ));
      } else {
        newSet.add(eventId);
        // Increase like count
        setEvents(events.map(e => 
          e.id === eventId 
            ? { ...e, likes: e.likes + 1 }
            : e
        ));
      }
      
      return newSet;
    });
  };
  
  const createEvent = (eventData: Omit<Event, 'id' | 'currentParticipants' | 'likes'>) => {
    const newEvent: Event = {
      ...eventData,
      id: Math.max(...events.map(e => e.id), 0) + 1,
      currentParticipants: 0,
      likes: 0,
    };
    setEvents([...events, newEvent]);
  };
  
  const updateEvent = (eventId: number, eventData: Partial<Event>) => {
    setEvents(events.map(e => 
      e.id === eventId 
        ? { ...e, ...eventData }
        : e
    ));
  };
  
  const deleteEvent = (eventId: number) => {
    setEvents(events.filter(e => e.id !== eventId));
    // Also remove from attending/liked if present
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

  const addEventParticipant = (eventId: number, photoRefusal: boolean = false) => {
    if (!user) return;
    
    // Check if user already registered for this event
    const existingParticipants = eventParticipants[eventId] || [];
    const alreadyRegistered = existingParticipants.some(p => p.userId === user.id);
    
    if (alreadyRegistered) {
      console.log('User already registered for this event');
      return;
    }
    
    const participant: EventParticipant = {
      userId: user.id,
      userName: user.name,
      userNickname: user.nickname,
      registeredAt: new Date().toISOString(),
      photoRefusal: photoRefusal,
    };

    setEventParticipants(prev => ({
      ...prev,
      [eventId]: [...(prev[eventId] || []), participant],
    }));

    // Add to attending if not already attending
    setAttendingEvents(prev => {
      const newSet = new Set(prev);
      if (!newSet.has(eventId)) {
        newSet.add(eventId);
        // Increase participant count
        setEvents(events.map(e => 
          e.id === eventId 
            ? { ...e, currentParticipants: Math.min(e.maxParticipants, e.currentParticipants + 1) }
            : e
        ));
      }
      return newSet;
    });
  };

  const handleSendBulkEmail = (userIds: string[], subjectJa: string, subjectEn: string, messageJa: string, messageEn: string, sendInApp: boolean, sendEmail: boolean) => {
    console.log('=== handleSendBulkEmail called ===');
    console.log('UserIds:', userIds);
    console.log('sendInApp:', sendInApp, 'sendEmail:', sendEmail);
    console.log('Message (JA):', messageJa);
    
    // アプリ内通知が選択されている場合、各選択されたユーザーに対してメッセージを送信
    if (sendInApp) {
      userIds.forEach(userId => {
        const now = new Date();
        const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        const newMessage: Message = {
          id: Date.now() + Math.random(), // ユニークIDを生成
          senderId: 'admin-001',
          senderName: language === 'ja' ? '運営管理者' : 'Admin',
          text: language === 'ja' ? messageJa : messageEn,
          time: timeString,
          isAdmin: true,
          read: false,
          isBroadcast: false,
        };
        
        console.log('Adding message to userId:', userId, 'Message:', newMessage);
        
        // 各ユーザーのメッセージスレッドに追加
        setMessageThreads(prev => ({
          ...prev,
          [userId]: [...(prev[userId] || []), newMessage],
        }));
      });
    }
    
    // メール通知が選択されている場合の処理（実際のメール送信はバックエンドで実装）
    if (sendEmail) {
      // TODO: メール送信APIを呼び出す
      console.log('メール送信:', { userIds, subjectJa, subjectEn, messageJa, messageEn });
    }
    
    const messageType = sendInApp && sendEmail ? (language === 'ja' ? '通知とメール' : 'notification and email') 
                        : sendInApp ? (language === 'ja' ? '通知' : 'notification') 
                        : (language === 'ja' ? 'メール' : 'email');
    toast.success(language === 'ja' ? `${userIds.length}人に${messageType}を送信しました` : `Sent ${messageType} to ${userIds.length} members`);
  };

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
          chatThreadMetadata={chatThreadMetadata}
          onUpdateChatThreadMetadata={setChatThreadMetadata}
          notifications={notifications}
          onDismissNotification={handleDismissNotification}
          boardPosts={boardPosts}
          onUpdateBoardPosts={setBoardPosts}
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
          onCreateEvent={createEvent}
          onUpdateEvent={updateEvent}
          onDeleteEvent={deleteEvent}
          pendingUsers={pendingUsers}
          approvedMembers={approvedMembers}
          onApproveUser={handleApproveUser}
          onRejectUser={handleRejectUser}
          onRequestReupload={handleRequestReupload}
          messageThreads={messageThreads}
          onUpdateMessageThreads={setMessageThreads}
          chatThreadMetadata={chatThreadMetadata}
          onUpdateChatThreadMetadata={setChatThreadMetadata}
          selectedChatUserId={selectedChatUserId}
          onOpenMemberChat={handleOpenMemberChat}
          onUpdateNotifications={setNotifications}
          boardPosts={boardPosts}
          onUpdateBoardPosts={setBoardPosts}
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
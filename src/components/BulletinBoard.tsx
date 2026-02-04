import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, X, ChevronLeft, ChevronRight, Hand, Globe2, Upload, Calendar, MessageCircle, Send } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { BoardPostWithReplies } from './BoardPostWithReplies';
import type { Language, User, BoardPost, BoardPostReply } from '../App';

interface BulletinBoardProps {
  language: Language;
  user: User;
  onInterested: (post: { author: string; authorAvatar: string; title: string }) => void;
  boardPosts: BoardPost[];
  onUpdateBoardPosts: (posts: BoardPost[]) => void;
}

const translations = {
  ja: {
    title: '掲示板',
    subtitle: '言語交換・学習パートナーを見つけよう',
    createPost: '新しい投稿',
    postTitle: 'タイトル',
    postContent: '内容',
    wantToLearn: '学びたい言語',
    peopleNeeded: '募集人数',
    uploadImage: '画像をアップロード',
    submit: '投稿する',
    cancel: 'キャンセル',
    languageExchange: '言語交換',
    studyGroup: '勉強会',
    event: 'イベント',
    close: '閉じる',
    displayType: '表示タイプ',
    storyDisplay: '1日のみ表示（ストーリー）',
    boardDisplay: 'ある期間まで表示（掲示板）',
    expiryDate: '表示期限',
    until: 'まで',
    replies: '件のリプライ',
    replyPlaceholder: 'リプライを入力...',
    sendReply: '返信',
    viewReplies: 'リプライを見る',
    comment: 'コメント',
    comments: 'コメント',
    addComment: 'コメントを追加...',
  },
  en: {
    title: 'Bulletin Board',
    subtitle: 'Find language exchange and study partners',
    createPost: 'New Post',
    postTitle: 'Title',
    postContent: 'Content',
    wantToLearn: 'Language to Learn',
    peopleNeeded: 'People Needed',
    uploadImage: 'Upload Image',
    submit: 'Submit',
    cancel: 'Cancel',
    languageExchange: 'Language Exchange',
    studyGroup: 'Study Group',
    event: 'Event',
    close: 'Close',
    displayType: 'Display Type',
    storyDisplay: '1 day only (Story)',
    boardDisplay: 'Display until date (Board)',
    expiryDate: 'Expiry Date',
    until: 'until',
    replies: 'replies',
    replyPlaceholder: 'Write a reply...',
    sendReply: 'Send',
    viewReplies: 'View replies',
    comment: 'Comment',
    comments: 'Comments',
    addComment: 'Add a comment...',
  }
};

export function BulletinBoard({ language, user, onInterested, boardPosts, onUpdateBoardPosts }: BulletinBoardProps) {
  const t = translations[language];

  // 非表示・削除された投稿を除外
  const visiblePosts = boardPosts.filter(post => !post.isHidden && !post.isDeleted);

  const [selectedStory, setSelectedStory] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [interestedPosts, setInterestedPosts] = useState<Set<number>>(new Set());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedPostForReplies, setSelectedPostForReplies] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState<Record<number, string>>({});
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    language: '',
    peopleNeeded: 1,
    displayType: 'story' as 'story' | 'board',
    expiryDate: '',
  });

  // ストーリー自動進行
  useEffect(() => {
    if (selectedStory === null) return;

    const interval = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // 次のストーリーへ
          handleNextStory();
          return 0;
        }
        return prev + 1;
      });
    }, 50); // 5秒で100%になる

    return () => clearInterval(interval);
  }, [selectedStory, storyProgress]);

  const handleStoryClick = (postId: number) => {
    setSelectedStory(postId);
    setStoryProgress(0);
  };

  const handleCloseStory = () => {
    setSelectedStory(null);
    setStoryProgress(0);
  };

  const handleNextStory = () => {
    const currentIndex = visiblePosts.findIndex(p => p.id === selectedStory);
    if (currentIndex < visiblePosts.length - 1) {
      setSelectedStory(visiblePosts[currentIndex + 1].id);
      setStoryProgress(0);
    } else {
      handleCloseStory();
    }
  };

  const handlePrevStory = () => {
    const currentIndex = visiblePosts.findIndex(p => p.id === selectedStory);
    if (currentIndex > 0) {
      setSelectedStory(visiblePosts[currentIndex - 1].id);
      setStoryProgress(0);
    }
  };

  const toggleInterested = (postId: number) => {
    // 承認待ちの場合は制限
    if (!user.approved) {
      const message = language === 'ja' 
        ? '運営による承認をお待ちください' 
        : 'Please wait for admin approval';
      alert(message);
      return;
    }
    
    // プロフィール未完了、または日本人で年会費未払いの場合は制限
    const isLimited = !user.profileCompleted || (user.category === 'japanese' && !user.feePaid);
    
    if (isLimited) {
      let message = '';
      if (language === 'ja') {
        if (!user.profileCompleted) {
          message = 'プロフィール登録完了後にご利用いただけます';
        } else if (user.category === 'japanese' && !user.feePaid) {
          message = '年会費のお支払い完了後にご利用いただけます';
        }
      } else {
        if (!user.profileCompleted) {
          message = 'Please complete your profile to use this feature';
        } else if (user.category === 'japanese' && !user.feePaid) {
          message = 'Please pay the annual fee to use this feature';
        }
      }
      alert(message);
      return;
    }
    
    const post = visiblePosts.find(p => p.id === postId);
    if (!post) return;
    
    setInterestedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
        // リアクションしたらお知らせに追加
        if (onInterested) {
          onInterested({
            author: post.author,
            authorAvatar: post.authorAvatar,
            title: post.title,
          });
        }
      }
      return newSet;
    });
  };

  const handleCreatePost = () => {
    // 承認待ちの場合は制限
    if (!user.approved) {
      const message = language === 'ja' 
        ? '運営による承認をお待ちください' 
        : 'Please wait for admin approval';
      alert(message);
      return;
    }
    
    // プロフィール未完了、または日本人で年会費未払いの場合は制限
    const isLimited = !user.profileCompleted || (user.category === 'japanese' && !user.feePaid);
    
    if (isLimited) {
      let message = '';
      if (language === 'ja') {
        if (!user.profileCompleted) {
          message = 'プロフィール登録完了後にご利用いただけます';
        } else if (user.category === 'japanese' && !user.feePaid) {
          message = '年会費のお支払い完了後にご利用いただけます';
        }
      } else {
        if (!user.profileCompleted) {
          message = 'Please complete your profile to use this feature';
        } else if (user.category === 'japanese' && !user.feePaid) {
          message = 'Please pay the annual fee to use this feature';
        }
      }
      alert(message);
      return;
    }
    
    // 新しいIDを生成（既存の最大IDに1を加算）
    const maxId = boardPosts.length > 0 ? Math.max(...boardPosts.map(p => p.id)) : 0;
    
    const post: BoardPost = {
      id: maxId + 1,
      author: user.name,
      authorAvatar: user.name.substring(0, 2).toUpperCase(),
      title: newPost.title,
      content: newPost.content,
      language: newPost.language,
      peopleNeeded: newPost.peopleNeeded,
      interested: 0,
      tag: 'languageExchange',
      time: language === 'ja' ? 'たった今' : 'Just now',
      image: previewUrl,
      displayType: newPost.displayType,
      expiryDate: newPost.expiryDate,
      isHidden: false,
      isDeleted: false,
      replies: [],
    };
    
    // boardPostsを更新
    onUpdateBoardPosts([post, ...boardPosts]);
    
    setNewPost({ title: '', content: '', language: '', peopleNeeded: 1, displayType: 'story', expiryDate: '' });
    setSelectedFile(null);
    setPreviewUrl('');
    setIsDialogOpen(false);
  };

  const handleAddReply = (postId: number, content: string) => {
    // 承認待ちの場合は制限
    if (!user.approved) {
      const message = language === 'ja' 
        ? '運営による承認をお待ちください' 
        : 'Please wait for admin approval';
      alert(message);
      return;
    }
    
    // プロフィール未完了、または日本人で年会費未払いの場合は制限
    const isLimited = !user.profileCompleted || (user.category === 'japanese' && !user.feePaid);
    
    if (isLimited) {
      let message = '';
      if (language === 'ja') {
        if (!user.profileCompleted) {
          message = 'プロフィール登録完了後にご利用いただけます';
        } else if (user.category === 'japanese' && !user.feePaid) {
          message = '年会費のお支払い完了後にご利用いただけます';
        }
      } else {
        if (!user.profileCompleted) {
          message = 'Please complete your profile to use this feature';
        } else if (user.category === 'japanese' && !user.feePaid) {
          message = 'Please pay the annual fee to use this feature';
        }
      }
      alert(message);
      return;
    }
    
    // boardPostsを更新
    onUpdateBoardPosts(boardPosts.map(post => {
      if (post.id === postId) {
        const newReply: BoardPostReply = {
          id: (post.replies?.length || 0) + 1,
          author: user.name,
          authorAvatar: user.name.substring(0, 2).toUpperCase(),
          content,
          time: language === 'ja' ? 'たった今' : 'just now',
        };
        return {
          ...post,
          replies: [...(post.replies || []), newReply],
        };
      }
      return post;
    }));
  };

  const getTagColor = (tag: string) => {
    // 全て統一色 #49B1E4 を使用
    return 'from-[#49B1E4] to-[#49B1E4]';
  };

  const currentStory = visiblePosts.find(p => p.id === selectedStory);
  
  // ストーリーとボードを分ける
  const storyPosts = visiblePosts.filter(p => p.displayType === 'story');
  // コメントがあるストーリーも掲示板に表示
  const boardPostsList = visiblePosts.filter(p => p.displayType === 'board' || (p.displayType === 'story' && p.replies && p.replies.length > 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-1 text-sm">{t.subtitle}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#49B1E4] hover:bg-[#3A9FD3]">
              <Plus className="w-4 h-4 mr-2" />
              {t.createPost}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.createPost}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-title">{t.postTitle}</Label>
                <Input
                  id="post-title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder={language === 'ja' ? '例：日本語を教えてください！' : 'e.g., Looking for Japanese tutor!'}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-content">{t.postContent}</Label>
                <Textarea
                  id="post-content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder={language === 'ja' ? '詳細を入力してください...' : 'Enter details...'}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">{t.wantToLearn}</Label>
                <Input
                  id="language"
                  value={newPost.language}
                  onChange={(e) => setNewPost({ ...newPost, language: e.target.value })}
                  placeholder="English, Japanese, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="people-needed">{t.peopleNeeded}</Label>
                <Input
                  id="people-needed"
                  type="number"
                  min="1"
                  value={newPost.peopleNeeded}
                  onChange={(e) => setNewPost({ ...newPost, peopleNeeded: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload-image">{t.uploadImage}</Label>
                <Input
                  id="upload-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedFile(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-type">{t.displayType}</Label>
                <RadioGroup
                  id="display-type"
                  value={newPost.displayType}
                  onValueChange={(value) => setNewPost({ ...newPost, displayType: value as 'story' | 'board' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="story" />
                    <Label htmlFor="display-type">{t.storyDisplay}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="board" />
                    <Label htmlFor="display-type">{t.boardDisplay}</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiry-date">{t.expiryDate}</Label>
                <Input
                  id="expiry-date"
                  type="date"
                  value={newPost.expiryDate}
                  onChange={(e) => setNewPost({ ...newPost, expiryDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePost} className="flex-1 bg-[#49B1E4] hover:bg-[#3A9FD3]">
                  {t.submit}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                  {t.cancel}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ストーリー風の横スクロールリスト */}
      <div className="overflow-x-auto -mx-4 px-4 pb-2">
        <div className="flex gap-4">
          {storyPosts.map((post) => (
            <button
              key={post.id}
              onClick={() => handleStoryClick(post.id)}
              className="flex flex-col items-center gap-2 flex-shrink-0"
            >
              <div className={`p-1 rounded-full bg-gradient-to-tr ${getTagColor(post.tag)}`}>
                <div className="bg-white p-0.5 rounded-full">
                  <Avatar className="w-16 h-16 md:w-20 md:h-20">
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                      {post.authorAvatar}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs text-gray-700 max-w-[80px] truncate">{post.author}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 掲示板投稿（ボックス表示） */}
      {boardPostsList.length > 0 && (
        <div className="space-y-4">
          {boardPostsList.map((post) => (
            <BoardPostWithReplies
              key={post.id}
              post={post}
              language={language}
              user={user}
              onAddReply={handleAddReply}
              translations={t}
            />
          ))}
        </div>
      )}

      {/* ストーリービュー（フルスクリーン） */}
      {currentStory && (
        <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
          {/* プログレスバー */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 p-4 z-10">
            {visiblePosts.map((post, index) => (
              <div key={post.id} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-100"
                  style={{
                    width: post.id === selectedStory
                      ? `${storyProgress}%`
                      : post.id < selectedStory!
                      ? '100%'
                      : '0%'
                  }}
                />
              </div>
            ))}
          </div>

          {/* ヘッダー */}
          <div className="absolute top-8 md:top-12 left-0 right-0 px-4 md:px-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                  {currentStory.authorAvatar}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white text-sm">{currentStory.author}</p>
                <p className="text-white/70 text-xs">{currentStory.time}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCloseStory();
              }}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* コンテンツ */}
          <div className="w-full h-full max-w-lg mx-auto relative">
            {/* 背景画像 */}
            {currentStory.image && (
              <div className="absolute inset-0">
                <img
                  src={currentStory.image}
                  alt={currentStory.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60" />
              </div>
            )}

            {/* ナビゲーションエリア（左右タップ） - コメントエリアを除く */}
            <button
              onClick={handlePrevStory}
              className="absolute left-0 top-0 bottom-[200px] w-1/3 z-0"
              aria-label="Previous story"
            />
            <button
              onClick={handleNextStory}
              className="absolute right-0 top-0 bottom-[200px] w-1/3 z-0"
              aria-label="Next story"
            />

            {/* テキストコンテンツ */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white z-30">
              <div className="mb-4">
                <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getTagColor(currentStory.tag)} text-white text-xs mb-3`}>
                  {currentStory.tag === 'languageExchange' ? t.languageExchange : currentStory.tag === 'studyGroup' ? t.studyGroup : t.event}
                </div>
                <h2 className="text-2xl mb-3">{currentStory.title}</h2>
                <p className="text-white/90 text-sm mb-4 line-clamp-3">{currentStory.content}</p>
                
                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1">
                    <Globe2 className="w-4 h-4" />
                    <span>{currentStory.language}</span>
                  </div>
                  <div>
                    {currentStory.peopleNeeded} {language === 'ja' ? '人募集' : 'people needed'}
                  </div>
                  {currentStory.replies && currentStory.replies.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{currentStory.replies.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* コメント入力 */}
              <div className="flex gap-2 items-center bg-white/20 backdrop-blur-sm rounded-full p-2">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-xs">
                    {user.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Input
                  placeholder={t.addComment}
                  value={replyInput[currentStory.id] || ''}
                  onChange={(e) => setReplyInput({ ...replyInput, [currentStory.id]: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && replyInput[currentStory.id]?.trim()) {
                      e.stopPropagation();
                      handleAddReply(currentStory.id, replyInput[currentStory.id]);
                      setReplyInput({ ...replyInput, [currentStory.id]: '' });
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 bg-transparent border-none text-white placeholder:text-white/70 focus-visible:ring-0"
                />
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (replyInput[currentStory.id]?.trim()) {
                      handleAddReply(currentStory.id, replyInput[currentStory.id]);
                      setReplyInput({ ...replyInput, [currentStory.id]: '' });
                    }
                  }}
                  disabled={!replyInput[currentStory.id]?.trim()}
                  className="bg-[#49B1E4] hover:bg-[#3A9FD3] rounded-full h-8 w-8 p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
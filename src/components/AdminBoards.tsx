import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Eye, EyeOff, AlertTriangle, User, MessageSquare, Trash2, RotateCcw, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import type { Language, BoardPost } from '../App';

interface AdminBoardsProps {
  language: Language;
  boardPosts: BoardPost[];
  onUpdateBoardPosts: (posts: BoardPost[]) => void;
}

const translations = {
  ja: {
    title: '掲示板管理',
    allPosts: 'すべての投稿',
    visible: '表示中',
    hidden: '非表示',
    deleted: '削除済み',
    hide: '非表示にする',
    show: '表示する',
    delete: '削除する',
    restore: '復元する',
    deleteReason: '削除する理由',
    reasonInappropriate: '内容が不適切だと判断されたため。',
    reasonDuplicate: '同じ内容の掲示板が存在するため。',
    confirmRestore: 'この投稿を復元しますか？',
    cancel: 'キャンセル',
    confirm: '確認',
    author: '投稿者',
    postedOn: '投稿日',
    status: 'ステータス',
    trash: 'ゴミ箱',
    activePosts: '投稿一覧',
    back: '戻る',
  },
  en: {
    title: 'Board Management',
    allPosts: 'All Posts',
    visible: 'Visible',
    hidden: 'Hidden',
    deleted: 'Deleted',
    hide: 'Hide',
    show: 'Show',
    delete: 'Delete',
    restore: 'Restore',
    deleteReason: 'Reason for deletion',
    reasonInappropriate: 'Judged as inappropriate content.',
    reasonDuplicate: 'Duplicate post exists.',
    confirmRestore: 'Do you want to restore this post?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    author: 'Author',
    postedOn: 'Posted on',
    status: 'Status',
    trash: 'Trash',
    activePosts: 'Active Posts',
    back: 'Back',
  }
};

export function AdminBoards({ language, boardPosts, onUpdateBoardPosts }: AdminBoardsProps) {
  const t = translations[language];
  const [showTrash, setShowTrash] = useState(false);
  const [deleteReasons, setDeleteReasons] = useState({
    inappropriate: false,
    duplicate: false,
  });
  const [posts, setPosts] = useState(boardPosts);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    postId: number | null;
    action: 'hide' | 'show' | 'delete' | 'duplicate' | 'restore' | null;
  }>({
    isOpen: false,
    postId: null,
    action: null,
  });

  const openDialog = (postId: number, action: 'hide' | 'show' | 'delete' | 'duplicate' | 'restore') => {
    if (action === 'delete') {
      setDeleteReasons({ inappropriate: false, duplicate: false });
    }
    setDialogState({ isOpen: true, postId, action });
  };

  const closeDialog = () => {
    setDialogState({ isOpen: false, postId: null, action: null });
    setDeleteReasons({ inappropriate: false, duplicate: false });
  };

  const handleConfirmAction = () => {
    if (dialogState.postId === null) return;

    if (dialogState.action === 'delete') {
      const post = posts.find(p => p.id === dialogState.postId);
      if (post) {
        // 削除理由を収集
        const reasons = [];
        if (deleteReasons.inappropriate) reasons.push(t.reasonInappropriate);
        if (deleteReasons.duplicate) reasons.push(t.reasonDuplicate);
        
        // 通知を送信（模擬）
        const notificationMessage = language === 'ja'
          ? `あなたの投稿「${post.title}」が削除されました。理由: ${reasons.join(', ')}`
          : `Your post "${post.title}" has been deleted. Reason: ${reasons.join(', ')}`;
        
        console.log(`通知送信: ${post.author}宛 - ${notificationMessage}`);
        
        setPosts(posts.map(p => 
          p.id === dialogState.postId ? { ...p, isDeleted: true } : p
        ));
        onUpdateBoardPosts(posts.map(p => 
          p.id === dialogState.postId ? { ...p, isDeleted: true } : p
        ));
      }
    } else if (dialogState.action === 'restore') {
      setPosts(posts.map(post => 
        post.id === dialogState.postId ? { ...post, isDeleted: false } : post
      ));
      onUpdateBoardPosts(posts.map(post => 
        post.id === dialogState.postId ? { ...post, isDeleted: false } : post
      ));
    } else {
      setPosts(posts.map(post => {
        if (post.id === dialogState.postId) {
          if (dialogState.action === 'hide') {
            return { ...post, isHidden: true };
          } else if (dialogState.action === 'show') {
            return { ...post, isHidden: false };
          }
        }
        return post;
      }));
      onUpdateBoardPosts(posts.map(post => {
        if (post.id === dialogState.postId) {
          if (dialogState.action === 'hide') {
            return { ...post, isHidden: true };
          } else if (dialogState.action === 'show') {
            return { ...post, isHidden: false };
          }
        }
        return post;
      }));
    }

    closeDialog();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'japanese':
        return 'bg-blue-100 text-blue-800';
      case 'regular-international':
        return 'bg-purple-100 text-purple-800';
      case 'exchange':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'japanese':
        return language === 'ja' ? '日本人学生・国内学生' : 'Japanese';
      case 'regular-international':
        return language === 'ja' ? '正規留学生' : 'Regular';
      case 'exchange':
        return language === 'ja' ? '交換留学生' : 'Exchange';
      default:
        return '';
    }
  };

  const activePosts = posts.filter(post => !post.isDeleted);
  const deletedPosts = posts.filter(post => post.isDeleted);
  const displayPosts = showTrash ? deletedPosts : activePosts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTrash(!showTrash)}
          className={showTrash ? "text-[#3D3D4E] bg-white hover:bg-gray-100 border-gray-300" : "bg-[#49B1E4] hover:bg-[#3A9BD4] text-white border-none"}
        >
          {showTrash ? (
            <>
              <ArrowLeft className="w-4 h-4 mr-1" />
              {t.back}
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              {deletedPosts.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{deletedPosts.length}</Badge>
              )}
            </>
          )}
        </Button>
        <Badge variant="outline">
          {displayPosts.length} {showTrash ? t.trash : t.allPosts}
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {displayPosts.map((post) => (
          <Card 
            key={post.id} 
            className={`hover:shadow-lg transition-shadow ${
              post.isHidden ? 'bg-gray-50 border-gray-300' : ''
            } ${
              showTrash ? 'bg-red-50 border-red-200' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <CardTitle className={post.isHidden ? 'text-gray-500' : ''}>
                      {post.title}
                    </CardTitle>
                    {post.isHidden && (
                      <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                        <EyeOff className="w-3 h-3 mr-1" />
                        {t.hidden}
                      </Badge>
                    )}
                  </div>
                  <CardDescription className={post.isHidden ? 'line-through' : ''}>
                    {post.content}
                  </CardDescription>
                </div>
                <div className="ml-2 flex-shrink-0">
                  {showTrash ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(post.id, 'restore')}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDialog(post.id, 'delete')}
                      className="border-[#A5D8F3] text-[#49B1E4] hover:bg-[#E8F6FC]"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {post.author}
                </div>
                <Badge className={getCategoryColor(post.category)}>
                  {getCategoryLabel(post.category)}
                </Badge>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {post.date}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={dialogState.isOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState.action === 'delete' && t.deleteReason}
              {dialogState.action === 'restore' && t.confirmRestore}
            </DialogTitle>
          </DialogHeader>
          
          {dialogState.action === 'delete' && (
            <div className="space-y-4 py-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="inappropriate"
                  checked={deleteReasons.inappropriate}
                  onCheckedChange={(checked) => 
                    setDeleteReasons(prev => ({ ...prev, inappropriate: checked as boolean }))
                  }
                  className="mt-1 data-[state=checked]:bg-[#49B1E4] data-[state=checked]:border-[#49B1E4]"
                />
                <label
                  htmlFor="inappropriate"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  {t.reasonInappropriate}
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="duplicate"
                  checked={deleteReasons.duplicate}
                  onCheckedChange={(checked) => 
                    setDeleteReasons(prev => ({ ...prev, duplicate: checked as boolean }))
                  }
                  className="mt-1 data-[state=checked]:bg-[#49B1E4] data-[state=checked]:border-[#49B1E4]"
                />
                <label
                  htmlFor="duplicate"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  {t.reasonDuplicate}
                </label>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              onClick={handleConfirmAction}
              className="bg-[#49B1E4] hover:bg-[#3A9BD4] text-white"
            >
              {dialogState.action === 'delete' && t.delete}
              {dialogState.action === 'restore' && t.restore}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
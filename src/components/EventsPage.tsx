import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Heart, Users, Calendar, Camera, MapPin, Clock, MessageCircle, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import type { Language, Event } from '../App';
import type { User } from '../App';

interface EventsPageProps {
  language: Language;
  events: Event[];
  attendingEvents: Set<number>;
  likedEvents: Set<number>;
  onToggleAttending: (eventId: number) => void;
  onToggleLike: (eventId: number) => void;
  highlightEventId?: number;
  onAddEventParticipant: (eventId: number, photoRefusal: boolean) => void;
  user: User;
}

const translations = {
  ja: {
    title: 'イベント',
    allEvents: 'すべて',
    upcoming: '今後',
    past: '過去',
    viewPhotos: '写真を見る',
    attend: '参加する',
    registered: '申し込み済み',
    likes: 'いいね',
    participants: '参加者',
    location: '場所',
    time: '時間',
    registrationComplete: '参加登録完了',
    registrationCompleteMessage: 'イベントへの参加登録が完了しました！',
    joinLineGroup: 'LINEグループに参加する',
    lineGroupDescription: '以下のボタンからイベント用のLINEグループに参加できます。',
    photoRefusal: '顔が写っている写真のアップロードを拒否する。',
    openLine: 'LINEで開く',
    close: '閉じる',
    noLineGroup: 'このイベントにはLINEグループはありません。',
  },
  en: {
    title: 'Events',
    allEvents: 'All',
    upcoming: 'Upcoming',
    past: 'Past',
    viewPhotos: 'View Photos',
    attend: 'Attend',
    registered: 'Registered',
    likes: 'Likes',
    participants: 'Participants',
    location: 'Location',
    time: 'Time',
    registrationComplete: 'Registration Complete',
    registrationCompleteMessage: 'Your event registration is complete!',
    joinLineGroup: 'Join LINE Group',
    lineGroupDescription: 'You can join the event LINE group using the button below.',
    photoRefusal: 'I refuse to have photos of my face uploaded.',
    openLine: 'Open in LINE',
    close: 'Close',
    noLineGroup: 'This event does not have a LINE group.',
  }
};

export function EventsPage({ language, events, attendingEvents, likedEvents, onToggleAttending, onToggleLike, highlightEventId, onAddEventParticipant, user }: EventsPageProps) {
  const t = translations[language];
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [lineGroupDialogOpen, setLineGroupDialogOpen] = useState(false);
  const eventRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [photoRefusal, setPhotoRefusal] = useState(false);

  // Scroll to highlighted event
  useEffect(() => {
    if (highlightEventId && eventRefs.current[highlightEventId]) {
      setTimeout(() => {
        eventRefs.current[highlightEventId]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [highlightEventId]);

  const handleAttendClick = (event: Event) => {
    const isAttending = attendingEvents.has(event.id);
    
    if (isAttending) {
      // すでに参加済みの場合はキャンセル
      onToggleAttending(event.id);
    } else {
      // 承認待ちの場合は参加できない
      if (!user.approved) {
        const message = language === 'ja' 
          ? '運営による承認をお待ちください' 
          : 'Please wait for admin approval';
        alert(message);
        return;
      }
      
      // プロフィール未完了、または日本人で年会費未払いの場合は1つのイベントのみ参加可能
      const isLimited = !user.profileCompleted || (user.category === 'japanese' && !user.feePaid);
      
      if (isLimited) {
        if (attendingEvents.size >= 1) {
          // すでに1つのイベントに参加している場合はエラー表示
          let message = '';
          if (language === 'ja') {
            if (!user.profileCompleted) {
              message = 'プロフィール登録が完了するまで、1つのイベントにのみ参加できます';
            } else if (user.category === 'japanese' && !user.feePaid) {
              message = '年会費のお支払いが完了するまで、1つのイベントにのみ参加できます';
            }
          } else {
            if (!user.profileCompleted) {
              message = 'You can only register for one event until you complete your profile';
            } else if (user.category === 'japanese' && !user.feePaid) {
              message = 'You can only register for one event until you pay the annual fee';
            }
          }
          alert(message);
          return;
        }
      }
      
      // LINEグループダイアログを表示（参加登録はまだしない）
      setSelectedEvent(event);
      setLineGroupDialogOpen(true);
    }
  };

  const handleConfirmRegistration = () => {
    if (selectedEvent) {
      // ダイアログで「閉じる」または「LINEで開くを押した時に参加登録
      onAddEventParticipant(selectedEvent.id, photoRefusal);
      onToggleAttending(selectedEvent.id);
    }
    handleLineDialogClose();
  };

  const handleOpenLineGroup = () => {
    if (selectedEvent) {
      // LINEグループを開く前に参加登録
      onAddEventParticipant(selectedEvent.id, photoRefusal);
      onToggleAttending(selectedEvent.id);
      
      // LINEグループを開く
      if (selectedEvent.lineGroupLink) {
        window.open(selectedEvent.lineGroupLink, '_blank');
      }
    }
    handleLineDialogClose();
  };

  const handleLineDialogClose = () => {
    setLineGroupDialogOpen(false);
    setSelectedEvent(null);
    setPhotoRefusal(false); // チェックボックスをリセット
  };

  const renderEventCard = (event: Event) => {
    const isLiked = likedEvents.has(event.id);
    const isAttending = attendingEvents.has(event.id);
    const displayTitle = language === 'ja' ? event.title : (event.titleEn || event.title);
    const displayLocation = language === 'ja' ? event.location : (event.locationEn || event.location);
    const isHighlighted = highlightEventId === event.id;

    return (
      <div 
        key={event.id}
        ref={(el) => { eventRefs.current[event.id] = el; }}
      >
        <Card className={`overflow-hidden hover:shadow-lg transition-all duration-500 ${isHighlighted ? 'ring-4 ring-[#49B1E4] shadow-2xl' : ''}`}>
          <div className="h-48 sm:h-72 bg-gradient-to-br from-blue-100 to-purple-100 relative">
            <img 
              src={event.image} 
              alt={displayTitle}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
          <CardContent className="pt-3 pb-3 px-3 sm:px-6">
            <h3 className="text-[#3D3D4E] mb-2 text-sm sm:text-base">{displayTitle}</h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-[#6B6B7A] mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{event.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{event.time}</span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs sm:text-sm text-[#6B6B7A] mb-3">
              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
              {event.googleMapUrl ? (
                <a 
                  href={event.googleMapUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-[#49B1E4] transition-colors underline break-all"
                >
                  <span>{displayLocation}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              ) : (
                <span className="break-all">{displayLocation}</span>
              )}
            </div>
            <div className="flex items-center gap-3 sm:gap-4 mb-3">
              <button 
                onClick={() => onToggleLike(event.id)}
                className="flex items-center gap-1 text-pink-600 hover:text-pink-700 transition-colors"
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs sm:text-sm">{event.likes} {t.likes}</span>
              </button>
              <div className="flex items-center gap-1 text-blue-600">
                <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">{event.currentParticipants} {t.participants}</span>
              </div>
            </div>
            {event.status === 'upcoming' && (
              <Button 
                className={`w-full ${isAttending ? 'bg-gray-400' : 'bg-[#49B1E4] hover:bg-[#3A9FD3]'}`}
                onClick={() => handleAttendClick(event)}
              >
                {isAttending ? t.registered : t.attend}
              </Button>
            )}
            {event.status === 'past' && event.photos && (
              <Button variant="outline" className="w-full">
                <Camera className="w-4 h-4 mr-2" />
                {t.viewPhotos} ({event.photos})
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-gray-900">{t.title}</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map(renderEventCard)}
      </div>

      <Dialog open={lineGroupDialogOpen} onOpenChange={setLineGroupDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#49B1E4]" />
              {t.registrationComplete}
            </DialogTitle>
            <DialogDescription>
              {t.registrationCompleteMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* 写真拒否チェックボックス */}
            <div className="flex items-center space-x-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <Checkbox 
                id="photoRefusal" 
                checked={photoRefusal}
                onCheckedChange={(checked) => setPhotoRefusal(checked === true)}
                className="mt-0"
              />
              <label
                htmlFor="photoRefusal"
                className="text-sm text-[#3D3D4E] leading-relaxed cursor-pointer"
              >
                {t.photoRefusal}
              </label>
            </div>

            {selectedEvent?.lineGroupLink ? (
              <>
                <div className="bg-[#F5F1E8] p-4 rounded-lg">
                  <p className="text-sm text-[#3D3D4E] text-center mb-2">{t.lineGroupDescription}</p>
                </div>
                <Button
                  className="w-full bg-[#06C755] hover:bg-[#05B04E] text-white"
                  onClick={handleOpenLineGroup}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {t.openLine}
                </Button>
              </>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-[#6B6B7A] text-center">{t.noLineGroup}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={handleConfirmRegistration}
            >
              {t.close}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
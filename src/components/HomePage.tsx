import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Heart, Users, ChevronLeft, ChevronRight, MapPin, Clock, AlertCircle, RefreshCw, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import trussImage from 'figma:asset/8fbefa8d40d592af0e3f6e45ca9c793cfbb1b1c6.png';
import type { Language, User, Event } from '../App';

interface HomePageProps {
  language: Language;
  user: User;
  events: Event[];
  onNavigateToEvent: (eventId: number) => void;
  isProfileComplete?: boolean;
  onOpenProfile?: () => void;
  onReopenInitialRegistration?: () => void;
  onDismissReuploadNotification?: () => void;
  onOpenFeePayment?: () => void;
}

const translations = {
  ja: {
    welcome: 'ようこそ',
    upcomingEvents: 'イベント一覧',
    attend: '参加する',
    likes: 'いいね',
    participants: '参加者',
    reuploadRequired: '学生証の再アップロードが必要です',
    reuploadMessage: '運営から学生証の再アップロード依頼がありました。以下の理由で再提出が必要です。',
    goToRegistration: '新規登録画面へ →',
    renewalRequired: '継続手続きをお願いします',
    renewalMessage: '今年度の会費をお支払いいただくと、すべての機能をご利用いただけます。',
    proceedToPayment: '支払い手続きへ →',
    newMemberPaymentRequired: '入会手続きをお願いします',
    newMemberMessage: '入会金と年会費をお支払いいただくと、すべての機能をご利用いただけます。',
  },
  en: {
    welcome: 'Welcome',
    upcomingEvents: 'Upcoming Events',
    attend: 'Attend',
    likes: 'Likes',
    participants: 'Participants',
    reuploadRequired: 'Student ID Re-upload Required',
    reuploadMessage: 'The admin has requested a re-upload of your student ID. Please resubmit for the following reason:',
    goToRegistration: 'Go to Registration →',
    renewalRequired: 'Membership Renewal Required',
    renewalMessage: 'Please pay your annual fee to unlock all features.',
    proceedToPayment: 'Proceed to Payment →',
    newMemberPaymentRequired: 'Registration Required',
    newMemberMessage: 'Please pay the entry fee and annual fee to unlock all features.',
  }
};

export function HomePage({ language, user, events, onNavigateToEvent, isProfileComplete, onOpenProfile, onReopenInitialRegistration, onDismissReuploadNotification, onOpenFeePayment }: HomePageProps) {
  const t = translations[language];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // イベントを多数複製して無限ループを実現
  const duplicatedEvents = [...events, ...events, ...events, ...events, ...events];

  // 自動スクロール開始
  const startAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }
    
    autoScrollIntervalRef.current = setInterval(() => {
      if (!scrollContainerRef.current || isDraggingRef.current) return;
      
      const container = scrollContainerRef.current;
      container.scrollBy({
        left: 1,
        behavior: 'auto'
      });
    }, 20); // スムーズな自動スクロール
  };

  // 自動スクロール停止
  const stopAutoScroll = () => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  };

  // 初期位置を中央のセットに設定
  useEffect(() => {
    if (scrollContainerRef.current && events.length > 0) {
      const container = scrollContainerRef.current;
      const singleSetWidth = (container.scrollWidth / 5);
      // 中央のセット（3番目）から開始
      container.scrollTo({
        left: singleSetWidth * 2,
        behavior: 'auto'
      });
    }
  }, [events.length]);

  // 無限ループ処理
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || isScrollingRef.current) return;
      
      const container = scrollContainerRef.current;
      const singleSetWidth = container.scrollWidth / 5;
      const scrollLeft = container.scrollLeft;
      
      // 右端に近づいたら左側にリセット
      if (scrollLeft >= singleSetWidth * 4) {
        isScrollingRef.current = true;
        container.scrollTo({
          left: singleSetWidth * 2,
          behavior: 'auto'
        });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 10);
      }
      // 左端に近づいたら右側にリセット
      else if (scrollLeft <= singleSetWidth * 1) {
        isScrollingRef.current = true;
        container.scrollTo({
          left: singleSetWidth * 3,
          behavior: 'auto'
        });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 10);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [events.length]);

  // マウス/タッチイベントハンドラー
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    stopAutoScroll();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setTimeout(() => {
      startAutoScroll();
    }, 2000); // 2秒後に自動スクロール再開
  };

  const handleMouseLeave = () => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      setTimeout(() => {
        startAutoScroll();
      }, 2000);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!scrollContainerRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
    stopAutoScroll();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current || !scrollContainerRef.current) return;
    const x = e.touches[0].pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setTimeout(() => {
      startAutoScroll();
    }, 2000);
  };

  // 自動スクロール開始
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* 継続手続き・入会手続き案内バナー */}
      {user.category === 'japanese' && !user.feePaid && onOpenFeePayment && (
        <div className="bg-gradient-to-r from-[#3D3D4E] to-[#5A5A6E] text-white p-4 rounded-xl mb-4 shadow-lg border border-[#49B1E4]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#49B1E4] rounded-full flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold">
                {user.isRenewal ? t.renewalRequired : t.newMemberPaymentRequired}
              </h4>
              <p className="text-sm opacity-90 mt-1">
                {user.isRenewal ? t.renewalMessage : t.newMemberMessage}
              </p>
              <button
                onClick={onOpenFeePayment}
                className="mt-2 text-sm font-medium underline hover:no-underline"
              >
                {t.proceedToPayment}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Visual - Much larger */}
      <div className="flex-1 min-h-[400px] mb-4">
        <button 
          className="rounded-2xl overflow-hidden shadow-lg h-full w-full flex items-center justify-center hover:shadow-xl transition-shadow cursor-pointer bg-transparent border-0 p-0"
          onClick={() => {
            // ボタンクリック時の処理をここに追加できます
            console.log('Image button clicked');
          }}
        >
          <ImageWithFallback
            src={trussImage}
            className="w-full h-full object-contain"
          />
        </button>
      </div>

      {/* Divider Line */}
      <div className="h-px bg-[#E8E4DB] my-4" />

      {/* Event Images - Bottom Section */}
      <section className="flex-shrink-0">
        <div className="mb-3">
          <h3 className="text-[#3D3D4E] text-sm">{language === 'ja' ? 'イベント情報' : 'Event Information'}</h3>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {duplicatedEvents.map((event, index) => {
            const displayTitle = language === 'ja' ? event.title : (event.titleEn || event.title);
            return (
              <div 
                key={`${event.id}-${index}`}
                onClick={() => onNavigateToEvent(event.id)}
                className="flex-shrink-0 w-40 h-28 md:w-52 md:h-36 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer relative group"
              >
                <img 
                  src={event.image} 
                  alt={displayTitle}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <p className="text-white text-xs truncate">{displayTitle}</p>
                    <p className="text-white/80 text-xs">{event.date}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
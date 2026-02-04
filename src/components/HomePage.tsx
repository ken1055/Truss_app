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
  }
};

export function HomePage({ language, user, events, onNavigateToEvent, isProfileComplete, onOpenProfile, onReopenInitialRegistration, onDismissReuploadNotification }: HomePageProps) {
  const t = translations[language];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // イベントを5回複製して無限ループを実現（より滑らかに）
  const duplicatedEvents = [...events, ...events, ...events, ...events, ...events];

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollContainerRef.current.offsetWidth * 0.8,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollContainerRef.current.offsetWidth * 0.8,
        behavior: 'smooth'
      });
    }
  };

  // 初期位置を中央のセットに設定
  useEffect(() => {
    if (scrollContainerRef.current && events.length > 0) {
      const container = scrollContainerRef.current;
      const singleSetWidth = (container.scrollWidth / 5);
      // 3番目のセット（中央）から開始
      container.scrollTo({
        left: singleSetWidth * 2,
        behavior: 'auto'
      });
    }
  }, [events.length]);

  // スクロール位置を監視して無限ループを実現
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current || isScrollingRef.current) return;
      
      const container = scrollContainerRef.current;
      const singleSetWidth = container.scrollWidth / 5;
      const scrollLeft = container.scrollLeft;
      
      // 右端に近づいたら（4番目のセットの中盤）中央（2番目のセット）にリセット
      if (scrollLeft >= singleSetWidth * 3.5) {
        isScrollingRef.current = true;
        container.scrollTo({
          left: singleSetWidth * 1.5,
          behavior: 'auto'
        });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 100);
      }
      // 左端に近づいたら（1番目のセットの中盤）中央（3番目のセット）にリセット
      else if (scrollLeft <= singleSetWidth * 0.5) {
        isScrollingRef.current = true;
        container.scrollTo({
          left: singleSetWidth * 2.5,
          behavior: 'auto'
        });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 100);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [events.length]);

  // Auto-scroll effect with infinite loop
  useEffect(() => {
    const autoScrollInterval = setInterval(() => {
      if (scrollContainerRef.current && !isScrollingRef.current) {
        const container = scrollContainerRef.current;
        // 常に右にスクロール（無限ループはscrollイベントで処理）
        container.scrollBy({
          left: container.offsetWidth * 0.8,
          behavior: 'smooth'
        });
      }
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(autoScrollInterval);
  }, []);

  return (
    <div className="flex flex-col h-full">
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
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[#3D3D4E] text-sm">{language === 'ja' ? 'イベント情報' : 'Event Information'}</h3>
          <div className="flex gap-2">
            <button
              onClick={scrollLeft}
              className="bg-white border border-[#E8E4DB] hover:bg-[#E8E4DB] rounded-full p-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-[#3D3D4E]" />
            </button>
            <button
              onClick={scrollRight}
              className="bg-white border border-[#E8E4DB] hover:bg-[#E8E4DB] rounded-full p-1.5 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-[#3D3D4E]" />
            </button>
          </div>
        </div>

        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
import { Button } from './ui/button';
import { Users, Calendar, MessageSquare, Shield, UserCircle } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import logoImage from 'figma:asset/bd10685cae8608f82fd9e782ed0442fecb293fc5.png';
import buttonImage from 'figma:asset/c026995b25f2c686c97b8a66ee88909dcc2f877d.png';
import trussLogoJa from 'figma:asset/b9368563cabb9e565c532dd45d02a93f8da3798f.png';
import trussLogoEn from 'figma:asset/560cae97d957d15b206143adb7d120892e603e2a.png';
import type { Language } from '../App';

interface LandingPageProps {
  onGetStarted: () => void;
  onAdminLogin: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function LandingPage({ onGetStarted, onAdminLogin, language, onLanguageChange }: LandingPageProps) {
  const t = language === 'ja' ? {
    subtitle1: '留学生の日本での生活をサポート！',
    subtitle2: '神戸大学公認サークルの中で最大規模の国際交流サークルです！',
    appName: 'Truss',
    cta: '今すぐ始める',
    adminLogin: '運営ログイン',
  } : {
    title: 'Truss!',
    subtitle1: 'We support international students in their life in Japan!',
    subtitle2: 'We are the largest international exchange circle among the official clubs of Kobe U!',
    appName: 'Truss',
    cta: 'Get Started',
    adminLogin: 'Admin Login',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F1E8] via-[#EFE9DD] to-[#E8E4DB]">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ImageWithFallback
            src={logoImage}
            alt="Logo"
            loading="eager"
            className="w-10 h-10 object-contain"
          />
          <span className="text-[#3D3D4E]" style={{ fontFamily: "'Island Moments', cursive" }}>{t.appName}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={language === 'ja' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLanguageChange(language === 'ja' ? 'en' : 'ja')}
            className={language === 'ja' ? 'bg-[#3D3D4E] text-[#F5F1E8]' : 'border-[#3D3D4E] text-[#3D3D4E]'}
          >
            {language === 'ja' ? 'English' : '日本語'}
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="max-w-3xl mx-auto">
          {/* アニメーションするTrussロゴボタン */}
          <button 
            onClick={onAdminLogin}
            className="group mx-auto mb-8 cursor-pointer transition-all hover:scale-105 active:scale-95 focus:outline-none rounded-3xl"
            style={{
              ['--u' as string]: '18px'
            }}
          >
            <div className="logo-container relative" style={{ width: 'calc(var(--u) * 28)', height: 'calc(var(--u) * 12)', margin: '0 auto' }}>
              {/* 緑のボール（横棒を転がって跳ね上げられる） */}
              <div 
                className="ball absolute w-[calc(var(--u)*1.6)] h-[calc(var(--u)*1.6)] bg-[#78D850] rounded-full"
                style={{
                  left: 'calc(var(--u) * 2)',
                  top: 'calc(var(--u) * 0.8)',
                  animation: 'ball-roll-bounce 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                  transformOrigin: 'center center'
                }}
              />
              
              {/* 上の横棒（跳ね上げる動き） */}
              <div 
                className="topbar absolute bg-[#38B0F8] rounded-full"
                style={{
                  left: 0,
                  top: 'calc(var(--u) * 3.5)',
                  width: 'calc(var(--u) * 8)',
                  height: 'calc(var(--u) * 0.65)',
                  animation: 'bar-bounce-up 3s ease-in-out infinite',
                  transformOrigin: 'left center'
                }}
              />
              
              {/* 縦棒（横棒から下へ、突き抜けない） */}
              <div 
                className="stem absolute bg-[#38B0F8] rounded-full"
                style={{
                  left: 'calc(var(--u) * 1.2)',
                  top: 'calc(var(--u) * 4.15)',
                  width: 'calc(var(--u) * 0.65)',
                  height: 'calc(var(--u) * 7)',
                  transformOrigin: 'center top'
                }}
              />
              
              {/* "russ" 文字部分 */}
              <div 
                className="word-container absolute flex items-center text-[#38B0F8] tracking-wider leading-none font-medium"
                style={{
                  left: 'calc(var(--u) * 9)',
                  top: 'calc(var(--u) * 5)',
                  fontSize: 'calc(var(--u) * 5.5)',
                  letterSpacing: 'calc(var(--u) * 0.15)'
                }}
              >
                {['r', 'u', 's', 's'].map((char, index) => (
                  <span
                    key={index}
                    className="ch inline-block"
                    style={{
                      animation: 'text-wave 1200ms cubic-bezier(.2,.9,.2,1) infinite',
                      animationDelay: `${index * 90}ms`,
                      transformOrigin: 'center bottom'
                    }}
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </button>
          
          <h1 className="text-[#3D3D4E] mb-4">
            {t.title}
          </h1>
          
          {/* 運営ログインボタン */}
          <div className="mt-8 pt-8 border-t border-[#3D3D4E]/10">
            <Button
              onClick={onAdminLogin}
              variant="outline"
              className="border-[#3D3D4E] text-[#3D3D4E] hover:bg-[#3D3D4E] hover:text-white"
            >
              <Shield className="w-4 h-4 mr-2" />
              {t.adminLogin}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
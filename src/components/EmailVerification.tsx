import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Mail, ArrowLeft, Check, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { Language } from '../App';

interface EmailVerificationProps {
  language: Language;
  onVerified: (email: string) => void;
  onBack: () => void;
  onLanguageChange: (lang: Language) => void;
  isLoginMode?: boolean;
}

const translations = {
  ja: {
    title: 'メール認証',
    loginTitle: 'ログイン',
    subtitle: '大学のメールアドレスを入力してください',
    loginSubtitle: '登録済みのメールアドレスを入力してください',
    emailLabel: '大学メールアドレス',
    emailPlaceholder: 'example@university.ac.jp',
    emailNote: 'デモ用: どのメールアドレスでも入力可能です',
    sendButton: '認証メールを送信',
    loginButton: 'ログイン',
    emailSentTitle: 'メールを送信しました',
    emailSentDescription: 'メールに記載されているリンクをクリックして認証を完了してください。',
    verifiedTitle: '認証完了',
    verifiedDescription: '次へ進んで初期登録を行ってください。',
    continueButton: '次へ',
    back: '戻る',
    invalidEmail: '有効なメールアドレスを入力してください',
    emailRequired: 'メールアドレスは必須です',
    step: 'ステップ',
    stepEmailVerification: '認証',
    stepInitialRegistration: '初期登録',
    stepApproval: '運営の承認',
    stepEmailVerificationDesc: '大学メールアドレスを認証',
    stepInitialRegistrationDesc: '基本情報を登録',
    stepApprovalDesc: '運営による承認を待つ',
  },
  en: {
    title: 'Email Verification',
    loginTitle: 'Login',
    subtitle: 'Enter your university email address',
    loginSubtitle: 'Enter your registered email address',
    emailLabel: 'University Email',
    emailPlaceholder: 'example@university.ac.jp',
    emailNote: 'Demo: Any email address is accepted',
    sendButton: 'Send Verification Email',
    loginButton: 'Login',
    emailSentTitle: 'Email Sent',
    emailSentDescription: 'Please click the link in the email to complete verification.',
    verifiedTitle: 'Verification Complete',
    verifiedDescription: 'Please proceed to initial registration.',
    continueButton: 'Continue',
    back: 'Back',
    invalidEmail: 'Please enter a valid email address',
    emailRequired: 'Email address is required',
    step: 'Step',
    stepEmailVerification: 'Email Verification',
    stepInitialRegistration: 'Initial Registration',
    stepApproval: 'Approval',
    stepEmailVerificationDesc: 'Verify university email',
    stepInitialRegistrationDesc: 'Register basic information',
    stepApprovalDesc: 'Awaiting admin approval',
  }
};

export function EmailVerification({ language, onVerified, onBack, onLanguageChange, isLoginMode }: EmailVerificationProps) {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'input' | 'sent' | 'verified'>('input');

  const validateEmail = (email: string) => {
    // デモ用：基本的なメールアドレス検証のみ
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSendEmail = () => {
    if (!email) {
      toast.error(t.emailRequired);
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t.invalidEmail);
      return;
    }

    // メール送信シミュレーション
    toast.success(language === 'ja' ? 'メールを送信しました' : 'Email sent successfully');
    setStep('sent');

    // デモ用：3秒後に自動的に認証済みにする
    setTimeout(() => {
      setStep('verified');
      toast.success(language === 'ja' ? 'メール認証が完了しました' : 'Email verification completed');
    }, 3000);
  };

  const handleContinue = () => {
    onVerified(email);
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            onClick={onBack}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
          <Button
            variant={language === 'ja' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onLanguageChange(language === 'ja' ? 'en' : 'ja')}
            className={language === 'ja' ? 'bg-[#3D3D4E] text-[#F5F1E8]' : 'border-[#3D3D4E] text-[#3D3D4E]'}
          >
            {language === 'ja' ? 'English' : '日本語'}
          </Button>
        </div>

        {/* プログレスバー - ログインモードでは非表示 */}
        {!isLoginMode && (
          <div className="mb-6 bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between">
              {/* ステップ1: メール認証 */}
              <div className="flex flex-col items-center flex-1">
                <div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    step === 'verified' 
                      ? 'bg-[#49B1E4] text-white' 
                      : 'bg-[#49B1E4] text-white'
                  }`}
                >
                  {step === 'verified' ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Mail className="w-6 h-6" />
                  )}
                </div>
                <p className="text-xs text-center font-medium text-[#3D3D4E]">{t.stepEmailVerification}</p>
              </div>

              {/* 線 */}
              <div className="flex-1 h-1 bg-gray-200 mx-2 relative top-[-20px]">
                <div 
                  className="h-full bg-gray-200 transition-all duration-500"
                  style={{ width: '0%' }}
                />
              </div>

              {/* ステップ2: 初期登録 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gray-200 text-gray-400">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-xs text-center text-gray-500">{t.stepInitialRegistration}</p>
              </div>

              {/* 線 */}
              <div className="flex-1 h-1 bg-gray-200 mx-2 relative top-[-20px]">
                <div 
                  className="h-full bg-gray-200 transition-all duration-500"
                  style={{ width: '0%' }}
                />
              </div>

              {/* ステップ3: 運営の承認 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-gray-200 text-gray-400">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-xs text-center text-gray-500">{t.stepApproval}</p>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-[#49B1E4] rounded-full flex items-center justify-center mx-auto mb-4">
              {step === 'verified' ? (
                <Check className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-white" />
              )}
            </div>
            <CardTitle>
              {step === 'input' && (isLoginMode ? t.loginTitle : t.title)}
              {step === 'sent' && t.emailSentTitle}
              {step === 'verified' && t.verifiedTitle}
            </CardTitle>
            <CardDescription>
              {step === 'input' && (isLoginMode ? t.loginSubtitle : t.subtitle)}
              {step === 'sent' && t.emailSentDescription}
              {step === 'verified' && t.verifiedDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'input' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">{t.emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendEmail()}
                  />
                  <p className="text-sm text-gray-500">{t.emailNote}</p>
                </div>
                <Button 
                  onClick={handleSendEmail}
                  className="w-full bg-[#49B1E4] hover:bg-[#3A9BD4]"
                >
                  {isLoginMode ? t.loginButton : t.sendButton}
                </Button>
              </>
            )}

            {step === 'sent' && (
              <div className="text-center py-8">
                <div className="animate-pulse">
                  <Mail className="w-16 h-16 text-[#49B1E4] mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'ja' ? 'メールを確認してください...' : 'Please check your email...'}
                  </p>
                </div>
              </div>
            )}

            {step === 'verified' && (
              <Button 
                onClick={handleContinue}
                className="w-full bg-[#49B1E4] hover:bg-[#3A9BD4]"
              >
                {t.continueButton}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, Clock, CheckCircle, CreditCard } from 'lucide-react';
import type { Language, User } from '../App';

interface LimitedAccessBannerProps {
  language: Language;
  user: User;
  onOpenProfile: () => void;
}

const translations = {
  ja: {
    // 承認待ち
    waitingApproval: '運営による承認をお待ちください',
    waitingApprovalDesc: '学生証と学籍番号を確認中です。承認後、メールでお知らせします。',
    
    // 正規留学生（承認済み）
    regularApproved: '本登録はこちらから',
    regularApprovedDesc: 'プロフィール入力後に全機能をご利用いただけます。',
    profileRequired: 'プロフィール登録が必要です',
    goToProfile: 'プロフィールを登録',
    
    // 日本人学生（承認済み）
    japaneseApproved: '本登録はこちらから',
    japaneseApprovedDesc: 'プロフィール入力と年会費支払い後に全機能をご利用いただけます。',
    profileAndFeeRequired: 'プロフィール登録と年会費支払いが必要です',
    feePaymentRequired: '年会費の支払いが必要です',
    feePaymentDesc: '運営が支払いを確認後、全機能をご利用いただけます。',
    
    limitedAccess: '制限付きアクセス',
    limitedFeatures: '一部の機能のみ利用可能です',
  },
  en: {
    // Waiting approval
    waitingApproval: 'Waiting for Approval',
    waitingApprovalDesc: 'We are verifying your student ID and student number. You will be notified via email after approval.',
    
    // Regular international (approved)
    regularApproved: 'Complete Your Registration',
    regularApprovedDesc: 'You can use all features after completing your profile.',
    profileRequired: 'Profile registration required',
    goToProfile: 'Register Profile',
    
    // Japanese student (approved)
    japaneseApproved: 'Complete Your Registration',
    japaneseApprovedDesc: 'You can use all features after completing your profile and annual fee payment.',
    profileAndFeeRequired: 'Profile registration and annual fee payment required',
    feePaymentRequired: 'Annual fee payment required',
    feePaymentDesc: 'All features will be available after the admin confirms your payment.',
    
    limitedAccess: 'Limited Access',
    limitedFeatures: 'Only some features are available',
  }
};

export function LimitedAccessBanner({ language, user, onOpenProfile }: LimitedAccessBannerProps) {
  const t = translations[language];

  // 承認待ち状態 - 削除（プログレスバーで代替）
  // バナーは表示しない

  // 承認済みユーザーには何も表示しない
  // プロフィール登録や年会費のステップは通知や別の場所で案内する
  return null;
}
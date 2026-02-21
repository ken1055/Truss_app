import { X, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { Language, User } from '../App';
import { useState } from 'react';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  language: Language;
  isPending?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  onConfirmFeePayment?: (isRenewal: boolean) => void;
  onSetRenewalStatus?: (isRenewal: boolean) => void;
}

const translations = {
  ja: {
    applicationDate: '申請日',
    nickname: 'ニックネーム',
    id: 'ID',
    email: 'メールアドレス',
    phone: '電話番号',
    studentNumber: '学生番号',
    major: '学部学科',
    category: '区分',
    grade: '学年',
    birthCountry: '生まれた国',
    languages: '話せる言語',
    approve: '承認する',
    reject: '拒否する',
    delete: '削除',
    confirmDelete: '本当にこのメンバーを削除しますか？',
    confirmDeleteMessage: 'この操作は取り消せません。',
    cancel: 'キャンセル',
    japanese: '日本人学生・国内学生',
    regularInternational: '正規留学生',
    exchange: '交換留学生',
    feeStatus: '会費状況',
    feePaid: '支払い済み',
    feeUnpaid: '未払い',
    confirmFeePayment: '支払い確認',
    renewal: '継続会員',
    newMember: '新規会員',
    renewalFee: '¥1,500（年会費のみ）',
    newMemberFee: '¥3,000（入会金+年会費）',
    membershipYear: '会員年度',
    paymentOptions: '支払いを確認する',
    confirmAsRenewal: '継続として確認（¥1,500）',
    confirmAsNew: '新規として確認（¥3,000）',
    setAsRenewal: '継続会員に設定',
    setAsNew: '新規会員に設定',
    memberTypeHint: '※3/31までに登録完了した会員は「継続」扱い',
  },
  en: {
    applicationDate: 'Application Date',
    nickname: 'Nickname',
    id: 'ID',
    email: 'Email',
    phone: 'Phone Number',
    studentNumber: 'Student Number',
    major: 'Major',
    category: 'Category',
    grade: 'Grade',
    birthCountry: 'Birth Country',
    languages: 'Languages',
    approve: 'Approve',
    reject: 'Reject',
    delete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this member?',
    confirmDeleteMessage: 'This action cannot be undone.',
    cancel: 'Cancel',
    japanese: 'Japanese Student',
    regularInternational: 'Regular International',
    exchange: 'Exchange Student',
    feeStatus: 'Fee Status',
    feePaid: 'Paid',
    feeUnpaid: 'Unpaid',
    confirmFeePayment: 'Confirm Payment',
    renewal: 'Renewal',
    newMember: 'New Member',
    renewalFee: '¥1,500 (Annual fee only)',
    newMemberFee: '¥3,000 (Entry + Annual)',
    membershipYear: 'Membership Year',
    paymentOptions: 'Confirm Payment',
    confirmAsRenewal: 'Confirm as Renewal (¥1,500)',
    confirmAsNew: 'Confirm as New (¥3,000)',
    setAsRenewal: 'Set as Renewal',
    setAsNew: 'Set as New Member',
    memberTypeHint: '* Members registered by 3/31 are treated as "Renewal"',
  }
};

export function MemberDetailModal({ 
  isOpen, 
  onClose, 
  user, 
  language, 
  isPending = false,
  onApprove,
  onReject,
  onDelete,
  onConfirmFeePayment,
  onSetRenewalStatus
}: MemberDetailModalProps) {
  const t = translations[language];
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  if (!isOpen) return null;

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete();
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'japanese':
        return t.japanese;
      case 'regular-international':
        return t.regularInternational;
      case 'exchange':
        return t.exchange;
      default:
        return '';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'japanese':
        return 'bg-[#dbeafe] text-[#193cb8]';
      case 'regular-international':
        return 'bg-[rgba(132,212,97,0.3)] text-[#00a63e]';
      case 'exchange':
        return 'bg-[#fce7f3] text-[#be185d]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#F5F1E8] rounded-[10px] w-full max-w-[510px] shadow-xl border border-[rgba(61,61,78,0.15)] relative max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="p-6 border-b border-[rgba(61,61,78,0.15)]">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h2 className="text-[#3D3D4E] text-lg font-semibold tracking-[-0.4395px]">{user.name}</h2>
              <p className="text-[#101828] text-base tracking-[-0.3125px]">{user.furigana}</p>
              <p className="text-[#6B6B7A] text-sm tracking-[-0.1504px]">
                {t.applicationDate}: 2026-01-13
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!isPending && onDelete && (
                <Button
                  onClick={handleDeleteClick}
                  className="bg-[#D4183D] hover:bg-[#B01432] text-white h-9 px-4"
                >
                  {t.delete}
                </Button>
              )}
              <button
                onClick={onClose}
                className="text-[#3D3D4E] hover:text-[#1a1a24] transition-colors opacity-70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* ニックネーム */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.nickname}</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px]">{user.nickname || '-'}</p>
            </div>

            {/* ID */}
            <div>
              <p className="text-[#6B6B7A] text-sm tracking-[-0.1504px] mb-1">{t.id}:</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px]">{user.id}</p>
            </div>

            {/* メールアドレス */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.email}</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px] break-all">{user.email}</p>
            </div>

            {/* 電話番号 */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.phone}</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px] break-all">{user.phone || '-'}</p>
            </div>

            {/* 学生番号 */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.studentNumber}</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px]">{user.studentNumber || '1234567A'}</p>
            </div>

            {/* 学部学科 */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.major}</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px]">{user.major || (language === 'ja' ? '理学部 物理学科' : 'Physics Dept.')}</p>
            </div>

            {/* 区分 */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.category}</p>
              <Badge className={`${getCategoryColor(user.category)} border-0 font-medium text-xs px-2 py-0.5 mt-1`}>
                {getCategoryLabel(user.category)}
              </Badge>
            </div>

            {/* 学年 */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.grade}</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px]">{user.grade || '3'}</p>
            </div>

            {/* 生まれた国 */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.birthCountry}</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px]">{user.birthCountry || '-'}</p>
            </div>

            {/* 話せる言語 */}
            <div>
              <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-1">{t.languages}</p>
              <p className="text-[#101828] text-base tracking-[-0.3125px]">{user.languages || '-'}</p>
            </div>

            {/* 年会費（日本人学生のみ） */}
            {user.category === 'japanese' && !isPending && (
              <div className="col-span-2">
                <p className="text-[#4A5565] text-sm tracking-[-0.1504px] mb-2">{t.feeStatus}</p>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={`${user.feePaid ? 'bg-[#00A63E] text-white' : 'bg-[#D4183D] text-white'} border-0 font-medium text-xs px-3 py-1`}>
                    {user.feePaid ? t.feePaid : t.feeUnpaid}
                  </Badge>
                  <Badge className={`${user.isRenewal ? 'bg-[#49B1E4] text-white' : 'bg-[#8B5CF6] text-white'} border-0 font-medium text-xs px-3 py-1`}>
                    {user.isRenewal ? t.renewal : t.newMember}
                  </Badge>
                  {user.membershipYear && (
                    <span className="text-xs text-[#6B6B7A]">
                      {t.membershipYear}: {user.membershipYear}
                    </span>
                  )}
                </div>
                
                {/* 会員種別変更ボタン（支払い前のみ） */}
                {!user.feePaid && onSetRenewalStatus && (
                  <div className="flex gap-2 mb-3">
                    <Button
                      onClick={() => onSetRenewalStatus(true)}
                      variant={user.isRenewal ? "default" : "outline"}
                      className={`h-7 px-3 text-xs ${user.isRenewal ? 'bg-[#49B1E4] hover:bg-[#3A9FD3]' : ''}`}
                    >
                      {t.setAsRenewal}
                    </Button>
                    <Button
                      onClick={() => onSetRenewalStatus(false)}
                      variant={!user.isRenewal ? "default" : "outline"}
                      className={`h-7 px-3 text-xs ${!user.isRenewal ? 'bg-[#8B5CF6] hover:bg-[#7C3AED]' : ''}`}
                    >
                      {t.setAsNew}
                    </Button>
                  </div>
                )}
                
                {!user.feePaid && (
                  <div className="space-y-2">
                    <p className="text-xs text-[#6B6B7A]">{t.memberTypeHint}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#6B6B7A]">
                        {user.isRenewal ? t.renewalFee : t.newMemberFee}
                      </span>
                      {onConfirmFeePayment && (
                        <>
                          {!showPaymentOptions ? (
                            <Button
                              onClick={() => setShowPaymentOptions(true)}
                              className="bg-[#00A63E] hover:bg-[#008C35] text-white h-8 px-4 text-sm"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t.confirmFeePayment}
                            </Button>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() => { onConfirmFeePayment(true); setShowPaymentOptions(false); }}
                                className="bg-[#49B1E4] hover:bg-[#3A9FD3] text-white h-8 px-3 text-xs"
                              >
                                {t.confirmAsRenewal}
                              </Button>
                              <Button
                                onClick={() => { onConfirmFeePayment(false); setShowPaymentOptions(false); }}
                                className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white h-8 px-3 text-xs"
                              >
                                {t.confirmAsNew}
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => setShowPaymentOptions(false)}
                                className="h-8 px-2 text-xs"
                              >
                                {t.cancel}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 承認・拒否ボタン（承認待ちの場合のみ） */}
          {isPending && (
            <div className="flex gap-2 mt-8">
              <Button
                onClick={onApprove}
                className="flex-1 bg-[#00A63E] hover:bg-[#008C35] text-[#F5F1E8] h-9 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium text-sm tracking-[-0.1504px]">{t.approve}</span>
              </Button>
              <Button
                onClick={onReject}
                className="flex-1 bg-[#D4183D] hover:bg-[#B01432] text-white h-9 flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                <span className="font-medium text-sm tracking-[-0.1504px]">{t.reject}</span>
              </Button>
            </div>
          )}
        </div>

        {/* 削除確認ダイアログ */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-[#F5F1E8] rounded-[10px] w-full max-w-[400px] shadow-xl border border-[rgba(61,61,78,0.15)] relative max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-[rgba(61,61,78,0.15)]">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h2 className="text-[#3D3D4E] text-lg font-semibold tracking-[-0.4395px]">{t.confirmDelete}</h2>
                    <p className="text-[#6B6B7A] text-sm tracking-[-0.1504px]">
                      {t.confirmDeleteMessage}
                    </p>
                  </div>
                  <button
                    onClick={handleCancelDelete}
                    className="text-[#3D3D4E] hover:text-[#1a1a24] transition-colors opacity-70"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="flex gap-2 mt-8">
                  <Button
                    onClick={handleConfirmDelete}
                    className="w-full bg-[#D4183D] hover:bg-[#B01432] text-white h-9 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="font-medium text-sm tracking-[-0.1504px]">{t.delete}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
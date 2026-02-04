import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import svgPaths from '../imports/svg-i9shrrkve7';
import { toast } from 'sonner@2.0.3';
import { translateText } from '../utils/translate';
import type { Language } from '../App';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  recipientCount: number;
  onSend?: (subjectJa: string, subjectEn: string, messageJa: string, messageEn: string, sendInApp: boolean, sendEmail: boolean) => void;
}

const translations = {
  ja: {
    title: 'メール作成',
    subject: '件名',
    message: 'メッセージ',
    japanese: '日本語',
    english: 'English',
    autoTranslate: '自動翻訳',
    notificationType: '通知タイプ',
    inAppNotification: 'アプリ内通知',
    emailNotification: 'メール通知',
    sendDateTime: '送信日時',
    sendDateTimeNote: '（空欄の場合は即時送信）',
    send: '送信',
    cancel: 'キャンセル',
    translating: '翻訳中...',
    translationError: '翻訳に失敗しました',
    placeholder: {
      subject: '件名を入力',
      message: 'メッセージを入力',
      monthDay: '4/7',
      time: '15:00',
    }
  },
  en: {
    title: 'Compose Email',
    subject: 'Subject',
    message: 'Message',
    japanese: '日本語',
    english: 'English',
    autoTranslate: 'Auto Translate',
    notificationType: 'Notification Type',
    inAppNotification: 'In-App Notification',
    emailNotification: 'Email Notification',
    sendDateTime: 'Send Date/Time',
    sendDateTimeNote: '(Leave blank for immediate send)',
    send: 'Send',
    cancel: 'Cancel',
    translating: 'Translating...',
    translationError: 'Translation failed',
    placeholder: {
      subject: 'Enter subject',
      message: 'Enter message',
      monthDay: '4/7',
      time: '15:00',
    }
  }
};

export function BulkEmailModal({ isOpen, onClose, language, recipientCount, onSend }: BulkEmailModalProps) {
  const t = translations[language];
  const [subjectJa, setSubjectJa] = useState('');
  const [subjectEn, setSubjectEn] = useState('');
  const [messageJa, setMessageJa] = useState('');
  const [messageEn, setMessageEn] = useState('');
  const [inAppNotification, setInAppNotification] = useState(true);
  const [emailNotification, setEmailNotification] = useState(false);
  const [year, setYear] = useState('2026');
  const [monthDay, setMonthDay] = useState('');
  const [time, setTime] = useState('');
  const [isTranslatingSubject, setIsTranslatingSubject] = useState(false);
  const [isTranslatingMessage, setIsTranslatingMessage] = useState(false);

  // 年のオプション（2024-2030）
  const years = Array.from({ length: 7 }, (_, i) => (2024 + i).toString());
  // 月のオプション（1-12）
  const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  // 日のオプション（1-31）
  const days = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
  // 時のオプション（0-23）
  const hours = Array.from({ length: 24 }, (_, i) => i.toString());
  // 分のオプション（0-59）
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  const handleTranslateSubject = async () => {
    if (!subjectJa.trim()) {
      toast.error(language === 'ja' ? '日本語の件名を入力してください' : 'Please enter Japanese subject');
      return;
    }

    setIsTranslatingSubject(true);
    try {
      const translated = await translateText(subjectJa, 'en');
      setSubjectEn(translated);
      toast.success(language === 'ja' ? '翻訳が完了しました' : 'Translation completed');
    } catch (error) {
      toast.error(t.translationError);
    } finally {
      setIsTranslatingSubject(false);
    }
  };

  const handleTranslateMessage = async () => {
    if (!messageJa.trim()) {
      toast.error(language === 'ja' ? '日本語のメッセージを入力してください' : 'Please enter Japanese message');
      return;
    }

    setIsTranslatingMessage(true);
    try {
      const translated = await translateText(messageJa, 'en');
      setMessageEn(translated);
      toast.success(language === 'ja' ? '翻訳が完了しました' : 'Translation completed');
    } catch (error) {
      toast.error(t.translationError);
    } finally {
      setIsTranslatingMessage(false);
    }
  };

  const handleSend = () => {
    if (!subjectJa && !subjectEn) {
      toast.error(language === 'ja' ? '件名を入力してください' : 'Please enter a subject');
      return;
    }
    if (!messageJa && !messageEn) {
      toast.error(language === 'ja' ? 'メッセージを入力してください' : 'Please enter a message');
      return;
    }
    
    const messageType = inAppNotification && emailNotification ? '通知とメール' : inAppNotification ? '通知' : 'メール';
    toast.success(language === 'ja' ? `${recipientCount}人に${messageType}を送信しました` : `Sent ${messageType} to ${recipientCount} members`);
    onClose();
    if (onSend) {
      onSend(subjectJa, subjectEn, messageJa, messageEn, inAppNotification, emailNotification);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-[#F5F1E8] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#3D3D4E]">{t.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 件名 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#3D3D4E]">
                {t.subject}
              </label>
              <button
                className="bg-[#F5F1E8] border border-[rgba(61,61,78,0.15)] rounded-lg px-2 py-1 flex items-center gap-1.5 hover:bg-[#E8E4DB] transition-colors disabled:opacity-50"
                disabled={isTranslatingSubject || !subjectJa.trim()}
                onClick={handleTranslateSubject}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                  <g clipPath="url(#clip0)">
                    <path d={svgPaths.p1a356800} stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p5fcf400} stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M1.33333 3.33333H9.33333" stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M4.66667 1.33333H5.33333" stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p1bfa36c0} stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M9.33333 12H13.3333" stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                  <defs>
                    <clipPath id="clip0">
                      <rect fill="white" height="16" width="16" />
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-xs font-medium text-[#3D3D4E]">
                  {isTranslatingSubject ? t.translating : t.autoTranslate}
                </span>
              </button>
            </div>
            <div className="space-y-2">
              <Input
                value={subjectJa}
                onChange={(e) => setSubjectJa(e.target.value)}
                placeholder={t.japanese}
                className="bg-[#EEEBE3] border-0 text-[#3D3D4E]"
              />
              <Input
                value={subjectEn}
                onChange={(e) => setSubjectEn(e.target.value)}
                placeholder={t.english}
                className="bg-[#EEEBE3] border-0 text-[#3D3D4E]"
              />
            </div>
          </div>

          {/* メッセージ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#3D3D4E]">
                {t.message}
              </label>
              <button
                className="bg-[#F5F1E8] border border-[rgba(61,61,78,0.15)] rounded-lg px-2 py-1 flex items-center gap-1.5 hover:bg-[#E8E4DB] transition-colors disabled:opacity-50"
                disabled={isTranslatingMessage || !messageJa.trim()}
                onClick={handleTranslateMessage}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 16 16">
                  <g clipPath="url(#clip1)">
                    <path d={svgPaths.p1a356800} stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p5fcf400} stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M1.33333 3.33333H9.33333" stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M4.66667 1.33333H5.33333" stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d={svgPaths.p1bfa36c0} stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                    <path d="M9.33333 12H13.3333" stroke="#3D3D4E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.33333" />
                  </g>
                  <defs>
                    <clipPath id="clip1">
                      <rect fill="white" height="16" width="16" />
                    </clipPath>
                  </defs>
                </svg>
                <span className="text-xs font-medium text-[#3D3D4E]">
                  {isTranslatingMessage ? t.translating : t.autoTranslate}
                </span>
              </button>
            </div>
            <div className="space-y-2">
              <Textarea
                value={messageJa}
                onChange={(e) => setMessageJa(e.target.value)}
                placeholder={t.japanese}
                className="bg-[#EEEBE3] border-0 text-[#3D3D4E] min-h-[100px]"
                rows={4}
              />
              <Textarea
                value={messageEn}
                onChange={(e) => setMessageEn(e.target.value)}
                placeholder={t.english}
                className="bg-[#EEEBE3] border-0 text-[#3D3D4E] min-h-[100px]"
                rows={4}
              />
            </div>
          </div>

          {/* 通知タイプ */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#3D3D4E]">
              {t.notificationType}
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInAppNotification(!inAppNotification)}
                  className={`w-[18px] h-[17px] rounded border flex items-center justify-center ${
                    inAppNotification
                      ? 'bg-[#3D3D4E] border-[#3D3D4E]'
                      : 'bg-[#EEEBE3] border-[rgba(61,61,78,0.15)]'
                  }`}
                >
                  {inAppNotification && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                      <path d={svgPaths.p3de7e600} stroke="#F5F1E8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                    </svg>
                  )}
                </button>
                <span className="text-sm text-[#3D3D4E]">{t.inAppNotification}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEmailNotification(!emailNotification)}
                  className={`w-[18px] h-[17px] rounded border flex items-center justify-center ${
                    emailNotification
                      ? 'bg-[#3D3D4E] border-[#3D3D4E]'
                      : 'bg-[#EEEBE3] border-[rgba(61,61,78,0.15)]'
                  }`}
                >
                  {emailNotification && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 14 14">
                      <path d={svgPaths.p3de7e600} stroke="#F5F1E8" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.16667" />
                    </svg>
                  )}
                </button>
                <span className="text-sm font-medium text-[#3D3D4E]">{t.emailNotification}</span>
              </div>
            </div>
          </div>

          {/* 送信日時 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#3D3D4E]">
              {t.sendDateTime}
              <span className="ml-2 text-xs text-[#6A7282] font-normal">{t.sendDateTimeNote}</span>
            </label>
            <div className="flex items-center gap-2">
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="bg-[#EEEBE3] border-0 text-[#3D3D4E] w-24">
                  <SelectValue>{year}</SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-[#F5F1E8]">
                  {years.map((y) => (
                    <SelectItem key={y} value={y} className="text-[#3D3D4E]">{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-[#3D3D4E]">/</span>
              <Input
                value={monthDay}
                onChange={(e) => setMonthDay(e.target.value)}
                placeholder={t.placeholder.monthDay}
                className="bg-[#EEEBE3] border-0 text-[#3D3D4E] w-16"
              />
              <span className="text-[#3D3D4E]">/</span>
              <Input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder={t.placeholder.time}
                className="bg-[#EEEBE3] border-0 text-[#3D3D4E] w-20"
              />
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-[#F5F1E8] border-[rgba(61,61,78,0.15)] text-[#3D3D4E] hover:bg-[#E8E4DB]"
            >
              {t.cancel}
            </Button>
            <Button
              onClick={handleSend}
              className="bg-[#49B1E4] hover:bg-[#3A9FD3] text-white"
            >
              {t.send}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
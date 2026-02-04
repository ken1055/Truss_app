import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, CreditCard, Smartphone, Wallet } from 'lucide-react';
import type { Language, Event } from '../App';

interface PaymentPageProps {
  language: Language;
  event: Event;
  paymentMethod: 'paypay' | 'cash';
  onBack: () => void;
  onComplete: () => void;
}

const translations = {
  ja: {
    payment: '支払い',
    paymentFor: 'のお支払い',
    paypayPayment: 'PayPay決済',
    creditPayment: 'クレジットカード決済',
    cashPayment: '現地払い',
    participationFee: '参加費',
    scanQR: 'QRコードをPayPayアプリでスキャンしてください',
    cardNumber: 'カード番号',
    cardNumberPlaceholder: '1234 5678 9012 3456',
    expiryDate: '有効期限',
    expiryPlaceholder: 'MM/YY',
    cvv: 'セキュリティコード',
    cvvPlaceholder: '123',
    cardholderName: 'カード名義',
    cardholderPlaceholder: 'TARO YAMADA',
    payNow: '支払う',
    confirmCash: '参加を確定',
    cashNote: 'イベント当日に会場にて現金でお支払いください',
    paymentConfirmed: 'お支払いが完了しました',
    participationConfirmed: '参加が確定しました',
    back: '戻る',
    processingPayment: '決済処理中...',
  },
  en: {
    payment: 'Payment',
    paymentFor: 'Payment for ',
    paypayPayment: 'PayPay Payment',
    creditPayment: 'Credit Card Payment',
    cashPayment: 'Pay at Venue',
    participationFee: 'Participation Fee',
    scanQR: 'Scan QR code with PayPay app',
    cardNumber: 'Card Number',
    cardNumberPlaceholder: '1234 5678 9012 3456',
    expiryDate: 'Expiry Date',
    expiryPlaceholder: 'MM/YY',
    cvv: 'CVV',
    cvvPlaceholder: '123',
    cardholderName: 'Cardholder Name',
    cardholderPlaceholder: 'TARO YAMADA',
    payNow: 'Pay Now',
    confirmCash: 'Confirm Participation',
    cashNote: 'Please pay in cash at the venue on the event day',
    paymentConfirmed: 'Payment completed',
    participationConfirmed: 'Participation confirmed',
    back: 'Back',
    processingPayment: 'Processing payment...',
  }
};

export function PaymentPage({ language, event, paymentMethod, onBack, onComplete }: PaymentPageProps) {
  const t = translations[language];
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const displayTitle = language === 'ja' ? event.title : (event.titleEn || event.title);
  const participationFee = 500; // 固定で500円の参加費

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    console.log('Payment completed, calling onComplete');
    onComplete();
  };

  const getPaymentMethodIcon = () => {
    switch (paymentMethod) {
      case 'paypay':
        return <Smartphone className="w-6 h-6" />;
      case 'cash':
        return <Wallet className="w-6 h-6" />;
    }
  };

  const getPaymentMethodTitle = () => {
    switch (paymentMethod) {
      case 'paypay':
        return t.paypayPayment;
      case 'cash':
        return t.cashPayment;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8] p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.back}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              {getPaymentMethodIcon()}
              <CardTitle>{getPaymentMethodTitle()}</CardTitle>
            </div>
            <p className="text-[#6B6B7A]">
              {displayTitle}{language === 'ja' ? t.paymentFor : t.paymentFor}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 参加費表示 */}
            <div className="bg-[#F5F1E8] p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-[#6B6B7A]">{t.participationFee}</span>
                <span className="text-[#3D3D4E]">¥{participationFee.toLocaleString()}</span>
              </div>
            </div>

            {/* PayPay決済 */}
            {paymentMethod === 'paypay' && (
              <div className="space-y-4">
                <p className="text-sm text-[#6B6B7A] text-center">{t.scanQR}</p>
                <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="w-48 h-48 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                      <span className="text-gray-400">PayPay QR Code</span>
                    </div>
                    <p className="text-sm text-[#6B6B7A]">¥{participationFee.toLocaleString()}</p>
                  </div>
                </div>
                <Button
                  className="w-full bg-[#49B1E4] hover:bg-[#3A9FD3]"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? t.processingPayment : t.paymentConfirmed}
                </Button>
              </div>
            )}

            {/* 現地払い */}
            {paymentMethod === 'cash' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-[#3D3D4E]">{t.cashNote}</p>
                </div>
                <Button
                  className="w-full bg-[#49B1E4] hover:bg-[#3A9FD3]"
                  onClick={handleConfirmPayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? t.processingPayment : t.confirmCash}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/plans';
import { PaymentDetails } from '@/lib/transactions';
import { Copy, Check, Clock, Banknote, Bitcoin, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CryptoPayment } from './CryptoPayment';

type PaymentMethod = 'select' | 'transfer' | 'crypto' | 'opay';

interface PaymentSheetProps {
  paymentDetails: PaymentDetails;
  onConfirmPayment: () => void;
  onCancel: () => void;
}

export function PaymentSheet({ paymentDetails, onConfirmPayment, onCancel }: PaymentSheetProps) {
  const [copiedField, setCopiedField] = useState<'account' | 'amount' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('select');
  const [timeLeft, setTimeLeft] = useState<string>('');

  // Countdown timer
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const diff = paymentDetails.expiresAt.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeLeft('Expired');
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [paymentDetails.expiresAt]);

  const copyToClipboard = async (text: string, field: 'account' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Payment method selection screen
  if (paymentMethod === 'select') {
    return (
      <div className="animate-slide-up space-y-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Expires in {timeLeft}</span>
        </div>

        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Amount to pay</p>
          <p className="text-3xl font-bold tracking-tight">
            {formatPrice(paymentDetails.amount)}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setPaymentMethod('transfer')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Banknote className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Bank Transfer</p>
              <p className="text-sm text-muted-foreground">Transfer to our bank account</p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('opay')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-[#00C853]/10 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-[#00C853]" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Pay with OPay</p>
              <p className="text-sm text-muted-foreground">Opens OPay app to complete</p>
            </div>
          </button>

          <button
            onClick={() => setPaymentMethod('crypto')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Bitcoin className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Pay with Crypto</p>
              <p className="text-sm text-muted-foreground">USDT, SOL, BNB • Fee included</p>
            </div>
          </button>
        </div>

        <button
          onClick={onCancel}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Cancel transaction
        </button>
      </div>
    );
  }

  if (paymentMethod === 'crypto') {
    return (
      <CryptoPayment 
        amount={paymentDetails.amount}
        onConfirmPayment={onConfirmPayment}
        onCancel={() => setPaymentMethod('select')}
      />
    );
  }

  // OPay payment screen
  if (paymentMethod === 'opay') {
    return (
      <div className="animate-slide-up space-y-6">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-medium">Expires in {timeLeft}</span>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-full bg-[#00C853]/10 flex items-center justify-center mx-auto">
            <Smartphone className="w-8 h-8 text-[#00C853]" />
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Amount to pay</p>
            <p className="text-3xl font-bold tracking-tight">
              {formatPrice(paymentDetails.amount)}
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Click below to open OPay and complete your payment
          </p>
        </div>

        <Button
          onClick={onConfirmPayment}
          className="w-full h-14 text-lg font-bold bg-[#00C853] hover:bg-[#00C853]/90 text-white"
        >
          Open OPay App
        </Button>

        <button
          onClick={() => setPaymentMethod('select')}
          className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Choose different method
        </button>
      </div>
    );
  }

  // Bank transfer screen
  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Expires in {timeLeft}</span>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Transfer exactly</p>
          <button
            onClick={() => copyToClipboard(paymentDetails.amount.toString(), 'amount')}
            className="flex items-center justify-center gap-2 mx-auto"
          >
            <p className="text-3xl font-bold tracking-tight">
              {formatPrice(paymentDetails.amount)}
            </p>
            {copiedField === 'amount' ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
            )}
          </button>
        </div>

        <div className="h-px bg-border" />

        {/* Account details */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Bank</span>
            <span className="font-semibold">{paymentDetails.bankName}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account Number</span>
            <button
              onClick={() => copyToClipboard(paymentDetails.accountNumber, 'account')}
              className="flex items-center gap-2 font-mono text-lg font-bold tracking-wider press-effect"
            >
              {paymentDetails.accountNumber}
              {copiedField === 'account' ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Account Name</span>
            <span className="font-medium text-sm">{paymentDetails.accountName}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onConfirmPayment}
        className="w-full h-14 text-lg font-bold"
        variant="primary"
      >
        I've sent the money
      </Button>

      <button
        onClick={() => setPaymentMethod('select')}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Choose different method
      </button>
    </div>
  );
}

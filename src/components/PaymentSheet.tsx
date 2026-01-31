import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/plans';
import { PaymentDetails } from '@/lib/transactions';
import { Copy, Check, Clock, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CryptoPayment } from './CryptoPayment';

type PaymentMethod = 'transfer' | 'crypto';

interface PaymentSheetProps {
  paymentDetails: PaymentDetails;
  onConfirmPayment: () => void;
  onCancel: () => void;
}

export function PaymentSheet({ paymentDetails, onConfirmPayment, onCancel }: PaymentSheetProps) {
  const [copiedField, setCopiedField] = useState<'account' | 'amount' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('transfer');
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

  if (paymentMethod === 'crypto') {
    return (
      <CryptoPayment 
        amount={paymentDetails.amount}
        onConfirmPayment={onConfirmPayment}
        onCancel={() => setPaymentMethod('transfer')}
      />
    );
  }

  return (
    <div className="animate-slide-up space-y-6">
      {/* Timer */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Expires in {timeLeft}</span>
      </div>

      {/* Payment method tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setPaymentMethod('transfer')}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg border font-medium transition-colors",
            paymentMethod === 'transfer'
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          Bank Transfer
        </button>
        <button
          onClick={() => setPaymentMethod('crypto')}
          className={cn(
            "flex-1 py-3 px-4 rounded-lg border font-medium transition-colors flex items-center justify-center gap-2",
            "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <Wallet className="w-4 h-4" />
          Crypto
        </button>
      </div>

      {/* Transfer details card */}
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

      {/* Confirm button */}
      <Button
        onClick={onConfirmPayment}
        className="w-full h-14 text-lg font-bold"
        variant="primary"
      >
        I've sent the money
      </Button>

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancel transaction
      </button>
    </div>
  );
}

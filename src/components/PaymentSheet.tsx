import { useState, useEffect } from 'react';
import { formatPrice } from '@/lib/plans';
import { PaymentDetails } from '@/lib/transactions';
import { Copy, Check, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PaymentSheetProps {
  paymentDetails: PaymentDetails;
  onConfirmPayment: () => void;
  onCancel: () => void;
}

export function PaymentSheet({ paymentDetails, onConfirmPayment, onCancel }: PaymentSheetProps) {
  const [copied, setCopied] = useState(false);
  const [showOtherMethods, setShowOtherMethods] = useState(false);
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

  const copyAccountNumber = async () => {
    try {
      await navigator.clipboard.writeText(paymentDetails.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = paymentDetails.accountNumber;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="animate-slide-up space-y-6">
      {/* Timer */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">Expires in {timeLeft}</span>
      </div>

      {/* Transfer details card */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Transfer exactly</p>
          <p className="text-3xl font-bold tracking-tight">
            {formatPrice(paymentDetails.amount)}
          </p>
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
              onClick={copyAccountNumber}
              className="flex items-center gap-2 font-mono text-lg font-bold tracking-wider press-effect"
            >
              {paymentDetails.accountNumber}
              {copied ? (
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

      {/* Other payment methods */}
      <button
        onClick={() => setShowOtherMethods(!showOtherMethods)}
        className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Other payment options
        <ChevronDown className={cn(
          "w-4 h-4 transition-transform",
          showOtherMethods && "rotate-180"
        )} />
      </button>

      {showOtherMethods && (
        <div className="space-y-2 animate-slide-up">
          <button className="w-full p-4 border border-border rounded-lg text-left hover:bg-muted/50 transition-colors press-effect">
            <div className="font-medium">Pay with Card</div>
            <div className="text-sm text-muted-foreground">Visa, Mastercard, Verve</div>
          </button>
          <button className="w-full p-4 border border-border rounded-lg text-left hover:bg-muted/50 transition-colors press-effect">
            <div className="font-medium">USSD</div>
            <div className="text-sm text-muted-foreground">Pay with bank USSD code</div>
          </button>
        </div>
      )}

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

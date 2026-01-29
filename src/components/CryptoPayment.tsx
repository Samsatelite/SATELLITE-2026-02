import { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/plans';

interface CryptoOption {
  currency: string;
  network: string;
}

interface CryptoPaymentProps {
  amount: number;
  onCancel: () => void;
  onConfirmPayment: () => void;
}

// Mock exchange rates (in production, fetch from NowPayments API)
const MOCK_RATES: Record<string, number> = {
  'USDT': 1,
  'SOL': 0.0085, // 1 NGN = 0.0085 SOL approx
  'BNB': 0.0017, // 1 NGN = 0.0017 BNB approx
};

// Crypto fee (2.5% for example)
const CRYPTO_FEE_PERCENT = 2.5;

// Mock wallet addresses
const MOCK_ADDRESSES: Record<string, string> = {
  'USDT-TRC20': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  'USDT-BSC': '0x55d398326f99059fF775485246999027B3197955',
  'USDT-Polygon': '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  'SOL-Solana': '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'BNB-BSC': '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
};

const cryptoOptions: CryptoOption[] = [
  { currency: 'USDT', network: 'TRC20' },
  { currency: 'USDT', network: 'BSC' },
  { currency: 'USDT', network: 'Polygon' },
  { currency: 'SOL', network: 'Solana' },
  { currency: 'BNB', network: 'BSC' },
];

export function CryptoPayment({ amount, onCancel, onConfirmPayment }: CryptoPaymentProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0]);
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [step, setStep] = useState<'waiting' | 'confirming' | 'confirmed'>('waiting');

  // Calculate final amount with fee
  const feeAmount = amount * (CRYPTO_FEE_PERCENT / 100);
  const totalNGN = amount + feeAmount;
  const rate = MOCK_RATES[selectedCrypto.currency] || 1;
  const cryptoAmount = selectedCrypto.currency === 'USDT' 
    ? (totalNGN / 1650).toFixed(2) // Mock NGN/USD rate
    : (totalNGN * rate).toFixed(6);

  const walletAddress = MOCK_ADDRESSES[`${selectedCrypto.currency}-${selectedCrypto.network}`] || '';

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = walletAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(cryptoAmount);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleConfirm = () => {
    setStep('confirming');
    // Simulate payment confirmation (in production, poll NowPayments API)
    setTimeout(() => {
      setStep('confirmed');
      setTimeout(() => {
        onConfirmPayment();
      }, 1500);
    }, 3000);
  };

  return (
    <div className="animate-slide-up space-y-4">
      {/* Timer */}
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">
          {timeLeft > 0 ? `Expires in ${formatTime(timeLeft)}` : 'Expired'}
        </span>
      </div>

      {/* Crypto selector */}
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-between p-3 bg-muted border border-border rounded-lg"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold">{selectedCrypto.currency}</span>
            <span className="text-sm text-muted-foreground">({selectedCrypto.network})</span>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            showOptions && "rotate-180"
          )} />
        </button>

        {showOptions && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {cryptoOptions.map((option) => (
              <button
                key={`${option.currency}-${option.network}`}
                onClick={() => {
                  setSelectedCrypto(option);
                  setShowOptions(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between p-3 hover:bg-muted transition-colors",
                  selectedCrypto.currency === option.currency && selectedCrypto.network === option.network && "bg-primary/10"
                )}
              >
                <span className="font-medium">{option.currency}</span>
                <span className="text-sm text-muted-foreground">{option.network}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Amount display */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Send exactly</p>
          <button 
            onClick={copyAmount}
            className="flex items-center justify-center gap-2 mx-auto"
          >
            <p className="text-3xl font-bold tracking-tight">
              {cryptoAmount} {selectedCrypto.currency}
            </p>
            <Copy className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
          <p className="text-xs text-muted-foreground">
            ≈ {formatPrice(totalNGN)} (includes {CRYPTO_FEE_PERCENT}% fee)
          </p>
        </div>

        <div className="h-px bg-border" />

        {/* Network info */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Network</span>
          <span className="font-semibold text-primary">{selectedCrypto.network}</span>
        </div>

        {/* Wallet address */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">To this address</span>
          <button
            onClick={copyAddress}
            className="w-full flex items-center gap-2 p-3 bg-muted rounded-lg text-left"
          >
            <span className="flex-1 font-mono text-xs break-all">{walletAddress}</span>
            {copied ? (
              <Check className="w-4 h-4 text-success shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Confirmation steps */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            step === 'waiting' ? "bg-primary text-primary-foreground" : "bg-success text-white"
          )}>
            {step === 'waiting' ? '1' : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <span className="text-sm">Send {selectedCrypto.currency} to the address above</span>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            step === 'confirming' ? "bg-primary text-primary-foreground animate-pulse" : 
            step === 'confirmed' ? "bg-success text-white" : "bg-muted text-muted-foreground"
          )}>
            {step === 'confirmed' ? <CheckCircle2 className="w-4 h-4" /> : '2'}
          </div>
          <span className={cn(
            "text-sm",
            step === 'waiting' && "text-muted-foreground"
          )}>
            {step === 'confirming' ? 'Confirming payment...' : 'Payment confirmed'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
            step === 'confirmed' ? "bg-success text-white" : "bg-muted text-muted-foreground"
          )}>
            {step === 'confirmed' ? <CheckCircle2 className="w-4 h-4" /> : '3'}
          </div>
          <span className={cn(
            "text-sm",
            step !== 'confirmed' && "text-muted-foreground"
          )}>Data/Airtime delivered</span>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-xs">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Only send {selectedCrypto.currency} on the {selectedCrypto.network} network. 
          Sending other coins or using wrong network will result in loss of funds.
        </p>
      </div>

      {/* Confirm button */}
      {step === 'waiting' && (
        <button
          onClick={handleConfirm}
          disabled={timeLeft <= 0}
          className="w-full h-14 bg-primary text-primary-foreground font-bold text-lg rounded-lg disabled:opacity-50"
        >
          I've sent the payment
        </button>
      )}

      {/* Cancel */}
      <button
        onClick={onCancel}
        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Cancel
      </button>
    </div>
  );
}
import { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown, Clock, AlertCircle, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/plans';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';

interface CryptoOption {
  currency: string;
  network: string;
  logo: string;
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

// Coin logos (using simple emoji/text representations - in production use actual images)
const cryptoOptions: CryptoOption[] = [
  { currency: 'USDT', network: 'TRC20', logo: '₮' },
  { currency: 'USDT', network: 'BSC', logo: '₮' },
  { currency: 'USDT', network: 'Polygon', logo: '₮' },
  { currency: 'SOL', network: 'Solana', logo: '◎' },
  { currency: 'BNB', network: 'BSC', logo: '⬡' },
];

// Crypto logo colors
const CRYPTO_COLORS: Record<string, string> = {
  'USDT': '#26A17B',
  'SOL': '#9945FF',
  'BNB': '#F0B90B',
};

export function CryptoPayment({ amount, onCancel, onConfirmPayment }: CryptoPaymentProps) {
  const [selectedCrypto, setSelectedCrypto] = useState<CryptoOption>(cryptoOptions[0]);
  const [showOptions, setShowOptions] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [step, setStep] = useState<'waiting' | 'confirming' | 'confirmed'>('waiting');

  // Calculate final amount with fee
  const totalNGN = amount * (1 + CRYPTO_FEE_PERCENT / 100);
  const rate = MOCK_RATES[selectedCrypto.currency] || 1;
  const cryptoAmount = selectedCrypto.currency === 'USDT' 
    ? (totalNGN / 1650).toFixed(2) // Mock NGN/USD rate
    : (totalNGN * rate).toFixed(6);

  const walletAddress = MOCK_ADDRESSES[`${selectedCrypto.currency}-${selectedCrypto.network}`] || '';

  // Generate QR code URL (using a public QR code API)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(walletAddress)}`;

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
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = walletAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const copyAmount = async () => {
    try {
      await navigator.clipboard.writeText(cryptoAmount);
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
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

  const cryptoColor = CRYPTO_COLORS[selectedCrypto.currency] || '#888';

  // Get current step text
  const getStepText = () => {
    switch (step) {
      case 'waiting':
        return `Send ${selectedCrypto.currency} to the address above`;
      case 'confirming':
        return 'Confirming payment...';
      case 'confirmed':
        return 'Payment confirmed! Delivering...';
    }
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

      {/* Crypto selector with logo */}
      <div className="relative">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="w-full flex items-center justify-between p-3 bg-muted border border-border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <span 
              className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white"
              style={{ backgroundColor: cryptoColor }}
            >
              {selectedCrypto.logo}
            </span>
            <div className="text-left">
              <span className="font-semibold">{selectedCrypto.currency}</span>
              <span className="text-sm text-muted-foreground ml-2">({selectedCrypto.network})</span>
            </div>
          </div>
          <ChevronDown className={cn(
            "w-4 h-4 transition-transform",
            showOptions && "rotate-180"
          )} />
        </button>

        {showOptions && (
          <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
            {cryptoOptions.map((option) => {
              const optionColor = CRYPTO_COLORS[option.currency] || '#888';
              return (
                <button
                  key={`${option.currency}-${option.network}`}
                  onClick={() => {
                    setSelectedCrypto(option);
                    setShowOptions(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 hover:bg-muted transition-colors",
                    selectedCrypto.currency === option.currency && selectedCrypto.network === option.network && "bg-primary/10"
                  )}
                >
                  <span 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{ backgroundColor: optionColor }}
                  >
                    {option.logo}
                  </span>
                  <div className="text-left">
                    <span className="font-medium">{option.currency}</span>
                    <span className="text-sm text-muted-foreground ml-2">{option.network}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Amount display */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">Send exactly</p>
          <button 
            onClick={copyAmount}
            className="flex items-center justify-center gap-2 mx-auto group"
          >
            <p className="text-3xl font-bold tracking-tight">
              {cryptoAmount} {selectedCrypto.currency}
            </p>
            {copiedAmount ? (
              <Check className="w-5 h-5 text-success" />
            ) : (
              <Copy className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
          <p className="text-xs text-muted-foreground">
            ≈ {formatPrice(totalNGN)} (fee included)
          </p>
        </div>

        <div className="h-px bg-border" />

        {/* Network info */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Network</span>
          <span className="font-semibold" style={{ color: cryptoColor }}>{selectedCrypto.network}</span>
        </div>

        {/* Wallet address */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Wallet address</span>
          <button
            onClick={copyAddress}
            className="w-full flex items-center gap-2 p-3 bg-muted rounded-lg text-left group"
          >
            <span className="flex-1 font-mono text-xs break-all">{walletAddress}</span>
            {copiedAddress ? (
              <Check className="w-4 h-4 text-success shrink-0" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors" />
            )}
          </button>
        </div>

        {/* QR Code button */}
        <Drawer>
          <DrawerTrigger asChild>
            <Button variant="outline" className="w-full gap-2">
              <QrCode className="w-4 h-4" />
              Show QR Code
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="text-center">Scan to Pay</DrawerTitle>
            </DrawerHeader>
            <div className="flex flex-col items-center gap-4 pb-8">
              <div className="p-4 bg-white rounded-xl">
                <img 
                  src={qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="w-48 h-48"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center px-6">
                Scan this QR code with your wallet app to pay <strong>{cryptoAmount} {selectedCrypto.currency}</strong> on the <strong>{selectedCrypto.network}</strong> network.
              </p>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Warning notice - moved below wallet address */}
        <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Only send {selectedCrypto.currency} on the {selectedCrypto.network} network. 
            Sending other coins or using wrong network will result in loss of funds.
          </p>
        </div>
      </div>

      {/* Single progress step that changes */}
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
          step === 'waiting' ? "bg-primary text-primary-foreground" : 
          step === 'confirming' ? "bg-primary text-primary-foreground animate-pulse" : 
          "bg-success text-success-foreground"
        )}>
          {step === 'confirmed' ? <Check className="w-4 h-4" /> : 
           step === 'waiting' ? '1' : '2'}
        </div>
        <span className="text-sm font-medium">{getStepText()}</span>
      </div>

      {/* Confirm button */}
      {step === 'waiting' && (
        <Button
          onClick={handleConfirm}
          disabled={timeLeft <= 0}
          className="w-full h-14 text-lg font-bold"
          variant="primary"
        >
          I've sent the payment
        </Button>
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
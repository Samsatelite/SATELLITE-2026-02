import { useRef } from 'react';
import { Transaction } from '@/lib/transactions';
import { formatPrice } from '@/lib/plans';
import { networks } from '@/lib/networks';
import { Share2, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import html2canvas from 'html2canvas';

interface SuccessReceiptProps {
  transaction: Transaction;
  onNewPurchase: () => void;
}

export function SuccessReceipt({ transaction, onNewPurchase }: SuccessReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const network = networks[transaction.network];
  const isAirtime = !('size' in transaction.plan);
  const planLabel = isAirtime ? 'Airtime' : (transaction.plan as { size: string }).size;

  const generateReceiptImage = async (): Promise<Blob | null> => {
    if (!receiptRef.current) return null;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
      });
      
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      });
    } catch (error) {
      console.error('Failed to generate receipt image:', error);
      return null;
    }
  };

  const shareReceipt = async () => {
    const blob = await generateReceiptImage();
    
    if (blob && navigator.share && navigator.canShare) {
      try {
        const file = new File([blob], `datadome-receipt-${transaction.reference}.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Datadome Receipt',
            text: `${isAirtime ? 'Airtime' : 'Data'} Purchase Receipt`,
          });
          return;
        }
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
    
    // Fallback to WhatsApp text share
    const typeLabel = isAirtime ? 'Airtime' : 'Data';
    const message = encodeURIComponent(
      `✅ ${typeLabel} Purchase Successful!\n\n` +
      `📱 ${transaction.phoneNumber}\n` +
      `📊 ${planLabel} (${network.name})\n` +
      `💰 ${formatPrice(transaction.amount)}\n` +
      `🔖 Ref: ${transaction.reference}\n\n` +
      `Powered by Datadome`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const downloadReceipt = async () => {
    const blob = await generateReceiptImage();
    if (!blob) return;
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `datadome-receipt-${transaction.reference}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-scale-in">
      {/* Success icon */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path
                d="M5 13l4 4L19 7"
                className="animate-checkmark"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
      </div>

      {/* Success message */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold tracking-tight">{isAirtime ? 'Airtime Sent!' : 'Data Sent!'}</h2>
        <p className="text-muted-foreground mt-1">
          {planLabel} delivered to {transaction.phoneNumber}
        </p>
      </div>

      {/* Receipt card - this is what gets captured as image */}
      <div ref={receiptRef} className="bg-card border border-border rounded-xl p-5 space-y-4">
        {/* Logo */}
        <div className="text-center pb-2 border-b border-border">
          <span className="text-lg font-bold tracking-tighter">
            datadome<span className="text-primary">.</span>
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-bold text-lg">{formatPrice(transaction.amount)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{isAirtime ? 'Type' : 'Data'}</span>
          <span className="font-semibold">{planLabel}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Network</span>
          <span 
            className="font-semibold px-2 py-0.5 rounded text-sm"
            style={{ 
              backgroundColor: network.color + '20',
              color: network.color,
            }}
          >
            {network.name}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Phone</span>
          <span className="font-mono font-medium">{transaction.phoneNumber}</span>
        </div>

        <div className="h-px bg-border" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Reference</span>
          <span className="font-mono text-sm">{transaction.reference}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Date</span>
          <span className="text-sm">
            {transaction.createdAt.toLocaleDateString('en-NG', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Status</span>
          <span className="text-sm font-medium text-success">✓ Successful</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        <div className="flex gap-2">
          <Button
            onClick={shareReceipt}
            variant="outline"
            className="flex-1 h-12"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={downloadReceipt}
            variant="outline"
            className="flex-1 h-12"
          >
            <Download className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>

        <Button
          onClick={onNewPurchase}
          className="w-full h-12"
          variant="primary"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Buy Again
        </Button>
      </div>
    </div>
  );
}

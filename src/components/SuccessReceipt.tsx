import { Transaction, formatTransactionId } from '@/lib/transactions';
import { formatPrice } from '@/lib/plans';
import { networks } from '@/lib/networks';
import { Check, Share2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SuccessReceiptProps {
  transaction: Transaction;
  onNewPurchase: () => void;
}

export function SuccessReceipt({ transaction, onNewPurchase }: SuccessReceiptProps) {
  const network = networks[transaction.network];

  const shareToWhatsApp = () => {
    const message = encodeURIComponent(
      `✅ Data Purchase Successful!\n\n` +
      `📱 ${transaction.phoneNumber}\n` +
      `📊 ${transaction.plan.size} (${network.name})\n` +
      `💰 ${formatPrice(transaction.amount)}\n` +
      `🔖 Ref: ${transaction.reference}\n\n` +
      `Powered by Datadome`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
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
        <h2 className="text-2xl font-bold tracking-tight">Data Sent!</h2>
        <p className="text-muted-foreground mt-1">
          {transaction.plan.size} delivered to {transaction.phoneNumber}
        </p>
      </div>

      {/* Receipt card */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Amount</span>
          <span className="font-bold text-lg">{formatPrice(transaction.amount)}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Data</span>
          <span className="font-semibold">{transaction.plan.size}</span>
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
      </div>

      {/* Actions */}
      <div className="mt-6 space-y-3">
        <Button
          onClick={shareToWhatsApp}
          variant="outline"
          className="w-full h-12"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share to WhatsApp
        </Button>

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

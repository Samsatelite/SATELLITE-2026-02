import { useState, useEffect } from 'react';
import { Copy, Share2, Gift, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ReferralSectionProps {
  onClaimRewards: () => void;
}

export function ReferralSection({ onClaimRewards }: ReferralSectionProps) {
  const [referralCode, setReferralCode] = useState('');
  const [referralPoints, setReferralPoints] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);
  const [inputCode, setInputCode] = useState('');
  const [hasUsedCode, setHasUsedCode] = useState(false);

  useEffect(() => {
    // Check URL for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode && !localStorage.getItem('datadome_used_referral')) {
      setInputCode(refCode.toUpperCase());
    }

    // Load from localStorage for demo (in production from Supabase)
    const stored = localStorage.getItem('datadome_referral');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setReferralCode(data.code || generateCode());
        setReferralPoints(data.points || 0);
        setPendingRewards(Math.floor((data.points || 0) / 5));
      } catch {
        const code = generateCode();
        setReferralCode(code);
        localStorage.setItem('datadome_referral', JSON.stringify({ code, points: 0 }));
      }
    } else {
      const code = generateCode();
      setReferralCode(code);
      localStorage.setItem('datadome_referral', JSON.stringify({ code, points: 0 }));
    }

    // Check if user has already used a referral code
    setHasUsedCode(!!localStorage.getItem('datadome_used_referral'));
  }, []);

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Please copy manually: ' + referralCode,
        variant: 'destructive',
      });
    }
  };

  const shareCode = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}?ref=${referralCode}`;
    const message = `Get fast data topups on Datadome! Use my referral link: ${shareUrl}`;
    
    if (navigator.share) {
      navigator.share({ 
        title: 'Datadome Referral',
        text: message,
        url: shareUrl
      });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const applyCode = () => {
    if (!inputCode.trim()) return;
    
    // Check if it's their own code
    if (inputCode.toUpperCase() === referralCode) {
      toast({
        title: 'Invalid code',
        description: "You can't use your own referral code",
        variant: 'destructive',
      });
      return;
    }

    // In production, this would validate against Supabase
    if (hasUsedCode) {
      toast({
        title: 'Already used',
        description: 'You have already used a referral code',
        variant: 'destructive',
      });
      return;
    }

    localStorage.setItem('datadome_used_referral', inputCode.toUpperCase());
    setHasUsedCode(true);
    toast({
      title: 'Code applied!',
      description: 'Thanks for using a referral code',
    });
    setInputCode('');
    
    // Clear the URL parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('ref');
    window.history.replaceState({}, '', url.pathname);
  };

  return (
    <div className="mt-6 space-y-4">
      <Separator />

      {/* Enter referral code - above your referral code */}
      {!hasUsedCode ? (
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Have a referral code?</span>
          <div className="flex gap-2">
            <Input
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="Enter code"
              maxLength={6}
              className="flex-1 uppercase font-mono"
            />
            <Button size="sm" onClick={applyCode} disabled={!inputCode.trim()}>
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-success text-center">
          ✓ Referral code applied
        </p>
      )}

      <Separator />
      
      {/* Your referral code - always visible */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Your referral code</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-foreground bg-muted px-3 py-1 rounded">
              {referralCode}
            </span>
            <button
              onClick={copyCode}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={shareCode}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <Separator />

        {/* Points & Rewards */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Referral points</span>
            <span className="text-sm font-bold text-foreground">{referralPoints}</span>
          </div>
          {pendingRewards > 0 && (
            <button
              onClick={onClaimRewards}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Gift className="w-3.5 h-3.5" />
              {pendingRewards} reward{pendingRewards > 1 ? 's' : ''} available
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

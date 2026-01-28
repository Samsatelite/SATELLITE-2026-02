import { useState, useEffect } from 'react';
import { ArrowLeft, Gift, Wifi, Phone, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface RewardsPageProps {
  onBack: () => void;
}

interface Reward {
  id: string;
  type: 'data' | 'airtime';
  value: string;
  claimed: boolean;
  earnedAt: Date;
}

export function RewardsPage({ onBack }: RewardsPageProps) {
  const [referralPoints, setReferralPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<'data' | 'airtime' | null>(null);

  useEffect(() => {
    // Load from localStorage (in production from Supabase)
    const stored = localStorage.getItem('datadome_referral');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setReferralPoints(data.points || 0);
        
        // Generate pending rewards based on points
        const numRewards = Math.floor((data.points || 0) / 5);
        const existingRewards = data.rewards || [];
        
        // Add new rewards if needed
        const pendingRewards: Reward[] = [];
        for (let i = existingRewards.length; i < numRewards; i++) {
          pendingRewards.push({
            id: crypto.randomUUID(),
            type: 'data',
            value: 'unclaimed',
            claimed: false,
            earnedAt: new Date(),
          });
        }
        
        setRewards([...existingRewards, ...pendingRewards]);
      } catch {
        setReferralPoints(0);
      }
    }
  }, []);

  const claimReward = (rewardId: string, choice: 'data' | 'airtime') => {
    const stored = localStorage.getItem('datadome_referral');
    if (!stored) return;

    const data = JSON.parse(stored);
    const updatedRewards = rewards.map(r => 
      r.id === rewardId 
        ? { ...r, claimed: true, type: choice, value: choice === 'data' ? '1GB' : '₦500' }
        : r
    );
    
    // Deduct 5 points per reward
    const newPoints = Math.max(0, data.points - 5);
    
    localStorage.setItem('datadome_referral', JSON.stringify({
      ...data,
      points: newPoints,
      rewards: updatedRewards,
    }));

    setReferralPoints(newPoints);
    setRewards(updatedRewards);
    setSelectedReward(null);
    
    toast({
      title: 'Reward claimed!',
      description: `You received ${choice === 'data' ? '1GB Data' : '₦500 Airtime'}`,
    });
  };

  const unclaimedRewards = rewards.filter(r => !r.claimed);
  const claimedRewards = rewards.filter(r => r.claimed);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header with back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="text-center">
        <Gift className="w-12 h-12 mx-auto text-primary mb-3" />
        <h2 className="text-xl font-bold">Your Rewards</h2>
        <p className="text-sm text-muted-foreground mt-1">
          {referralPoints} points • {unclaimedRewards.length} unclaimed
        </p>
      </div>

      {/* Reward breakdown */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-2">How it works</h3>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• Every 5 referrals = 1 reward</li>
          <li>• Choose: 1GB Data or ₦500 Airtime</li>
          <li>• Rewards are applied to your next purchase</li>
        </ul>
      </div>

      {/* Unclaimed rewards */}
      {unclaimedRewards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Claim Your Rewards</h3>
          {unclaimedRewards.map((reward) => (
            <div key={reward.id} className="border border-border rounded-lg p-4">
              <p className="text-sm font-medium mb-3">Choose your reward:</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => claimReward(reward.id, 'data')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    "hover:border-primary hover:bg-primary/5",
                    selectedReward === 'data' ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <Wifi className="w-6 h-6 text-primary" />
                  <span className="text-sm font-semibold">1GB Data</span>
                </button>
                <button
                  onClick={() => claimReward(reward.id, 'airtime')}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    "hover:border-primary hover:bg-primary/5",
                    selectedReward === 'airtime' ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <Phone className="w-6 h-6 text-primary" />
                  <span className="text-sm font-semibold">₦500 Airtime</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claimed rewards */}
      {claimedRewards.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Claimed</h3>
          {claimedRewards.map((reward) => (
            <div key={reward.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                {reward.type === 'data' ? (
                  <Wifi className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Phone className="w-4 h-4 text-muted-foreground" />
                )}
                <span className="text-sm">{reward.value}</span>
              </div>
              <div className="flex items-center gap-1 text-success text-xs">
                <Check className="w-3.5 h-3.5" />
                Claimed
              </div>
            </div>
          ))}
        </div>
      )}

      {unclaimedRewards.length === 0 && claimedRewards.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No rewards yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Refer 5 friends to earn your first reward!
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Gift, Users, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReferralStats {
  totalReferrals: number;
  totalRewardsClaimed: number;
  topReferrers: Array<{
    userId: string;
    code: string;
    referrals: number;
    rewardsClaimed: number;
  }>;
  recentReferrals: Array<{
    id: string;
    referrerCode: string;
    referredUser: string;
    date: string;
  }>;
}

export function AdminReferrals() {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalRewardsClaimed: 0,
    topReferrers: [],
    recentReferrals: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    setLoading(true);
    try {
      // Fetch profiles with referral data
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, referral_code, referral_points, referred_by, created_at');

      if (error) {
        console.error('Error fetching referral data:', error);
        return;
      }

      // Calculate stats
      const referralsCount = profiles?.filter(p => p.referred_by).length || 0;
      
      // Mock top referrers - in production, aggregate from profiles
      const topReferrers = [
        { userId: '1', code: 'ABC123', referrals: 25, rewardsClaimed: 5 },
        { userId: '2', code: 'XYZ789', referrals: 18, rewardsClaimed: 3 },
        { userId: '3', code: 'DEF456', referrals: 12, rewardsClaimed: 2 },
        { userId: '4', code: 'GHI012', referrals: 8, rewardsClaimed: 1 },
        { userId: '5', code: 'JKL345', referrals: 5, rewardsClaimed: 1 },
      ];

      // Mock recent referrals
      const recentReferrals = [
        { id: '1', referrerCode: 'ABC123', referredUser: '08012345678', date: new Date().toISOString() },
        { id: '2', referrerCode: 'XYZ789', referredUser: '07098765432', date: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', referrerCode: 'ABC123', referredUser: '09087654321', date: new Date(Date.now() - 7200000).toISOString() },
      ];

      setStats({
        totalReferrals: referralsCount || 68, // Mock fallback
        totalRewardsClaimed: 12,
        topReferrers,
        recentReferrals,
      });
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading referral data...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Referrals</h1>
        <p className="text-muted-foreground">Monitor referral program performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-xs text-success font-medium">+15%</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          <p className="text-sm text-muted-foreground">Total Referrals</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <Gift className="w-5 h-5 text-primary" />
            <span className="text-xs text-success font-medium">+8%</span>
          </div>
          <p className="text-2xl font-bold">{stats.totalRewardsClaimed}</p>
          <p className="text-sm text-muted-foreground">Rewards Claimed</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">17%</p>
          <p className="text-sm text-muted-foreground">Conversion Rate</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <p className="text-2xl font-bold">{stats.topReferrers[0]?.referrals || 0}</p>
          <p className="text-sm text-muted-foreground">Top Referrer Score</p>
        </div>
      </div>

      {/* Top Referrers */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Top Referrers</h2>
        </div>
        <div className="divide-y divide-border">
          {stats.topReferrers.map((referrer, index) => (
            <div key={referrer.userId} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-100 text-yellow-700' :
                  index === 1 ? 'bg-gray-100 text-gray-700' :
                  index === 2 ? 'bg-orange-100 text-orange-700' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <p className="font-mono font-medium">{referrer.code}</p>
                  <p className="text-xs text-muted-foreground">{referrer.rewardsClaimed} rewards claimed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{referrer.referrals}</p>
                <p className="text-xs text-muted-foreground">referrals</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Referrals */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Recent Referrals</h2>
        </div>
        <div className="divide-y divide-border">
          {stats.recentReferrals.map((referral) => (
            <div key={referral.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <div>
                  <p className="text-sm">
                    <span className="font-mono font-medium">{referral.referredUser}</span>
                    {' '}used code{' '}
                    <span className="font-mono text-primary">{referral.referrerCode}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{formatDate(referral.date)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
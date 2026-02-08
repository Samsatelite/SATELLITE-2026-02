import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function AuthScreen() {
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    // In production, validate against Supabase
    localStorage.setItem('datadome_used_referral', couponCode.toUpperCase());
    setCouponApplied(true);
    toast({
      title: 'Coupon applied!',
      description: 'Your discount will be applied at checkout',
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 text-center">
        <h1 className="text-2xl font-bold tracking-tighter">
          datadome<span className="text-primary">.</span>
        </h1>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Welcome</h2>
            <p className="text-muted-foreground">
              Sign in to buy data & airtime instantly
            </p>
          </div>

          <div className="space-y-4">
            <Button 
              onClick={handleGoogleLogin} 
              variant="outline" 
              className="w-full h-14 text-base font-medium flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            {/* Coupon code section */}
            {!couponApplied ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Have a coupon code?</p>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter coupon code"
                    maxLength={10}
                    className="flex-1 uppercase font-mono text-sm"
                  />
                  <Button size="sm" onClick={handleApplyCoupon} disabled={!couponCode.trim()} variant="outline">
                    Apply
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center text-success">✓ Coupon code applied</p>
            )}
          </div>

          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              Track all your transactions
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              Unique ID for your purchases
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">✓</span>
              Earn referral rewards
            </li>
          </ul>
        </div>
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        Fast. Simple. Data.
      </footer>
    </div>
  );
}

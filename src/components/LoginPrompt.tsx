import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface LoginPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
  onContinueAsGuest?: () => void;
  required?: boolean; // For bulk transactions >5 numbers
}

export function LoginPrompt({ open, onOpenChange, onLogin, onContinueAsGuest, required = false }: LoginPromptProps) {
  
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
      } else {
        onLogin();
      }
    } catch (err) {
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={required ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={required ? (e) => e.preventDefault() : undefined}>
        <DialogHeader>
          <DialogTitle>
            {required ? 'Account Required' : 'Create an Account'}
          </DialogTitle>
          <DialogDescription>
            {required 
              ? 'For bulk transactions with more than 5 numbers, you must create an account or login to continue.'
              : 'For bulk transactions with more than 5 numbers, we recommend creating an account to:'
            }
          </DialogDescription>
        </DialogHeader>
        
        <ul className="text-sm text-muted-foreground space-y-2 my-4">
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            Track all your transactions in one place
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            Get a unique ID for each number
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            Earn referral rewards
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">✓</span>
            Faster checkout next time
          </li>
        </ul>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleGoogleLogin} 
            variant="primary" 
            className="w-full flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>
          {!required && onContinueAsGuest && (
            <Button onClick={onContinueAsGuest} variant="ghost" className="w-full text-muted-foreground">
              Continue as Guest
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LoginPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLogin: () => void;
  onContinueAsGuest?: () => void;
  required?: boolean; // For bulk transactions >5 numbers
}

export function LoginPrompt({ open, onOpenChange, onLogin, onContinueAsGuest, required = false }: LoginPromptProps) {
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
          <Button onClick={onLogin} variant="primary" className="w-full">
            Create Account / Login
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

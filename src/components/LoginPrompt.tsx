import { X } from 'lucide-react';
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
  onContinueAsGuest: () => void;
}

export function LoginPrompt({ open, onOpenChange, onLogin, onContinueAsGuest }: LoginPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create an Account</DialogTitle>
          <DialogDescription>
            For bulk transactions with more than 5 numbers, we recommend creating an account to:
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
          <Button onClick={onContinueAsGuest} variant="ghost" className="w-full text-muted-foreground">
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

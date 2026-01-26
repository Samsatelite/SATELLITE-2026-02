import { Loader2 } from 'lucide-react';

interface ProcessingStateProps {
  message?: string;
}

export function ProcessingState({ message = "Sending data..." }: ProcessingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-scale-in">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 rounded-full border-4 border-muted" />
        
        {/* Spinning indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
      </div>

      <p className="mt-6 text-lg font-semibold tracking-tight">{message}</p>
      <p className="mt-2 text-sm text-muted-foreground">Please wait, this won't take long</p>
    </div>
  );
}

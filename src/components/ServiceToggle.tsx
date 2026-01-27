import { cn } from '@/lib/utils';

export type ServiceType = 'data' | 'airtime';

interface ServiceToggleProps {
  value: ServiceType;
  onChange: (value: ServiceType) => void;
}

export function ServiceToggle({ value, onChange }: ServiceToggleProps) {
  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-muted rounded-full">
      <button
        onClick={() => onChange('data')}
        className={cn(
          "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200",
          value === 'data'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Data
      </button>
      <button
        onClick={() => onChange('airtime')}
        className={cn(
          "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-200",
          value === 'airtime'
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        Airtime
      </button>
    </div>
  );
}

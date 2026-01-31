import { cn } from '@/lib/utils';

export type ServiceType = 'data' | 'airtime';

interface ServiceToggleProps {
  value: ServiceType;
  onChange: (value: ServiceType) => void;
}

export function ServiceToggle({ value, onChange }: ServiceToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center gap-1 p-1 bg-muted rounded-full">
        <button
          onClick={() => onChange('data')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap",
            value === 'data'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Data Topup
        </button>
        <button
          onClick={() => onChange('airtime')}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap",
            value === 'airtime'
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Airtime Recharge
        </button>
      </div>
    </div>
  );
}

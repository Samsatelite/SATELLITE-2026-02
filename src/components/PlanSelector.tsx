import { DataPlan, formatPrice, getPlansByNetwork } from '@/lib/plans';
import { NetworkType } from '@/lib/networks';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

interface PlanSelectorProps {
  network: Exclude<NetworkType, null>;
  selectedPlan: DataPlan | null;
  onSelectPlan: (plan: DataPlan) => void;
}

export function PlanSelector({ network, selectedPlan, onSelectPlan }: PlanSelectorProps) {
  const plans = getPlansByNetwork(network);

  return (
    <div className="animate-slide-up">
      <div className="grid grid-cols-3 gap-2">
        {plans.map((plan, index) => (
          <button
            key={plan.id}
            onClick={() => onSelectPlan(plan)}
            className={cn(
              "plan-card relative p-3 rounded-lg border text-left press-effect",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              selectedPlan?.id === plan.id
                ? "selected border-primary"
                : "border-border bg-card hover:border-muted-foreground/30"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" />
                HOT
              </div>
            )}

            {/* Size */}
            <div className="text-lg font-bold tracking-tight">{plan.size}</div>
            
            {/* Price */}
            <div className="text-sm font-semibold text-muted-foreground">
              {formatPrice(plan.price)}
            </div>
            
            {/* Validity */}
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              {plan.validity}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

import { DataPlan, AirtimePlan, formatPrice, getPlansByNetwork, getAirtimeByNetwork } from '@/lib/plans';
import { NetworkType } from '@/lib/networks';
import { cn } from '@/lib/utils';
import { Zap, TrendingUp } from 'lucide-react';
import { ServiceType } from './ServiceToggle';
import { NetworkHealthStatus } from './NetworkHealthStatus';
import { ReferralSection } from './ReferralSection';
import { formatPhoneNumber } from '@/lib/networks';

interface PlanSelectorProps {
  network: Exclude<NetworkType, null>;
  serviceType: ServiceType;
  selectedPlan: DataPlan | AirtimePlan | null;
  onSelectPlan: (plan: DataPlan | AirtimePlan) => void;
  onBackToInput: () => void;
  phoneNumbers: string[];
  isMultiMode: boolean;
  onClaimRewards: () => void;
}

export function PlanSelector({ 
  network, 
  serviceType, 
  selectedPlan, 
  onSelectPlan,
  onBackToInput,
  phoneNumbers,
  isMultiMode,
  onClaimRewards
}: PlanSelectorProps) {
  const dataPlans = getPlansByNetwork(network);
  const airtimePlans = getAirtimeByNetwork(network);

  // Sort plans: popular first, then by usage count (simulated), then by price
  const sortedDataPlans = [...dataPlans].sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.price - b.price;
  });

  const sortedAirtimePlans = [...airtimePlans].sort((a, b) => {
    if (a.popular && !b.popular) return -1;
    if (!a.popular && b.popular) return 1;
    return a.amount - b.amount;
  });

  const handleNetworkHealthProceed = () => {
    // Continue with transaction
  };

  const handleNetworkHealthCancel = () => {
    onBackToInput();
  };

  if (serviceType === 'airtime') {
    return (
      <div className="animate-slide-up space-y-4">
        {/* Network health status */}
        <div className="flex justify-center">
          <NetworkHealthStatus 
            network={network} 
            onProceed={handleNetworkHealthProceed}
            onCancel={handleNetworkHealthCancel}
          />
        </div>

        {/* Phone numbers display for bulk */}
        {isMultiMode && phoneNumbers.length > 1 && (
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div className="flex items-center gap-1 whitespace-nowrap min-w-min">
              <span className="text-xs text-muted-foreground">Numbers:</span>
              <span className="text-xs font-mono">
                {phoneNumbers.map(p => formatPhoneNumber(p)).join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Most used label */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Most used offers first</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {sortedAirtimePlans.map((plan, index) => (
            <button
              key={plan.id}
              onClick={() => onSelectPlan(plan)}
              className={cn(
                "plan-card relative p-4 rounded-lg border text-center press-effect",
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

              {/* Amount */}
              <div className="text-lg font-bold tracking-tight">
                {formatPrice(plan.amount)}
              </div>
            </button>
          ))}
        </div>

        {/* Referral section */}
        <ReferralSection onClaimRewards={onClaimRewards} />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-4">
      {/* Network health status */}
      <div className="flex justify-center">
        <NetworkHealthStatus 
          network={network} 
          onProceed={handleNetworkHealthProceed}
          onCancel={handleNetworkHealthCancel}
        />
      </div>

      {/* Phone numbers display for bulk */}
      {isMultiMode && phoneNumbers.length > 1 && (
        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex items-center gap-1 whitespace-nowrap min-w-min">
            <span className="text-xs text-muted-foreground">Numbers:</span>
            <span className="text-xs font-mono">
              {phoneNumbers.map(p => formatPhoneNumber(p)).join(', ')}
            </span>
          </div>
        </div>
      )}

      {/* Most used label */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <TrendingUp className="w-3.5 h-3.5" />
        <span>Most used offers first</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {sortedDataPlans.map((plan, index) => (
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

      {/* Referral section */}
      <ReferralSection onClaimRewards={onClaimRewards} />
    </div>
  );
}

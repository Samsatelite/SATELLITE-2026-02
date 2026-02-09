import { DataPlan, AirtimePlan, formatPrice } from '@/lib/plans';
import { NetworkType } from '@/lib/networks';
import { cn } from '@/lib/utils';
import { Zap, TrendingUp, Flame, Loader2 } from 'lucide-react';
import { ServiceType } from './ServiceToggle';
import { NetworkHealthStatus } from './NetworkHealthStatus';
import { ReferralSection } from './ReferralSection';
import { formatPhoneNumber } from '@/lib/networks';
import { useAllDataPlansForNetwork } from '@/hooks/use-peyflex';
import { getAirtimeByNetwork } from '@/lib/plans';

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
  // Fetch live data plans from PayFlex
  const { plans: livePlans, isLoading: plansLoading, isError } = useAllDataPlansForNetwork(network);

  // Convert PayFlex plans to our DataPlan format
  const dataPlans: DataPlan[] = livePlans.map((p, i) => ({
    id: p.plan_code,
    network,
    size: p.size || p.name,
    sizeValue: parseSizeToMB(p.size || p.name),
    price: p.amount,
    validity: p.validity,
    type: p.category as DataPlan['type'],
    popular: i === 0, // Mark first plan as popular
    planCode: p.plan_code,
    peyflexNetwork: p.peyflex_network,
  }));

  // Keep airtime as static options (PayFlex airtime is custom amount)
  const airtimePlans = getAirtimeByNetwork(network);

  const popularDataPlans = dataPlans.filter(p => p.popular);
  const otherDataPlans = dataPlans.filter(p => !p.popular).sort((a, b) => a.price - b.price);
  
  const popularAirtimePlans = airtimePlans.filter(p => p.popular);
  const otherAirtimePlans = airtimePlans.filter(p => !p.popular).sort((a, b) => a.amount - b.amount);

  const handleNetworkHealthProceed = () => {};
  const handleNetworkHealthCancel = () => onBackToInput();

  const renderPlanCard = (plan: DataPlan | AirtimePlan, index: number) => {
    const isDataPlan = 'size' in plan;
    return (
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
        {plan.popular && (
          <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5" />
            HOT
          </div>
        )}

        {isDataPlan ? (
          <>
            <div className="text-lg font-bold tracking-tight">{(plan as DataPlan).size}</div>
            <div className="text-sm font-semibold text-muted-foreground">
              {formatPrice((plan as DataPlan).price)}
            </div>
            <div className="text-[10px] text-muted-foreground/70 mt-1">
              {(plan as DataPlan).validity}
            </div>
          </>
        ) : (
          <div className="text-lg font-bold tracking-tight text-center">
            {formatPrice((plan as AirtimePlan).amount)}
          </div>
        )}
      </button>
    );
  };

  const renderBulkNumbers = () => {
    if (!isMultiMode || phoneNumbers.length <= 1) return null;
    return (
      <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        <div className="flex items-center gap-1 whitespace-nowrap min-w-min">
          <span className="text-xs text-muted-foreground shrink-0">Numbers:</span>
          <span className="text-xs font-mono">
            {phoneNumbers.map(p => formatPhoneNumber(p)).join(', ')}
          </span>
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading plans from PayFlex...</p>
    </div>
  );

  if (serviceType === 'airtime') {
    return (
      <div className="animate-slide-up space-y-4">
        <div className="flex justify-center">
          <NetworkHealthStatus network={network} onProceed={handleNetworkHealthProceed} onCancel={handleNetworkHealthCancel} />
        </div>
        {renderBulkNumbers()}
        {popularAirtimePlans.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-primary">
              <Flame className="w-3.5 h-3.5" />
              <span>Most picked offers</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {popularAirtimePlans.map((plan, index) => renderPlanCard(plan, index))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>All offers</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {otherAirtimePlans.map((plan, index) => renderPlanCard(plan, index))}
          </div>
        </div>
        <ReferralSection onClaimRewards={onClaimRewards} />
      </div>
    );
  }

  return (
    <div className="animate-slide-up space-y-4">
      <div className="flex justify-center">
        <NetworkHealthStatus network={network} onProceed={handleNetworkHealthProceed} onCancel={handleNetworkHealthCancel} />
      </div>
      {renderBulkNumbers()}

      {plansLoading ? renderLoading() : isError ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Failed to load plans. Please try again.
        </div>
      ) : dataPlans.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No data plans available for this network.
        </div>
      ) : (
        <>
          {popularDataPlans.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <Flame className="w-3.5 h-3.5" />
                <span>Most picked offers</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {popularDataPlans.map((plan, index) => renderPlanCard(plan, index))}
              </div>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>All offers</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {otherDataPlans.map((plan, index) => renderPlanCard(plan, index))}
            </div>
          </div>
        </>
      )}

      <ReferralSection onClaimRewards={onClaimRewards} />
    </div>
  );
}

function parseSizeToMB(size: string): number {
  const match = size.match(/([\d.]+)\s*(GB|MB|TB)/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();
  if (unit === 'GB') return value * 1024;
  if (unit === 'TB') return value * 1024 * 1024;
  return value;
}

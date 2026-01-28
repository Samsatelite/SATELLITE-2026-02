import { useState, useEffect } from 'react';
import { NetworkType, networks } from '@/lib/networks';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type HealthStatus = 'healthy' | 'degraded' | 'critical';

interface NetworkHealthStatusProps {
  network: Exclude<NetworkType, null>;
  onProceed: () => void;
  onCancel: () => void;
}

// Mock health status - in production this would come from the database
const getNetworkHealth = (network: Exclude<NetworkType, null>): HealthStatus => {
  // Simulate real-time status - in production fetch from Supabase
  const statuses: Record<string, HealthStatus> = {
    mtn: 'healthy',
    airtel: 'healthy',
    glo: 'healthy',
    '9mobile': 'healthy',
  };
  return statuses[network] || 'healthy';
};

export function NetworkHealthStatus({ network, onProceed, onCancel }: NetworkHealthStatusProps) {
  const [health, setHealth] = useState<HealthStatus>('healthy');
  const [showCriticalDialog, setShowCriticalDialog] = useState(false);

  useEffect(() => {
    // Check network health
    const status = getNetworkHealth(network);
    setHealth(status);
    
    if (status === 'critical') {
      setShowCriticalDialog(true);
    }
  }, [network]);

  const networkInfo = networks[network];

  const statusConfig = {
    healthy: {
      icon: CheckCircle,
      text: 'Service Running',
      className: 'text-success bg-success/10',
    },
    degraded: {
      icon: AlertTriangle,
      text: 'Slow Service',
      className: 'text-yellow-600 bg-yellow-100',
    },
    critical: {
      icon: AlertCircle,
      text: 'Service Issues',
      className: 'text-destructive bg-destructive/10',
    },
  };

  const config = statusConfig[health];
  const Icon = config.icon;

  return (
    <>
      <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium",
        config.className
      )}>
        <Icon className="w-3.5 h-3.5" />
        <span>{networkInfo.name}: {config.text}</span>
      </div>

      <AlertDialog open={showCriticalDialog} onOpenChange={setShowCriticalDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              Network Service Issues
            </AlertDialogTitle>
            <AlertDialogDescription>
              {networkInfo.name} is currently experiencing service issues. Your transaction may be delayed or fail. Do you want to proceed anyway?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowCriticalDialog(false);
              onProceed();
            }}>
              Proceed Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

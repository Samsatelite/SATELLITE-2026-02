import { useState, useEffect } from 'react';
import { NetworkType, networks } from '@/lib/networks';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
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

export function NetworkHealthStatus({ network, onProceed, onCancel }: NetworkHealthStatusProps) {
  const [health, setHealth] = useState<HealthStatus>('healthy');
  const [showCriticalDialog, setShowCriticalDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNetworkHealth = async () => {
      try {
        // Fetch from Supabase
        const { data, error } = await supabase
          .from('networks')
          .select('health_status, is_active')
          .eq('id', network)
          .maybeSingle();

        if (error) {
          console.error('Error fetching network health:', error);
          setHealth('healthy'); // Default to healthy on error
        } else if (data) {
          const status = (data.health_status as HealthStatus) || 'healthy';
          setHealth(status);
          
          if (status === 'critical') {
            setShowCriticalDialog(true);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setHealth('healthy');
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkHealth();

    // Also set up real-time subscription for health updates
    const channel = supabase
      .channel('network-health')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'networks', filter: `id=eq.${network}` },
        (payload) => {
          const newStatus = (payload.new.health_status as HealthStatus) || 'healthy';
          setHealth(newStatus);
          if (newStatus === 'critical') {
            setShowCriticalDialog(true);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-muted animate-pulse">
        <span>Checking status...</span>
      </div>
    );
  }

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

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface NetworkData {
  id: string;
  name: string;
  color: string;
  is_active: boolean;
  health_status: 'healthy' | 'degraded' | 'critical';
}

export function AdminNetworks() {
  const [networks, setNetworks] = useState<NetworkData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('networks')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching networks:', error);
        // Fallback to defaults
        const fallbackNetworks: NetworkData[] = [
          { id: 'mtn', name: 'MTN', color: '#FFCC00', is_active: true, health_status: 'healthy' },
          { id: 'airtel', name: 'Airtel', color: '#FF0000', is_active: true, health_status: 'healthy' },
          { id: 'glo', name: 'Glo', color: '#00A651', is_active: true, health_status: 'healthy' },
          { id: '9mobile', name: '9mobile', color: '#006B3F', is_active: true, health_status: 'healthy' },
        ];
        setNetworks(fallbackNetworks);
      } else if (data && data.length > 0) {
        setNetworks(data.map(n => ({
          ...n,
          health_status: (n.health_status as 'healthy' | 'degraded' | 'critical') || 'healthy',
          is_active: n.is_active ?? true,
        })));
      } else {
        // Seed default networks if empty
        const defaults: NetworkData[] = [
          { id: 'mtn', name: 'MTN', color: '#FFCC00', is_active: true, health_status: 'healthy' },
          { id: 'airtel', name: 'Airtel', color: '#FF0000', is_active: true, health_status: 'healthy' },
          { id: 'glo', name: 'Glo', color: '#00A651', is_active: true, health_status: 'healthy' },
          { id: '9mobile', name: '9mobile', color: '#006B3F', is_active: true, health_status: 'healthy' },
        ];
        setNetworks(defaults);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleNetwork = (id: string) => {
    setNetworks(prev => prev.map(n => 
      n.id === id ? { ...n, is_active: !n.is_active } : n
    ));
    setHasChanges(true);
  };

  const setHealthStatus = (id: string, status: NetworkData['health_status']) => {
    setNetworks(prev => prev.map(n => 
      n.id === id ? { ...n, health_status: status } : n
    ));
    setHasChanges(true);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      // Update each network in Supabase
      for (const network of networks) {
        const { error } = await supabase
          .from('networks')
          .upsert({
            id: network.id,
            name: network.name,
            color: network.color,
            is_active: network.is_active,
            health_status: network.health_status,
          }, { onConflict: 'id' });

        if (error) {
          console.error('Error updating network:', error);
        }
      }

      toast({
        title: 'Changes saved',
        description: 'Network settings have been updated',
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving:', err);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getHealthIcon = (status: NetworkData['health_status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading networks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Networks</h1>
          <p className="text-muted-foreground">Control network availability and status</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={fetchNetworks} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
            Refresh
          </Button>
          {hasChanges && (
            <Button onClick={saveChanges} variant="primary" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </div>
      </div>

      {/* Networks List */}
      <div className="grid gap-4">
        {networks.map((network) => (
          <div 
            key={network.id}
            className={cn(
              "bg-card border border-border rounded-lg p-4 transition-opacity",
              !network.is_active && "opacity-60"
            )}
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Network Icon */}
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: network.color }}
                >
                  {network.name.charAt(0)}
                </div>

                {/* Network Info */}
                <div>
                  <h3 className="font-semibold">{network.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getHealthIcon(network.health_status)}
                    <span className="text-sm text-muted-foreground capitalize">
                      {network.health_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Health Status Selector */}
                <select
                  value={network.health_status}
                  onChange={(e) => setHealthStatus(network.id, e.target.value as NetworkData['health_status'])}
                  className="px-3 py-1.5 bg-muted border border-border rounded text-sm"
                >
                  <option value="healthy">Healthy</option>
                  <option value="degraded">Degraded</option>
                  <option value="critical">Critical</option>
                </select>

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <Switch
                    checked={network.is_active}
                    onCheckedChange={() => toggleNetwork(network.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Status Guide</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-success" />
            <strong>Healthy:</strong> Service is running normally
          </li>
          <li className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <strong>Degraded:</strong> Service may be slow
          </li>
          <li className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <strong>Critical:</strong> Users will see a warning before purchase
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-3">
          Network health is automatically monitored based on transaction success rates. 
          Manual override is always available here.
        </p>
      </div>
    </div>
  );
}

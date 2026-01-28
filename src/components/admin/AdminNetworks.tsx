import { useState, useEffect } from 'react';
import { Network, CheckCircle, AlertTriangle, AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface NetworkData {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
  healthStatus: 'healthy' | 'degraded' | 'critical';
}

export function AdminNetworks() {
  const [networks, setNetworks] = useState<NetworkData[]>([
    { id: 'mtn', name: 'MTN', color: '#FFCC00', isActive: true, healthStatus: 'healthy' },
    { id: 'airtel', name: 'Airtel', color: '#FF0000', isActive: true, healthStatus: 'healthy' },
    { id: 'glo', name: 'Glo', color: '#00A651', isActive: true, healthStatus: 'healthy' },
    { id: '9mobile', name: '9mobile', color: '#006B3F', isActive: true, healthStatus: 'healthy' },
  ]);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleNetwork = (id: string) => {
    setNetworks(prev => prev.map(n => 
      n.id === id ? { ...n, isActive: !n.isActive } : n
    ));
    setHasChanges(true);
  };

  const setHealthStatus = (id: string, status: NetworkData['healthStatus']) => {
    setNetworks(prev => prev.map(n => 
      n.id === id ? { ...n, healthStatus: status } : n
    ));
    setHasChanges(true);
  };

  const saveChanges = () => {
    // In production, save to Supabase
    localStorage.setItem('datadome_admin_networks', JSON.stringify(networks));
    toast({
      title: 'Changes saved',
      description: 'Network settings have been updated',
    });
    setHasChanges(false);
  };

  const getHealthIcon = (status: NetworkData['healthStatus']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Networks</h1>
          <p className="text-muted-foreground">Control network availability and status</p>
        </div>
        {hasChanges && (
          <Button onClick={saveChanges} variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Networks List */}
      <div className="grid gap-4">
        {networks.map((network) => (
          <div 
            key={network.id}
            className={cn(
              "bg-card border border-border rounded-lg p-4 transition-opacity",
              !network.isActive && "opacity-60"
            )}
          >
            <div className="flex items-center justify-between">
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
                    {getHealthIcon(network.healthStatus)}
                    <span className="text-sm text-muted-foreground capitalize">
                      {network.healthStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4">
                {/* Health Status Selector */}
                <select
                  value={network.healthStatus}
                  onChange={(e) => setHealthStatus(network.id, e.target.value as NetworkData['healthStatus'])}
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
                    checked={network.isActive}
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
      </div>
    </div>
  );
}

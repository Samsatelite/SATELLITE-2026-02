import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { formatPrice } from '@/lib/plans';
import { cn } from '@/lib/utils';

interface Offer {
  id: string;
  networkId: string;
  type: 'data' | 'airtime';
  size?: string;
  sizeValue?: number;
  amount: number;
  validity?: string;
  isActive: boolean;
  isPopular: boolean;
}

const networkNames: Record<string, string> = {
  mtn: 'MTN',
  airtel: 'Airtel',
  glo: 'Glo',
  '9mobile': '9mobile',
};

export function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load initial offers (mock data - in production from Supabase)
    const initialOffers: Offer[] = [
      // MTN Data
      { id: '1', networkId: 'mtn', type: 'data', size: '500MB', sizeValue: 500, amount: 140, validity: '30 days', isActive: true, isPopular: false },
      { id: '2', networkId: 'mtn', type: 'data', size: '1GB', sizeValue: 1024, amount: 260, validity: '30 days', isActive: true, isPopular: true },
      { id: '3', networkId: 'mtn', type: 'data', size: '2GB', sizeValue: 2048, amount: 520, validity: '30 days', isActive: true, isPopular: false },
      { id: '4', networkId: 'mtn', type: 'data', size: '5GB', sizeValue: 5120, amount: 1300, validity: '30 days', isActive: true, isPopular: false },
      // MTN Airtime
      { id: '5', networkId: 'mtn', type: 'airtime', amount: 100, isActive: true, isPopular: true },
      { id: '6', networkId: 'mtn', type: 'airtime', amount: 200, isActive: true, isPopular: false },
      { id: '7', networkId: 'mtn', type: 'airtime', amount: 500, isActive: true, isPopular: false },
      // Airtel Data
      { id: '8', networkId: 'airtel', type: 'data', size: '1GB', sizeValue: 1024, amount: 260, validity: '30 days', isActive: true, isPopular: true },
      { id: '9', networkId: 'airtel', type: 'data', size: '2GB', sizeValue: 2048, amount: 520, validity: '30 days', isActive: true, isPopular: false },
    ];
    setOffers(initialOffers);
  }, []);

  const toggleOfferActive = (id: string) => {
    setOffers(prev => prev.map(o => 
      o.id === id ? { ...o, isActive: !o.isActive } : o
    ));
    setHasChanges(true);
  };

  const toggleOfferPopular = (id: string) => {
    setOffers(prev => prev.map(o => 
      o.id === id ? { ...o, isPopular: !o.isPopular } : o
    ));
    setHasChanges(true);
  };

  const updateOfferAmount = (id: string, amount: number) => {
    setOffers(prev => prev.map(o => 
      o.id === id ? { ...o, amount } : o
    ));
    setHasChanges(true);
  };

  const deleteOffer = (id: string) => {
    setOffers(prev => prev.filter(o => o.id !== id));
    setHasChanges(true);
    toast({
      title: 'Offer deleted',
      description: 'The offer has been removed',
    });
  };

  const saveChanges = () => {
    // In production, save to Supabase
    localStorage.setItem('datadome_admin_offers', JSON.stringify(offers));
    toast({
      title: 'Changes saved',
      description: 'Offer settings have been updated',
    });
    setHasChanges(false);
  };

  const filteredOffers = offers.filter(o => {
    const matchesNetwork = selectedNetwork === 'all' || o.networkId === selectedNetwork;
    const matchesType = selectedType === 'all' || o.type === selectedType;
    return matchesNetwork && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Offers</h1>
          <p className="text-muted-foreground">Manage data and airtime offers</p>
        </div>
        {hasChanges && (
          <Button onClick={saveChanges} variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">Network:</span>
          {['all', 'mtn', 'airtel', 'glo', '9mobile'].map((network) => (
            <button
              key={network}
              onClick={() => setSelectedNetwork(network)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedNetwork === network
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {network === 'all' ? 'All' : networkNames[network]}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground self-center">Type:</span>
          {['all', 'data', 'airtime'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedType === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Offers Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Network</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Plan</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Price</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Popular</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Active</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOffers.map((offer) => (
                <tr key={offer.id} className={cn(
                  "hover:bg-muted/30 transition-colors",
                  !offer.isActive && "opacity-60"
                )}>
                  <td className="p-4">
                    <span className="font-medium">{networkNames[offer.networkId]}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm capitalize">{offer.type}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm font-medium">
                      {offer.type === 'data' ? offer.size : formatPrice(offer.amount)}
                    </span>
                    {offer.validity && (
                      <span className="text-xs text-muted-foreground ml-2">
                        ({offer.validity})
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <Input
                      type="number"
                      value={offer.amount}
                      onChange={(e) => updateOfferAmount(offer.id, parseInt(e.target.value) || 0)}
                      className="w-24 h-8 text-sm"
                    />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleOfferPopular(offer.id)}
                      className={cn(
                        "p-1.5 rounded transition-colors",
                        offer.isPopular ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                  </td>
                  <td className="p-4">
                    <Switch
                      checked={offer.isActive}
                      onCheckedChange={() => toggleOfferActive(offer.id)}
                    />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOffers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No offers match your filters
        </div>
      )}
    </div>
  );
}

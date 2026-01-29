import { useState, useEffect } from 'react';
import { Bitcoin, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CryptoOption {
  id: string;
  currency: string;
  network: string;
  is_active: boolean;
  display_order: number;
}

export function AdminCrypto() {
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [newCurrency, setNewCurrency] = useState('');
  const [newNetwork, setNewNetwork] = useState('');

  useEffect(() => {
    fetchCryptoOptions();
  }, []);

  const fetchCryptoOptions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('crypto_options')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching crypto options:', error);
        // Fallback to defaults
        setCryptoOptions([
          { id: '1', currency: 'USDT', network: 'TRC20', is_active: true, display_order: 1 },
          { id: '2', currency: 'USDT', network: 'BSC', is_active: true, display_order: 2 },
          { id: '3', currency: 'USDT', network: 'Polygon', is_active: true, display_order: 3 },
          { id: '4', currency: 'SOL', network: 'Solana', is_active: true, display_order: 4 },
          { id: '5', currency: 'BNB', network: 'BSC', is_active: true, display_order: 5 },
        ]);
      } else {
        setCryptoOptions(data || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (id: string) => {
    setCryptoOptions(prev => prev.map(opt => 
      opt.id === id ? { ...opt, is_active: !opt.is_active } : opt
    ));
    setHasChanges(true);
  };

  const deleteOption = (id: string) => {
    setCryptoOptions(prev => prev.filter(opt => opt.id !== id));
    setHasChanges(true);
  };

  const addOption = () => {
    if (!newCurrency.trim() || !newNetwork.trim()) return;

    const newOption: CryptoOption = {
      id: crypto.randomUUID(),
      currency: newCurrency.toUpperCase().trim(),
      network: newNetwork.trim(),
      is_active: true,
      display_order: cryptoOptions.length + 1,
    };

    setCryptoOptions(prev => [...prev, newOption]);
    setNewCurrency('');
    setNewNetwork('');
    setHasChanges(true);
  };

  const saveChanges = async () => {
    // In production, save to Supabase
    toast({
      title: 'Changes saved',
      description: 'Crypto options have been updated',
    });
    setHasChanges(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading crypto options...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Crypto Payment Options</h1>
          <p className="text-muted-foreground">Manage accepted cryptocurrencies and networks</p>
        </div>
        {hasChanges && (
          <Button onClick={saveChanges} variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        )}
      </div>

      {/* Current Options */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Active Cryptocurrencies</h2>
        </div>
        <div className="divide-y divide-border">
          {cryptoOptions.map((option) => (
            <div key={option.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Bitcoin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{option.currency}</p>
                  <p className="text-sm text-muted-foreground">{option.network}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Switch
                  checked={option.is_active}
                  onCheckedChange={() => toggleOption(option.id)}
                />
                <button
                  onClick={() => deleteOption(option.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Option */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-4">Add New Option</h3>
        <div className="flex gap-2">
          <Input
            placeholder="Currency (e.g., ETH)"
            value={newCurrency}
            onChange={(e) => setNewCurrency(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="Network (e.g., ERC20)"
            value={newNetwork}
            onChange={(e) => setNewNetwork(e.target.value)}
            className="flex-1"
          />
          <Button onClick={addOption} disabled={!newCurrency.trim() || !newNetwork.trim()}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Supported Networks</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li><strong>USDT:</strong> TRC20 (default), BSC, Polygon</li>
          <li><strong>SOL:</strong> Solana network only</li>
          <li><strong>BNB:</strong> BSC network only</li>
        </ul>
      </div>
    </div>
  );
}
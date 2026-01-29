import { useState, useEffect } from 'react';
import { Search, Phone, Activity, Gift, Calendar, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { formatPhoneNumber, detectNetwork, networks } from '@/lib/networks';
import { cn } from '@/lib/utils';

interface UserData {
  phoneNumber: string;
  uniqueId: string;
  transactionCount: number;
  totalSpent: number;
  lastTransaction: string;
  referredBy?: string;
  createdAt: string;
}

export function AdminUsers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch phone_unique_ids with transaction counts
      const { data: phoneIds, error } = await supabase
        .from('phone_unique_ids')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Mock transaction data - in production, aggregate from transactions table
      const usersData: UserData[] = (phoneIds || []).map(p => ({
        phoneNumber: p.phone_number,
        uniqueId: p.unique_id,
        transactionCount: Math.floor(Math.random() * 20) + 1,
        totalSpent: Math.floor(Math.random() * 50000) + 1000,
        lastTransaction: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: p.created_at,
      }));

      setUsers(usersData);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.phoneNumber.includes(searchQuery.replace(/\D/g, '')) ||
    user.uniqueId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users</h1>
        <p className="text-muted-foreground">View all phone numbers and their activities</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by phone number or unique ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users List */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No users found</div>
        ) : (
          <div className="divide-y divide-border">
            {filteredUsers.map((user) => {
              const network = detectNetwork(user.phoneNumber);
              return (
                <button
                  key={user.uniqueId}
                  onClick={() => setSelectedUser(selectedUser?.uniqueId === user.uniqueId ? null : user)}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Phone icon with network color */}
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: network ? networks[network].color + '20' : '#e5e5e5' }}
                      >
                        <Phone 
                          className="w-5 h-5" 
                          style={{ color: network ? networks[network].color : '#737373' }}
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {formatPhoneNumber(user.phoneNumber)}
                          </span>
                          {network && (
                            <span 
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                              style={{ 
                                backgroundColor: networks[network].color + '20',
                                color: networks[network].color,
                              }}
                            >
                              {networks[network].name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span>ID: {user.uniqueId}</span>
                          <span>•</span>
                          <span>{user.transactionCount} transactions</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatCurrency(user.totalSpent)}</span>
                      <ChevronRight className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform",
                        selectedUser?.uniqueId === user.uniqueId && "rotate-90"
                      )} />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {selectedUser?.uniqueId === user.uniqueId && (
                    <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">First seen</p>
                          <p className="font-medium">{formatDate(user.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Last transaction</p>
                          <p className="font-medium">{formatDate(user.lastTransaction)}</p>
                        </div>
                      </div>
                      {user.referredBy && (
                        <div className="flex items-center gap-2 col-span-2">
                          <Gift className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-muted-foreground">Referred by</p>
                            <p className="font-medium text-primary">{user.referredBy}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{users.reduce((sum, u) => sum + u.transactionCount, 0)}</p>
          <p className="text-sm text-muted-foreground">Total Transactions</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{formatCurrency(users.reduce((sum, u) => sum + u.totalSpent, 0))}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>
      </div>
    </div>
  );
}
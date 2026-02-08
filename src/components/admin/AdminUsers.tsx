import { useState, useEffect } from 'react';
import { Search, Phone, Activity, Gift, Calendar, ChevronRight, Mail, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface UserData {
  email: string;
  displayName: string;
  uniqueId: string;
  transactionCount: number;
  totalSpent: number;
  lastTransaction: string;
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
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      // Map profiles to user data
      const usersData: UserData[] = (profiles || []).map(p => ({
        email: p.email || 'No email',
        displayName: p.display_name || 'Unknown',
        uniqueId: p.unique_id || 'N/A',
        transactionCount: 0,
        totalSpent: 0,
        lastTransaction: p.updated_at,
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
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        <p className="text-muted-foreground">All registered users and their activity</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by email, name, or unique ID..."
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
            {filteredUsers.map((user) => (
              <button
                key={user.uniqueId}
                onClick={() => setSelectedUser(selectedUser?.uniqueId === user.uniqueId ? null : user)}
                className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.displayName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        <span>•</span>
                        <span>ID: {user.uniqueId}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
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
                        <p className="text-muted-foreground">Joined</p>
                        <p className="font-medium">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Transactions</p>
                        <p className="font-medium">{user.transactionCount}</p>
                      </div>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{users.length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <p className="text-2xl font-bold">{formatCurrency(users.reduce((sum, u) => sum + u.totalSpent, 0))}</p>
          <p className="text-sm text-muted-foreground">Total Revenue</p>
        </div>
      </div>
    </div>
  );
}

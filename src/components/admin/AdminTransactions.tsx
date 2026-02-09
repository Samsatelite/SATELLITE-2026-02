import { useState, useEffect } from 'react';
import { Search, Filter, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/plans';
import { getRecentTransactions, Transaction } from '@/lib/transactions';

interface AdminTransactionsProps {
  searchQuery: string;
}

export function AdminTransactions({ searchQuery }: AdminTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Load from localStorage for demo (in production from Supabase)
    const stored = getRecentTransactions();
    setTransactions(stored);
  }, []);

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchQuery 
      ? t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.phoneNumber.includes(searchQuery)
      : true;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <RefreshCw className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/10 text-success';
      case 'failed':
        return 'bg-destructive/10 text-destructive';
      case 'pending':
      case 'processing':
        return 'bg-yellow-500/10 text-yellow-600';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">View and manage all transactions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'success', 'pending', 'processing', 'failed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === status
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Reference</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Phone</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Network</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Amount</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Payment</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 text-xs font-medium text-muted-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-sm">{tx.reference}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono text-sm">{tx.phoneNumber}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium uppercase">{tx.network}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-semibold">{formatPrice(tx.amount)}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm capitalize">{tx.paymentMethod?.replace('_', ' ') || 'N/A'}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                        {getStatusIcon(tx.status)}
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-muted-foreground">
                        {tx.createdAt.toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    {searchQuery ? 'No transactions match your search' : 'No transactions yet'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

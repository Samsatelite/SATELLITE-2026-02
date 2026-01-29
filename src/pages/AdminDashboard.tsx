import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Network, 
  Gift, 
  Search,
  ArrowLeft,
  Menu,
  X,
  Users,
  Bitcoin,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AdminTransactions } from '@/components/admin/AdminTransactions';
import { AdminNetworks } from '@/components/admin/AdminNetworks';
import { AdminOffers } from '@/components/admin/AdminOffers';
import { AdminOverview } from '@/components/admin/AdminOverview';
import { AdminUsers } from '@/components/admin/AdminUsers';
import { AdminReferrals } from '@/components/admin/AdminReferrals';
import { AdminCrypto } from '@/components/admin/AdminCrypto';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { path: '/admin/transactions', icon: History, label: 'Transactions' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/referrals', icon: Gift, label: 'Referrals' },
  { path: '/admin/networks', icon: Network, label: 'Networks' },
  { path: '/admin/offers', icon: Gift, label: 'Offers' },
  { path: '/admin/crypto', icon: Bitcoin, label: 'Crypto' },
];

// Admin login component
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // In production, validate against Supabase auth with admin role check
    // For now, use a simple password (this should be replaced with proper RBAC)
    const adminPassword = 'datadome-admin-2024'; // This would be stored securely
    
    if (password === adminPassword) {
      localStorage.setItem('datadome_admin_auth', 'true');
      onLogin();
    } else {
      setError('Invalid password');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your admin password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-center"
            autoFocus
          />
          
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full"
            disabled={loading || !password}
          >
            {loading ? 'Verifying...' : 'Access Dashboard'}
          </Button>
        </form>

        <Link 
          to="/"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to app
        </Link>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if already authenticated
    const authStatus = localStorage.getItem('datadome_admin_auth');
    setIsAuthenticated(authStatus === 'true');
    setCheckingAuth(false);

    // In production, also check Supabase session and admin role
    const checkAdminRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Check if user has admin role
        const { data } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (data) {
          setIsAuthenticated(true);
          localStorage.setItem('datadome_admin_auth', 'true');
        }
      }
    };
    checkAdminRole();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('datadome_admin_auth');
    setIsAuthenticated(false);
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tighter">
              datadome<span className="text-primary">.</span>
              <span className="text-xs text-muted-foreground ml-2">admin</span>
            </Link>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Back to App & Logout */}
          <div className="p-4 border-t border-border space-y-2">
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
            >
              <Lock className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-background border-b border-border p-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Search */}
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by reference ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Routes>
            <Route index element={<AdminOverview />} />
            <Route path="transactions" element={<AdminTransactions searchQuery={searchQuery} />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="referrals" element={<AdminReferrals />} />
            <Route path="networks" element={<AdminNetworks />} />
            <Route path="offers" element={<AdminOffers />} />
            <Route path="crypto" element={<AdminCrypto />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

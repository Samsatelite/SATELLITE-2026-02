import { Activity, Users, CreditCard, TrendingUp } from 'lucide-react';

export function AdminOverview() {
  // Mock data - in production fetch from Supabase
  const stats = [
    { label: 'Total Transactions', value: '1,234', icon: CreditCard, change: '+12%' },
    { label: 'Active Users', value: '567', icon: Users, change: '+8%' },
    { label: 'Revenue Today', value: '₦45,600', icon: TrendingUp, change: '+23%' },
    { label: 'Success Rate', value: '98.5%', icon: Activity, change: '+0.5%' },
  ];

  const recentActivity = [
    { id: 1, type: 'transaction', message: 'Data purchase: 1GB to 08012345678', time: '2 min ago', status: 'success' },
    { id: 2, type: 'transaction', message: 'Airtime: ₦500 to 07098765432', time: '5 min ago', status: 'success' },
    { id: 3, type: 'transaction', message: 'Data purchase: 2GB to 09087654321', time: '12 min ago', status: 'success' },
    { id: 4, type: 'network', message: 'MTN service status: healthy', time: '1 hour ago', status: 'info' },
    { id: 5, type: 'transaction', message: 'Bulk transaction: 5 numbers', time: '2 hours ago', status: 'success' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Monitor your application activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <span className="text-xs text-success font-medium">{stat.change}</span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold">Recent Activity</h2>
        </div>
        <div className="divide-y divide-border">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.status === 'success' ? 'bg-success' : 'bg-blue-500'
                }`} />
                <div>
                  <p className="text-sm font-medium">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

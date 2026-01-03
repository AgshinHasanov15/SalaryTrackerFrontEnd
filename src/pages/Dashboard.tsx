import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StatsCard } from '@/components/StatsCard';
import { MonthSelector } from '@/components/MonthSelector';
import { PaymentCard } from '@/components/PaymentCard';
import { useWorkers } from '@/context/WorkersContext';
import { useAuth } from '@/context/AuthContext';
import { Users, DollarSign, TrendingUp, Calendar, ArrowRight, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    workers, 
    selectedMonth, 
    setSelectedMonth, 
    getTotalPaymentsForMonth,
    getRecentPayments,
    getWorkerPaymentStatus,
    getWorkersTotalPaidForMonth
  } = useWorkers();

  const totalPayments = getTotalPaymentsForMonth(selectedMonth);
  const recentPayments = getRecentPayments(5);
  const paidWorkers = getWorkersTotalPaidForMonth();
  const averageSalary = workers.length > 0 
    ? workers.reduce((sum, w) => sum + (w.monthlySalary || 0), 0) / workers.length 
    : 0;

  // Get current hour for greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-1">
              {greeting}, <span className="gradient-text">{user?.fullName?.split(' ')[0] || 'there'}</span>
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your team
            </p>
          </div>

          <MonthSelector 
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            className="animate-fade-in-up delay-100"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Workers"
            value={workers.length}
            subtitle="Active team members"
            icon={Users}
            variant="default"
            className="animate-fade-in-up delay-100"
          />
          <StatsCard
            title="Monthly Payments"
            value={`₼${totalPayments.toLocaleString()}`}
            subtitle={format(selectedMonth, 'MMMM yyyy')}
            icon={DollarSign}
            variant="primary"
            className="animate-fade-in-up delay-200"
          />
          <StatsCard
            title="Workers Paid"
            value={`${paidWorkers}/${workers.length}`}
            subtitle="This month"
            icon={Calendar}
            variant="accent"
            className="animate-fade-in-up delay-300"
          />
          <StatsCard
            title="Avg. Salary"
            value={`₼${Math.round(averageSalary).toLocaleString()}`}
            subtitle="Per worker"
            icon={TrendingUp}
            variant="default"
            className="animate-fade-in-up delay-400"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Payments */}
          <div className="lg:col-span-2 animate-fade-in-up delay-300">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Recent Payments</h2>
                  <p className="text-sm text-muted-foreground">Latest transactions across all workers</p>
                </div>
              </div>

              {recentPayments.length > 0 ? (
                <div className="space-y-3">
                  {recentPayments.map((payment, index) => (
                    <div 
                      key={payment.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <PaymentCard 
                        payment={payment} 
                        worker={payment.worker}
                        showWorker
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Wallet className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">No payments recorded yet</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/workers')}
                  >
                    Go to Workers
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Workers Summary */}
          <div className="space-y-6 animate-fade-in-up delay-400">
            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button 
                  variant="default" 
                  className="w-full justify-between"
                  onClick={() => navigate('/workers')}
                >
                  View All Workers
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={() => navigate('/workers?add=true')}
                >
                  Add New Worker
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Workers Summary */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold mb-4">Team Status</h2>
              <div className="space-y-4">
                {workers.slice(0, 4).map((worker) => {
                  const status = getWorkerPaymentStatus(worker.id);
                  return (
                    <div 
                      key={worker.id}
                      onClick={() => navigate(`/workers/${worker.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary flex-shrink-0">
                          {worker.fullName.charAt(0)}
                        </div>
                        <span className="font-medium truncate">{worker.fullName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'full' && <span className="text-lg">✔️</span>}
                        {status === 'partial' && <span className="text-lg">🟧</span>}
                      </div>
                    </div>
                  );
                })}
                {workers.length > 4 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground"
                    onClick={() => navigate('/workers')}
                  >
                    View all {workers.length} workers
                  </Button>
                )}
                {workers.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No workers yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

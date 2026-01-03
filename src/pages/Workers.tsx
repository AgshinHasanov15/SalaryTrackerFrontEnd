import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkerCard } from '@/components/WorkerCard';
import { MonthSelector } from '@/components/MonthSelector';
import { AddWorkerModal } from '@/components/AddWorkerModal';
import { useWorkers } from '@/context/WorkersContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Users, Filter } from 'lucide-react';

export default function Workers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { workers, selectedMonth, setSelectedMonth, getWorkerPaymentStatus, getWorkersTotalPaidForMonth } = useWorkers();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Open add modal if URL has ?add=true
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setIsAddModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Filter workers based on search and status
  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = getWorkerPaymentStatus(worker.id);
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'paid') return matchesSearch && status === 'full';
    if (filterStatus === 'unpaid') return matchesSearch && status !== 'full';
    return matchesSearch;
  });

  const paidCount = getWorkersTotalPaidForMonth();
  const unpaidCount = workers.length - paidCount;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-1">Workers</h1>
            <p className="text-muted-foreground">
              Manage your team members and their payments
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 animate-fade-in-up delay-100">
            <MonthSelector 
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
            <Button 
              variant="glow"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Worker
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search workers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status filter buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('all')}
              className="gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              All ({workers.length})
            </Button>
            <Button
              variant={filterStatus === 'paid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('paid')}
              className="gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-success" />
              Paid ({paidCount})
            </Button>
            <Button
              variant={filterStatus === 'unpaid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('unpaid')}
              className="gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              Unpaid ({unpaidCount})
            </Button>
          </div>
        </div>

        {/* Workers Grid */}
        {filteredWorkers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredWorkers.map((worker, index) => (
              <div 
                key={worker.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <WorkerCard worker={worker} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center animate-fade-in">
            <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No workers found' : 'No workers yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first team member to start tracking their payments'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button variant="glow" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Worker
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Worker Modal */}
      <AddWorkerModal 
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </AppLayout>
  );
}

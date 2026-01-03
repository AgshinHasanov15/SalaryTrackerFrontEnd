import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { TechniqueCard } from '@/components/TechniqueCard';
import { AddTechniqueModal } from '@/components/AddTechniqueModal';
import { useTechniques } from '@/context/TechniquesContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Truck, Filter, TrendingUp } from 'lucide-react';

export default function Techniques() {
  const { 
    techniques, 
    getActiveTechniques, 
    getEndedTechniques, 
    getTotalActiveRent 
  } = useTechniques();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'ended'>('all');

  const activeTechniques = getActiveTechniques();
  const endedTechniques = getEndedTechniques();
  const totalActiveRent = getTotalActiveRent();

  // Filter techniques based on search and status
  const filteredTechniques = techniques.filter(technique => {
    const matchesSearch = technique.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (technique.description?.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'active') return matchesSearch && technique.status === 'active';
    if (filterStatus === 'ended') return matchesSearch && technique.status === 'ended';
    return matchesSearch;
  });

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-1">Techniques</h1>
            <p className="text-muted-foreground">
              Manage your equipment rentals and track costs
            </p>
          </div>

          <div className="flex items-center gap-3 animate-fade-in-up delay-100">
            <Button 
              variant="glow"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Technique
            </Button>
          </div>
        </div>

        {/* Stats Banner */}
        <div className="glass-card p-4 animate-fade-in-up delay-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Active Rent</p>
                <p className="text-2xl font-bold text-primary">
                  {totalActiveRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-success">{activeTechniques.length}</p>
                <p className="text-muted-foreground">Active</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{endedTechniques.length}</p>
                <p className="text-muted-foreground">Ended</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search techniques..."
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
              All ({techniques.length})
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('active')}
              className="gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-success" />
              Active ({activeTechniques.length})
            </Button>
            <Button
              variant={filterStatus === 'ended' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus('ended')}
              className="gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              Ended ({endedTechniques.length})
            </Button>
          </div>
        </div>

        {/* Techniques Grid */}
        {filteredTechniques.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTechniques.map((technique, index) => (
              <div 
                key={technique.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TechniqueCard technique={technique} />
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center animate-fade-in">
            <Truck className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery || filterStatus !== 'all' ? 'No techniques found' : 'No techniques yet'}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Add your first equipment to start tracking rental costs'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Button variant="glow" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Technique
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add Technique Modal */}
      <AddTechniqueModal 
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
      />
    </AppLayout>
  );
}

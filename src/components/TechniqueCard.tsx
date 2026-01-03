import { useState, useEffect } from 'react';
import { Truck, Calendar, Clock, CircleDollarSign, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Technique, useTechniques } from '@/context/TechniquesContext';
import { FocusModeCalendar } from '@/components/FocusModeCalendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface TechniqueCardProps {
  technique: Technique;
}

export function TechniqueCard({ technique }: TechniqueCardProps) {
  const { getDailyRent, getTotalRent, getTotalWorkingDays, getTotalDayOffs, endTechnique, toggleDayOff } = useTechniques();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const dailyRent = getDailyRent(technique);
  const totalRent = getTotalRent(technique);
  const totalDays = getTotalWorkingDays(technique);
  const dayOffs = getTotalDayOffs(technique);
  const workingDays = totalDays - dayOffs;

  // Lock body scroll when calendar is open
  useEffect(() => {
    if (isCalendarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCalendarOpen]);

  const handleEndTechnique = (e: React.MouseEvent) => {
    e.stopPropagation();
    endTechnique(technique.id);
  };

  const handleCardClick = () => {
    setIsCalendarOpen(true);
  };

  return (
    <>
      <div 
        className="glass-card p-5 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              technique.status === 'active' 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {technique.name}
              </h3>
              <Badge 
                variant={technique.status === 'active' ? 'default' : 'secondary'}
                className={cn(
                  "text-xs",
                  technique.status === 'active' 
                    ? "bg-success/10 text-success border-success/20" 
                    : "bg-muted text-muted-foreground"
                )}
              >
                {technique.status === 'active' ? 'Active' : 'Ended'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <CircleDollarSign className="h-3.5 w-3.5" />
              <span>Daily Rent</span>
            </div>
            <span className="font-semibold text-sm">
              {dailyRent.toFixed(2)} ₼
            </span>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Total Rent</span>
            </div>
            <span className="font-semibold text-sm text-primary">
              {totalRent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₼
            </span>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Clock className="h-3.5 w-3.5" />
              <span>Working Days</span>
            </div>
            <span className="font-semibold text-sm">
              {workingDays} days
            </span>
          </div>

          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Day Offs</span>
            </div>
            <span className="font-semibold text-sm text-orange-500">
              {dayOffs} days
            </span>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(technique.startDate), 'dd.MM.yyyy')}
            {' → '}
            {technique.endDate 
              ? format(new Date(technique.endDate), 'dd.MM.yyyy')
              : 'Present'
            }
          </span>
        </div>

        {/* Action Button */}
        {technique.status === 'active' && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={handleEndTechnique}
          >
            Mark as Ended
          </Button>
        )}
      </div>

      {/* Full Screen Focus Mode Calendar */}
      <FocusModeCalendar
        technique={technique}
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        onToggleDayOff={(date) => toggleDayOff(technique.id, date)}
      />
    </>
  );
}


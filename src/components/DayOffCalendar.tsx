import { useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  addMonths,
  subMonths,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Technique } from '@/context/TechniquesContext';

interface DayOffCalendarProps {
  technique: Technique;
  onToggleDayOff: (date: Date) => void;
}

export function DayOffCalendar({ technique, onToggleDayOff }: DayOffCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDate = startOfDay(new Date(technique.startDate));
  const endDate = technique.endDate 
    ? startOfDay(new Date(technique.endDate)) 
    : null;

  const isDayOff = (date: Date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    return technique.dayOffs.includes(dateStr);
  };

  const isInRentalPeriod = (date: Date) => {
    const day = startOfDay(date);
    const afterStart = !isBefore(day, startDate);
    const beforeEnd = endDate ? !isAfter(day, endDate) : !isAfter(day, startOfDay(new Date()));
    return afterStart && beforeEnd;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Get first day of month to add empty cells
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week days header */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map(day => (
          <div 
            key={day} 
            className="text-center text-xs font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        
        {days.map(day => {
          const inPeriod = isInRentalPeriod(day);
          const isOff = isDayOff(day);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => inPeriod && onToggleDayOff(day)}
              disabled={!inPeriod}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all",
                // Disabled state - outside rental period
                !inPeriod && "bg-muted/30 text-muted-foreground/30 cursor-not-allowed",
                // Working day - in period and not a day off
                inPeriod && !isOff && "bg-success/20 text-success hover:bg-success/30 cursor-pointer",
                // Day off
                isOff && "bg-destructive/20 text-destructive hover:bg-destructive/30 line-through cursor-pointer",
                // Today highlight
                isToday && "ring-2 ring-primary ring-offset-2 ring-offset-card"
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-sm bg-success/40" />
          <span className="text-muted-foreground">Working Day</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-sm bg-destructive/40" />
          <span className="text-muted-foreground">Day Off</span>
        </div>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Click on dates within the rental period to toggle
      </p>
    </div>
  );
}

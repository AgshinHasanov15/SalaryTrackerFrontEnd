import { useState } from 'react';
import { createPortal } from 'react-dom';
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
import { ChevronLeft, ChevronRight, ArrowLeft, Calendar, CalendarOff, Truck, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Technique } from '@/context/TechniquesContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FocusModeCalendarProps {
  technique: Technique;
  onToggleDayOff: (date: Date) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function FocusModeCalendar({ technique, onToggleDayOff, onClose, isOpen }: FocusModeCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!isOpen) return null;

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

  const weekDays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const firstDayOfWeek = monthStart.getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  // Calculate stats
  const workingDays = days.filter(d => isInRentalPeriod(d) && !isDayOff(d)).length;
  const dayOffs = days.filter(d => isInRentalPeriod(d) && isDayOff(d)).length;

  return createPortal(
    <div 
      className="fixed inset-0 z-[99999] bg-black flex flex-col animate-fade-in"
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      ref={(el) => el?.focus()}
    >
      {/* Header - Minimal with back button */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-white/10">
        <button 
          onClick={onClose}
          className="flex items-center gap-3 text-white/70 hover:text-industrial transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold tracking-widest uppercase">Back</span>
        </button>
        
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-industrial/20">
            <Truck className="h-5 w-5 text-industrial" />
          </div>
          <h1 className="text-white font-bold tracking-wide text-xl">
            {technique.name.toUpperCase()}
          </h1>
        </div>
        
        <div className="w-24" /> {/* Spacer for centering */}
      </header>

      {/* Main Content - Scrollable from top */}
      <ScrollArea className="flex-1">
        <main className="flex flex-col items-center p-6 pb-12">
          {/* Rental Period Info */}
          <div className="mb-8 text-center">
            <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-4">Rental Period</p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-industrial font-bold text-xl tracking-wide">
                  {format(startDate, 'MMM d, yyyy')}
                </p>
                <p className="text-white/30 text-xs mt-2 tracking-widest">START DATE</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-industrial to-transparent" />
                <span className="text-industrial/60 text-xs">→</span>
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-industrial to-transparent" />
              </div>
              <div className="text-center">
                <p className="text-industrial font-bold text-xl tracking-wide">
                  {endDate ? format(endDate, 'MMM d, yyyy') : 'Present'}
                </p>
                <p className="text-white/30 text-xs mt-2 tracking-widest">{endDate ? 'END DATE' : 'ONGOING'}</p>
              </div>
            </div>
          </div>

          {/* Calendar Container */}
          <div className="w-full max-w-lg bg-white/[0.03] rounded-2xl border border-white/10 p-6 shadow-[0_0_80px_rgba(234,179,8,0.1)]">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white/50 hover:text-industrial hover:bg-industrial/10 rounded-full border border-white/10 hover:border-industrial/30"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <h2 className="text-white font-bold text-xl tracking-wider">
                {format(currentMonth, 'MMMM yyyy').toUpperCase()}
              </h2>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white/50 hover:text-industrial hover:bg-industrial/10 rounded-full border border-white/10 hover:border-industrial/30"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-1.5 mb-2">
              {weekDays.map(day => (
                <div 
                  key={day} 
                  className="text-center text-xs font-bold text-white/30 py-1.5 tracking-widest"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1.5">
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
                      "aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200",
                      // Disabled state - outside rental period
                      !inPeriod && "bg-white/[0.02] text-white/15 cursor-not-allowed",
                      // Working day - in period and not a day off (Industrial Yellow)
                      inPeriod && !isOff && "bg-industrial/20 text-industrial hover:bg-industrial/30 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] cursor-pointer border border-industrial/40",
                      // Day off (Red/Off)
                      isOff && "bg-red-500/20 text-red-400 hover:bg-red-500/30 line-through cursor-pointer border border-red-500/40",
                      // Today highlight
                      isToday && "ring-2 ring-white ring-offset-1 ring-offset-black"
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-industrial/30 border border-industrial/50" />
                <span className="text-white/50 text-xs font-medium tracking-wider">WORKING</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50" />
                <span className="text-white/50 text-xs font-medium tracking-wider">DAY OFF</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/5 border border-white/10" />
                <span className="text-white/50 text-xs font-medium tracking-wider">DISABLED</span>
              </div>
            </div>
          </div>

          {/* Stats for current month */}
          <div className="flex items-center gap-10 mt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-industrial/20 border border-industrial/30">
                <Calendar className="w-4 h-4 text-industrial" />
              </div>
              <div>
                <span className="text-industrial font-bold text-xl">{workingDays}</span>
                <p className="text-white/30 text-[10px] tracking-wider">WORKING DAYS</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
                <CalendarOff className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <span className="text-red-400 font-bold text-xl">{dayOffs}</span>
                <p className="text-white/30 text-[10px] tracking-wider">DAYS OFF</p>
              </div>
            </div>
          </div>

          {/* Notes Section */}
          {technique.description && (
            <div className="w-full max-w-lg mt-8 bg-white/[0.03] rounded-xl border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-industrial" />
                <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">Notes</span>
              </div>
              <p className="text-white/80 text-sm leading-relaxed">
                {technique.description}
              </p>
            </div>
          )}

          {/* Instructions */}
          <p className="text-white/20 text-xs mt-6 tracking-widest text-center">
            CLICK ON DATES WITHIN THE RENTAL PERIOD TO TOGGLE WORKING / DAY OFF
          </p>
        </main>
      </ScrollArea>
    </div>,
    document.body
  );
}

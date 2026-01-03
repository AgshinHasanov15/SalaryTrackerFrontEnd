import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format, addMonths, subMonths, isSameMonth } from 'date-fns';

interface MonthSelectorProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  className?: string;
}

export function MonthSelector({ selectedMonth, onMonthChange, className }: MonthSelectorProps) {
  const isCurrentMonth = isSameMonth(selectedMonth, new Date());

  const handlePrevious = () => {
    onMonthChange(subMonths(selectedMonth, 1));
  };

  const handleNext = () => {
    onMonthChange(addMonths(selectedMonth, 1));
  };

  const handleCurrent = () => {
    onMonthChange(new Date());
  };

  return (
    <div className={cn(
      "glass-card inline-flex items-center gap-1 p-1.5",
      className
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePrevious}
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant={isCurrentMonth ? "default" : "ghost"}
        onClick={handleCurrent}
        className={cn(
          "min-w-[160px] h-9 gap-2",
          !isCurrentMonth && "text-muted-foreground hover:text-foreground"
        )}
      >
        <Calendar className="h-4 w-4" />
        <span className="font-medium">
          {format(selectedMonth, 'MMMM yyyy')}
        </span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        onClick={handleNext}
        className="h-9 w-9 text-muted-foreground hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

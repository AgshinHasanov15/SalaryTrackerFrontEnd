import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Truck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useTechniques } from '@/context/TechniquesContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddTechniqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTechniqueModal({ open, onOpenChange }: AddTechniqueModalProps) {
  const { addTechnique } = useTechniques();
  const { toast } = useToast();
  
  const [name, setName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [plannedWorkingDays, setPlannedWorkingDays] = useState('26');
  const [startDate, setStartDate] = useState<Date>();
  const [description, setDescription] = useState('');

  const dailyRent = monthlyRent && plannedWorkingDays 
    ? (parseFloat(monthlyRent) / parseInt(plannedWorkingDays)).toFixed(2)
    : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !monthlyRent || !plannedWorkingDays || !startDate) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    addTechnique({
      name,
      monthlyRent: parseFloat(monthlyRent),
      plannedWorkingDays: parseInt(plannedWorkingDays),
      startDate,
      description: description || undefined,
    });

    toast({
      title: 'Success',
      description: `${name} has been added successfully`,
    });

    // Reset form
    setName('');
    setMonthlyRent('');
    setPlannedWorkingDays('26');
    setStartDate(undefined);
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Truck className="h-4 w-4 text-primary" />
            </div>
            Add New Technique
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Technique Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Excavator, Grader, Loader..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Monthly Rent & Working Days */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyRent">Monthly Rent (₼) *</Label>
              <Input
                id="monthlyRent"
                type="number"
                placeholder="15000"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="workingDays">Planned Working Days *</Label>
              <Input
                id="workingDays"
                type="number"
                placeholder="26"
                value={plannedWorkingDays}
                onChange={(e) => setPlannedWorkingDays(e.target.value)}
              />
            </div>
          </div>

          {/* Calculated Daily Rent */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Calculated Daily Rent:</span>
              <span className="text-lg font-semibold text-primary">{dailyRent} ₼</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formula: Monthly Rent ÷ Planned Working Days
            </p>
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label>Start Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'dd.MM.yyyy') : 'Select start date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description / Notes</Label>
            <Textarea
              id="description"
              placeholder="Optional notes about this equipment..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="glow" className="flex-1">
              Add Technique
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

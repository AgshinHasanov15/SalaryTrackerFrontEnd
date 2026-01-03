import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkers } from '@/context/WorkersContext';
import { DollarSign, Calendar, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface AddPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerId: string;
  workerName: string;
}

export function AddPaymentModal({ open, onOpenChange, workerId, workerName }: AddPaymentModalProps) {
  const { addPayment } = useWorkers();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    note: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.amount || isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    addPayment({
      workerId,
      amount: Number(formData.amount),
      date: new Date(formData.date),
      note: formData.note.trim() || undefined,
    });
    
    toast({
      title: 'Payment Recorded',
      description: `₼${Number(formData.amount).toLocaleString()} payment added for ${workerName}.`,
    });
    
    // Reset form
    setFormData({
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      note: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Payment</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Recording payment for {workerName}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Amount *
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="Enter payment amount"
              className={errors.amount ? 'border-destructive' : ''}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">{errors.amount}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={errors.date ? 'border-destructive' : ''}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date}</p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Note
            </Label>
            <Textarea
              id="note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              placeholder="e.g., Monthly salary, Bonus, etc."
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" variant="glow" className="flex-1">
              Add Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

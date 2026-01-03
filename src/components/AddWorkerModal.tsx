import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkers } from '@/context/WorkersContext';
import { User, Briefcase, DollarSign, FileText, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AddWorkerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddWorkerModal({ open, onOpenChange }: AddWorkerModalProps) {
  const { addWorker } = useWorkers();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    monthlySalary: '',
    description: '',
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    if (formData.monthlySalary && isNaN(Number(formData.monthlySalary))) {
      newErrors.monthlySalary = 'Please enter a valid number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    addWorker({
      fullName: formData.fullName.trim(),
      position: formData.position.trim(),
      monthlySalary: formData.monthlySalary ? Number(formData.monthlySalary) : undefined,
      description: formData.description.trim() || undefined,
      photo: formData.photo.trim() || undefined,
    });
    
    toast({
      title: 'Worker Added',
      description: `${formData.fullName} has been added to your team.`,
    });
    
    // Reset form
    setFormData({
      fullName: '',
      position: '',
      monthlySalary: '',
      description: '',
      photo: '',
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Worker</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Full Name *
            </Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Enter worker's full name"
              className={errors.fullName ? 'border-destructive' : ''}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Position */}
          <div className="space-y-2">
            <Label htmlFor="position" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Position *
            </Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="e.g., Senior Developer"
              className={errors.position ? 'border-destructive' : ''}
            />
            {errors.position && (
              <p className="text-xs text-destructive">{errors.position}</p>
            )}
          </div>

          {/* Monthly Salary */}
          <div className="space-y-2">
            <Label htmlFor="monthlySalary" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Monthly Salary
            </Label>
            <Input
              id="monthlySalary"
              type="number"
              value={formData.monthlySalary}
              onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
              placeholder="e.g., 5000"
              className={errors.monthlySalary ? 'border-destructive' : ''}
            />
            {errors.monthlySalary && (
              <p className="text-xs text-destructive">{errors.monthlySalary}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              Description / Bio
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description about the worker..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Photo URL */}
          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center gap-2">
              <Image className="w-4 h-4 text-muted-foreground" />
              Photo URL
            </Label>
            <Input
              id="photo"
              type="url"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="https://example.com/photo.jpg"
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
              Add Worker
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

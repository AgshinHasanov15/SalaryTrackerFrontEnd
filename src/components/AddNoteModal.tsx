import { useState, useEffect } from 'react';
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
import { useWorkers, WorkerNote } from '@/context/WorkersContext';
import { useToast } from '@/hooks/use-toast';

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerId: string;
  editNote?: WorkerNote | null;
}

export function AddNoteModal({ open, onOpenChange, workerId, editNote }: AddNoteModalProps) {
  const { addWorkerNote, updateWorkerNote } = useWorkers();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editNote) {
      setFormData({
        title: editNote.title || '',
        content: editNote.content,
      });
    } else {
      setFormData({ title: '', content: '' });
    }
    setErrors({});
  }, [editNote, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.content.trim()) {
      newErrors.content = 'Note content is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (editNote) {
      updateWorkerNote(workerId, editNote.id, {
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
      });
      toast({
        title: 'Note Updated',
        description: 'The note has been updated successfully.',
      });
    } else {
      addWorkerNote(workerId, {
        title: formData.title.trim() || undefined,
        content: formData.content.trim(),
      });
      toast({
        title: 'Note Added',
        description: 'A new note has been added.',
      });
    }

    setFormData({ title: '', content: '' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>{editNote ? 'Edit Note' : 'Add Note'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input
              id="title"
              placeholder="Enter note title..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-secondary/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              placeholder="Enter your note..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="bg-secondary/50 min-h-[120px] resize-none"
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="glow" className="flex-1">
              {editNote ? 'Update Note' : 'Add Note'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

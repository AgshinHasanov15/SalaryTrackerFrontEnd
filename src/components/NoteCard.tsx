import { useState } from 'react';
import { format } from 'date-fns';
import { FileText, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WorkerNote } from '@/context/WorkersContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface NoteCardProps {
  note: WorkerNote;
  onEdit: (note: WorkerNote) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="glass-card p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {note.title && (
                <h4 className="font-semibold text-foreground mb-1 truncate">{note.title}</h4>
              )}
              <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                {note.content}
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                {format(new Date(note.createdAt), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(note)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => onDelete(note.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

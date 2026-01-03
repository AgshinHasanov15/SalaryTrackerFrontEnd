import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { MonthSelector } from '@/components/MonthSelector';
import { PaymentCard } from '@/components/PaymentCard';
import { AddPaymentModal } from '@/components/AddPaymentModal';
import { NoteCard } from '@/components/NoteCard';
import { AddNoteModal } from '@/components/AddNoteModal';
import { useWorkers, WorkerNote } from '@/context/WorkersContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Plus, 
  User, 
  Briefcase, 
  DollarSign, 
  Calendar,
  Trash2,
  Wallet,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
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
import { useToast } from '@/hooks/use-toast';

export default function WorkerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    workers, 
    selectedMonth, 
    setSelectedMonth,
    getMonthlyPayments,
    deleteWorker,
    deletePayment,
    getWorkerPaymentStatus,
    getTotalPaidForWorkerThisMonth,
    deleteWorkerNote
  } = useWorkers();

  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<WorkerNote | null>(null);

  const worker = workers.find(w => w.id === id);

  if (!worker) {
    return (
      <AppLayout>
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Worker not found</h1>
          <Button onClick={() => navigate('/workers')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Workers
          </Button>
        </div>
      </AppLayout>
    );
  }

  const monthlyPayments = getMonthlyPayments(worker.id, selectedMonth);
  const totalMonthlyPayments = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
  const status = getWorkerPaymentStatus(worker.id);
  const remaining = worker.monthlySalary ? Math.max(0, worker.monthlySalary - totalMonthlyPayments) : 0;
  const workerNotes = (worker.notes || []).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleDeleteWorker = () => {
    deleteWorker(worker.id);
    toast({
      title: 'Worker Deleted',
      description: `${worker.fullName} has been removed.`,
    });
    navigate('/workers');
  };

  const handleDeletePayment = (paymentId: string) => {
    deletePayment(paymentId);
    toast({
      title: 'Payment Deleted',
      description: 'The payment has been removed.',
    });
  };

  const handleEditNote = (note: WorkerNote) => {
    setEditingNote(note);
    setIsAddNoteOpen(true);
  };

  const handleDeleteNote = (noteId: string) => {
    deleteWorkerNote(worker.id, noteId);
    toast({
      title: 'Note Deleted',
      description: 'The note has been removed.',
    });
  };

  const handleAddNoteClose = (open: boolean) => {
    setIsAddNoteOpen(open);
    if (!open) {
      setEditingNote(null);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 space-y-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/workers')}
          className="gap-2 text-muted-foreground hover:text-foreground animate-fade-in"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workers
        </Button>

        {/* Worker Header */}
        <div className="glass-card p-6 lg:p-8 animate-fade-in-up">
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-secondary overflow-hidden flex items-center justify-center">
                {worker.photo ? (
                  <img 
                    src={worker.photo} 
                    alt={worker.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              {/* Paid indicator */}
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                status === 'full' ? 'bg-success' : status === 'partial' ? 'bg-orange-500' : 'bg-muted'
              }`}>
                {status === 'full' && <span className="text-lg">✔️</span>}
                {status === 'partial' && <span className="text-lg">🟧</span>}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold mb-1">{worker.fullName}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>{worker.position}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button 
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <DollarSign className="w-4 h-4" />
                    Monthly Salary
                  </div>
                  <div className="text-xl font-semibold">
                    {worker.monthlySalary ? `${worker.monthlySalary.toLocaleString()} ₼` : 'Not set'}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Wallet className="w-4 h-4" />
                    Paid This Month
                  </div>
                  <div className="text-xl font-semibold">
                    {totalMonthlyPayments.toLocaleString()} ₼
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    Remaining
                  </div>
                  <div className="text-xl font-semibold">
                    {remaining.toLocaleString()} ₼
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    Status
                  </div>
                  <div className={`text-xl font-semibold flex items-center gap-2 ${
                    status === 'full' ? 'text-success' : status === 'partial' ? 'text-orange-500' : 'text-muted-foreground'
                  }`}>
                    {status === 'full' && <><span>✔️</span> Paid</>}
                    {status === 'partial' && <><span>🟧</span> Partial</>}
                    {status === 'none' && 'Pending'}
                  </div>
                </div>
              </div>

              {/* Description */}
              {worker.description && (
                <p className="mt-4 text-muted-foreground">
                  {worker.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="payments" className="animate-fade-in-up delay-200">
          <TabsList className="bg-secondary/50 mb-4">
            <TabsTrigger value="payments" className="gap-2">
              <Wallet className="w-4 h-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="w-4 h-4" />
              Notes ({workerNotes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold">Payment History</h2>
              <div className="flex items-center gap-3">
                <MonthSelector 
                  selectedMonth={selectedMonth}
                  onMonthChange={setSelectedMonth}
                />
                <Button 
                  variant="glow"
                  onClick={() => setIsAddPaymentOpen(true)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Payment
                </Button>
              </div>
            </div>

            {/* Payments List */}
            {monthlyPayments.length > 0 ? (
              <div className="space-y-3">
                {monthlyPayments
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((payment, index) => (
                    <div 
                      key={payment.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <PaymentCard 
                        payment={payment}
                        onDelete={handleDeletePayment}
                      />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <Wallet className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No payments this month</h3>
                <p className="text-muted-foreground mb-6">
                  Record a payment for {format(selectedMonth, 'MMMM yyyy')}
                </p>
                <Button variant="glow" onClick={() => setIsAddPaymentOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h2 className="text-xl font-semibold">Worker Notes</h2>
              <Button 
                variant="glow"
                onClick={() => setIsAddNoteOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Note
              </Button>
            </div>

            {/* Notes List */}
            {workerNotes.length > 0 ? (
              <div className="space-y-3">
                {workerNotes.map((note, index) => (
                  <div 
                    key={note.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NoteCard 
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No notes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add notes to keep track of important information about this worker
                </p>
                <Button variant="glow" onClick={() => setIsAddNoteOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Payment Modal */}
      <AddPaymentModal 
        open={isAddPaymentOpen}
        onOpenChange={setIsAddPaymentOpen}
        workerId={worker.id}
        workerName={worker.fullName}
      />

      {/* Add/Edit Note Modal */}
      <AddNoteModal 
        open={isAddNoteOpen}
        onOpenChange={handleAddNoteClose}
        workerId={worker.id}
        editNote={editingNote}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Worker</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {worker.fullName}? This will also delete all their payment records. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWorker}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

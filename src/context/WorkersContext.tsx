import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { workerApi, paymentApi, Worker as ApiWorker, WorkerNote as ApiWorkerNote, Payment as ApiPayment } from '@/api';
import { workerSchema, workerNoteSchema, paymentSchema, validateData } from '@/lib/validations';

// Types
export interface WorkerNote {
  id: string;
  title?: string;
  content: string;
  createdAt: Date;
}

export interface Worker {
  id: string;
  fullName: string;
  position: string;
  monthlySalary?: number;
  description?: string;
  photo?: string;
  createdAt: Date;
  notes?: WorkerNote[];
}

export interface Payment {
  id: string;
  workerId: string;
  amount: number;
  date: Date;
  note?: string;
}

interface WorkersContextType {
  workers: Worker[];
  payments: Payment[];
  selectedMonth: Date;
  isLoading: boolean;
  addWorker: (worker: Omit<Worker, 'id' | 'createdAt'>) => Promise<void>;
  updateWorker: (id: string, updates: Partial<Worker>) => Promise<void>;
  deleteWorker: (id: string) => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  setSelectedMonth: (date: Date) => void;
  getWorkerPayments: (workerId: string) => Payment[];
  getMonthlyPayments: (workerId: string, month: Date) => Payment[];
  getWorkerPaymentStatus: (workerId: string) => 'full' | 'partial' | 'none';
  getWorkersTotalPaidForMonth: () => number;
  getTotalPaymentsForMonth: (month: Date) => number;
  getRecentPayments: (limit?: number) => (Payment & { worker: Worker })[];
  getTotalPaidForWorkerThisMonth: (workerId: string) => number;
  addWorkerNote: (workerId: string, note: Omit<WorkerNote, 'id' | 'createdAt'>) => Promise<void>;
  updateWorkerNote: (workerId: string, noteId: string, updates: Partial<Omit<WorkerNote, 'id' | 'createdAt'>>) => Promise<void>;
  deleteWorkerNote: (workerId: string, noteId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const WorkersContext = createContext<WorkersContextType | undefined>(undefined);

// Helper to map API response to local types
function mapWorker(w: ApiWorker): Worker {
  return {
    id: w.id,
    fullName: w.name,
    position: w.position,
    monthlySalary: w.salary,
    description: w.description,
    photo: w.photo,
    createdAt: new Date(w.createdAt),
    notes: w.notes?.map((n: ApiWorkerNote) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      createdAt: new Date(n.createdAt),
    })),
  };
}

function mapPayment(p: ApiPayment): Payment {
  return {
    id: p.id,
    workerId: p.workerId,
    amount: p.amount,
    date: new Date(p.date),
    note: p.note,
  };
}

export function WorkersProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data from API
  const fetchData = useCallback(async () => {
    if (!user) {
      setWorkers([]);
      setPayments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [workersData, paymentsData] = await Promise.all([
        workerApi.getAll(),
        paymentApi.getAll(),
      ]);

      setWorkers(workersData.map(mapWorker));
      setPayments(paymentsData.map(mapPayment));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setWorkers([]);
      setPayments([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchData]);

  const addWorker = useCallback(async (worker: Omit<Worker, 'id' | 'createdAt'>) => {
    if (!user) return;

    const validation = validateData(workerSchema, {
      fullName: worker.fullName,
      position: worker.position,
      monthlySalary: worker.monthlySalary,
      description: worker.description,
      photo: worker.photo || undefined,
    });
    
    if (!validation.success) {
      console.error('Worker validation failed:', validation.errors);
      return;
    }

    try {
      await workerApi.create({
        name: validation.data.fullName,
        position: validation.data.position,
        salary: validation.data.monthlySalary || 0,
        description: validation.data.description || undefined,
        photo: validation.data.photo || undefined,
      });

      await fetchData();
    } catch (error) {
      console.error('Error adding worker:', error);
    }
  }, [user, fetchData]);

  const updateWorker = useCallback(async (id: string, updates: Partial<Worker>) => {
    try {
      await workerApi.update(id, {
        name: updates.fullName,
        position: updates.position,
        salary: updates.monthlySalary,
        description: updates.description,
        photo: updates.photo,
      });

      await fetchData();
    } catch (error) {
      console.error('Error updating worker:', error);
    }
  }, [fetchData]);

  const deleteWorker = useCallback(async (id: string) => {
    try {
      await workerApi.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting worker:', error);
    }
  }, [fetchData]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id'>) => {
    const validation = validateData(paymentSchema, {
      workerId: payment.workerId,
      amount: payment.amount,
      date: payment.date,
      note: payment.note,
    });
    
    if (!validation.success) {
      console.error('Payment validation failed:', validation.errors);
      return;
    }

    try {
      await paymentApi.create({
        workerId: validation.data.workerId,
        amount: validation.data.amount,
        date: validation.data.date.toISOString().split('T')[0],
        note: validation.data.note || undefined,
      });

      await fetchData();
    } catch (error) {
      console.error('Error adding payment:', error);
    }
  }, [fetchData]);

  const deletePayment = useCallback(async (id: string) => {
    try {
      await paymentApi.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting payment:', error);
    }
  }, [fetchData]);

  const getWorkerPayments = useCallback((workerId: string) => {
    return payments.filter(p => p.workerId === workerId);
  }, [payments]);

  const getMonthlyPayments = useCallback((workerId: string, month: Date) => {
    return payments.filter(p => {
      const paymentDate = new Date(p.date);
      return p.workerId === workerId &&
        paymentDate.getMonth() === month.getMonth() &&
        paymentDate.getFullYear() === month.getFullYear();
    });
  }, [payments]);

  const getTotalPaidForWorkerThisMonth = useCallback((workerId: string) => {
    const monthPayments = getMonthlyPayments(workerId, selectedMonth);
    return monthPayments.reduce((sum, p) => sum + p.amount, 0);
  }, [getMonthlyPayments, selectedMonth]);

  const getWorkerPaymentStatus = useCallback((workerId: string): 'full' | 'partial' | 'none' => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker || !worker.monthlySalary) return 'none';
    
    const totalPaid = getTotalPaidForWorkerThisMonth(workerId);
    
    if (totalPaid >= worker.monthlySalary) return 'full';
    if (totalPaid > 0) return 'partial';
    return 'none';
  }, [workers, getTotalPaidForWorkerThisMonth]);

  const getWorkersTotalPaidForMonth = useCallback(() => {
    return workers.filter(w => getWorkerPaymentStatus(w.id) === 'full').length;
  }, [workers, getWorkerPaymentStatus]);

  const getTotalPaymentsForMonth = useCallback((month: Date) => {
    return payments
      .filter(p => {
        const paymentDate = new Date(p.date);
        return paymentDate.getMonth() === month.getMonth() &&
          paymentDate.getFullYear() === month.getFullYear();
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const getRecentPayments = useCallback((limit = 5) => {
    return payments
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
      .map(payment => ({
        ...payment,
        worker: workers.find(w => w.id === payment.workerId)!,
      }))
      .filter(p => p.worker);
  }, [payments, workers]);

  const addWorkerNote = useCallback(async (workerId: string, note: Omit<WorkerNote, 'id' | 'createdAt'>) => {
    const validation = validateData(workerNoteSchema, {
      title: note.title,
      content: note.content,
    });
    
    if (!validation.success) {
      console.error('Note validation failed:', validation.errors);
      return;
    }

    try {
      await workerApi.addNote(workerId, {
        title: validation.data.title || undefined,
        content: validation.data.content,
      });

      await fetchData();
    } catch (error) {
      console.error('Error adding note:', error);
    }
  }, [fetchData]);

  const updateWorkerNote = useCallback(async (workerId: string, noteId: string, updates: Partial<Omit<WorkerNote, 'id' | 'createdAt'>>) => {
    try {
      await workerApi.updateNote(workerId, noteId, {
        title: updates.title,
        content: updates.content,
      });

      await fetchData();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  }, [fetchData]);

  const deleteWorkerNote = useCallback(async (workerId: string, noteId: string) => {
    try {
      await workerApi.deleteNote(workerId, noteId);
      await fetchData();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  }, [fetchData]);

  const value = useMemo(() => ({
    workers,
    payments,
    selectedMonth,
    isLoading,
    addWorker,
    updateWorker,
    deleteWorker,
    addPayment,
    deletePayment,
    setSelectedMonth,
    getWorkerPayments,
    getMonthlyPayments,
    getWorkerPaymentStatus,
    getWorkersTotalPaidForMonth,
    getTotalPaymentsForMonth,
    getRecentPayments,
    getTotalPaidForWorkerThisMonth,
    addWorkerNote,
    updateWorkerNote,
    deleteWorkerNote,
    refreshData: fetchData,
  }), [
    workers,
    payments,
    selectedMonth,
    isLoading,
    addWorker,
    updateWorker,
    deleteWorker,
    addPayment,
    deletePayment,
    getWorkerPayments,
    getMonthlyPayments,
    getWorkerPaymentStatus,
    getWorkersTotalPaidForMonth,
    getTotalPaymentsForMonth,
    getRecentPayments,
    getTotalPaidForWorkerThisMonth,
    addWorkerNote,
    updateWorkerNote,
    deleteWorkerNote,
    fetchData,
  ]);

  return (
    <WorkersContext.Provider value={value}>
      {children}
    </WorkersContext.Provider>
  );
}

export function useWorkers() {
  const context = useContext(WorkersContext);
  if (context === undefined) {
    throw new Error('useWorkers must be used within a WorkersProvider');
  }
  return context;
}

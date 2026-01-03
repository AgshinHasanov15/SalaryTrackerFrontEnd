import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo, useEffect } from 'react';
import { differenceInDays, format, parseISO, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { useAuth } from './AuthContext';
import { techniqueApi, Technique as ApiTechnique } from '@/api';
import { techniqueSchema, validateData } from '@/lib/validations';

// Types
export interface Technique {
  id: string;
  name: string;
  monthlyRent: number;
  plannedWorkingDays: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'ended';
  description?: string;
  dayOffs: string[]; // ISO date strings for easy comparison
  createdAt: Date;
}

interface TechniquesContextType {
  techniques: Technique[];
  isLoading: boolean;
  addTechnique: (technique: Omit<Technique, 'id' | 'createdAt' | 'status' | 'dayOffs'>) => Promise<void>;
  updateTechnique: (id: string, updates: Partial<Technique>) => Promise<void>;
  deleteTechnique: (id: string) => Promise<void>;
  endTechnique: (id: string, endDate?: Date) => Promise<void>;
  addDayOff: (techniqueId: string, date: Date) => Promise<void>;
  removeDayOff: (techniqueId: string, date: Date) => Promise<void>;
  toggleDayOff: (techniqueId: string, date: Date) => Promise<void>;
  getDailyRent: (technique: Technique) => number;
  getTotalWorkingDays: (technique: Technique) => number;
  getTotalDayOffs: (technique: Technique) => number;
  getTotalRent: (technique: Technique) => number;
  getActiveTechniques: () => Technique[];
  getEndedTechniques: () => Technique[];
  getTotalActiveRent: () => number;
  refreshData: () => Promise<void>;
}

const TechniquesContext = createContext<TechniquesContextType | undefined>(undefined);

// Helper to map API response to local types
function mapTechnique(t: ApiTechnique): Technique {
  return {
    id: t.id,
    name: t.name,
    monthlyRent: t.monthlyRent,
    plannedWorkingDays: t.plannedWorkingDays,
    startDate: new Date(t.startDate),
    endDate: t.endDate ? new Date(t.endDate) : undefined,
    status: t.status,
    description: t.description,
    dayOffs: t.dayOffs || [],
    createdAt: new Date(t.createdAt),
  };
}

export function TechniquesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [techniques, setTechniques] = useState<Technique[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all techniques from API
  const fetchData = useCallback(async () => {
    if (!user) {
      setTechniques([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await techniqueApi.getAll();
      setTechniques(data.map(mapTechnique));
    } catch (error) {
      console.error('Error fetching techniques:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setTechniques([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchData]);

  const addTechnique = useCallback(async (technique: Omit<Technique, 'id' | 'createdAt' | 'status' | 'dayOffs'>) => {
    if (!user) return;

    const validation = validateData(techniqueSchema, {
      name: technique.name,
      monthlyRent: technique.monthlyRent,
      plannedWorkingDays: technique.plannedWorkingDays,
      startDate: technique.startDate,
      endDate: technique.endDate,
      description: technique.description,
    });
    
    if (!validation.success) {
      console.error('Technique validation failed:', validation.errors);
      return;
    }

    try {
      await techniqueApi.create({
        name: validation.data.name,
        monthlyRent: validation.data.monthlyRent,
        plannedWorkingDays: validation.data.plannedWorkingDays,
        startDate: validation.data.startDate.toISOString().split('T')[0],
        endDate: validation.data.endDate ? validation.data.endDate.toISOString().split('T')[0] : undefined,
        description: validation.data.description || undefined,
      });

      await fetchData();
    } catch (error) {
      console.error('Error adding technique:', error);
    }
  }, [user, fetchData]);

  const updateTechnique = useCallback(async (id: string, updates: Partial<Technique>) => {
    try {
      await techniqueApi.update(id, {
        name: updates.name,
        monthlyRent: updates.monthlyRent,
        plannedWorkingDays: updates.plannedWorkingDays,
        startDate: updates.startDate ? updates.startDate.toISOString().split('T')[0] : undefined,
        endDate: updates.endDate ? updates.endDate.toISOString().split('T')[0] : undefined,
        description: updates.description,
        status: updates.status,
        dayOffs: updates.dayOffs,
      });

      await fetchData();
    } catch (error) {
      console.error('Error updating technique:', error);
    }
  }, [fetchData]);

  const deleteTechnique = useCallback(async (id: string) => {
    try {
      await techniqueApi.delete(id);
      await fetchData();
    } catch (error) {
      console.error('Error deleting technique:', error);
    }
  }, [fetchData]);

  const endTechnique = useCallback(async (id: string, endDate?: Date) => {
    try {
      const endDateStr = (endDate || new Date()).toISOString().split('T')[0];
      await techniqueApi.end(id, endDateStr);
      await fetchData();
    } catch (error) {
      console.error('Error ending technique:', error);
    }
  }, [fetchData]);

  const addDayOff = useCallback(async (techniqueId: string, date: Date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const technique = techniques.find(t => t.id === techniqueId);
    
    if (!technique || technique.dayOffs.includes(dateStr)) return;

    try {
      await techniqueApi.toggleDayOff(techniqueId, dateStr);
      await fetchData();
    } catch (error) {
      console.error('Error adding day off:', error);
    }
  }, [techniques, fetchData]);

  const removeDayOff = useCallback(async (techniqueId: string, date: Date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const technique = techniques.find(t => t.id === techniqueId);
    
    if (!technique || !technique.dayOffs.includes(dateStr)) return;

    try {
      await techniqueApi.toggleDayOff(techniqueId, dateStr);
      await fetchData();
    } catch (error) {
      console.error('Error removing day off:', error);
    }
  }, [techniques, fetchData]);

  const toggleDayOff = useCallback(async (techniqueId: string, date: Date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    
    try {
      await techniqueApi.toggleDayOff(techniqueId, dateStr);
      await fetchData();
    } catch (error) {
      console.error('Error toggling day off:', error);
    }
  }, [fetchData]);

  const getDailyRent = useCallback((technique: Technique) => {
    if (technique.plannedWorkingDays <= 0) return 0;
    return technique.monthlyRent / technique.plannedWorkingDays;
  }, []);

  const getTotalWorkingDays = useCallback((technique: Technique) => {
    const start = startOfDay(new Date(technique.startDate));
    const end = technique.endDate 
      ? startOfDay(new Date(technique.endDate)) 
      : startOfDay(new Date());
    
    if (isAfter(start, end)) return 0;
    
    const totalDays = differenceInDays(end, start) + 1;
    return Math.max(0, totalDays);
  }, []);

  const getTotalDayOffs = useCallback((technique: Technique) => {
    const start = startOfDay(new Date(technique.startDate));
    const end = technique.endDate 
      ? startOfDay(new Date(technique.endDate)) 
      : startOfDay(new Date());
    
    return technique.dayOffs.filter(dateStr => {
      const offDate = startOfDay(parseISO(dateStr));
      return (isSameDay(offDate, start) || isAfter(offDate, start)) && 
             (isSameDay(offDate, end) || isBefore(offDate, end));
    }).length;
  }, []);

  const getTotalRent = useCallback((technique: Technique) => {
    const totalDays = getTotalWorkingDays(technique);
    const offDays = getTotalDayOffs(technique);
    const workingDays = Math.max(0, totalDays - offDays);
    const dailyRent = getDailyRent(technique);
    return workingDays * dailyRent;
  }, [getTotalWorkingDays, getTotalDayOffs, getDailyRent]);

  const getActiveTechniques = useCallback(() => {
    return techniques.filter(t => t.status === 'active');
  }, [techniques]);

  const getEndedTechniques = useCallback(() => {
    return techniques.filter(t => t.status === 'ended');
  }, [techniques]);

  const getTotalActiveRent = useCallback(() => {
    return getActiveTechniques().reduce((sum, t) => sum + getTotalRent(t), 0);
  }, [getActiveTechniques, getTotalRent]);

  const value = useMemo(() => ({
    techniques,
    isLoading,
    addTechnique,
    updateTechnique,
    deleteTechnique,
    endTechnique,
    addDayOff,
    removeDayOff,
    toggleDayOff,
    getDailyRent,
    getTotalWorkingDays,
    getTotalDayOffs,
    getTotalRent,
    getActiveTechniques,
    getEndedTechniques,
    getTotalActiveRent,
    refreshData: fetchData,
  }), [
    techniques,
    isLoading,
    addTechnique,
    updateTechnique,
    deleteTechnique,
    endTechnique,
    addDayOff,
    removeDayOff,
    toggleDayOff,
    getDailyRent,
    getTotalWorkingDays,
    getTotalDayOffs,
    getTotalRent,
    getActiveTechniques,
    getEndedTechniques,
    getTotalActiveRent,
    fetchData,
  ]);

  return (
    <TechniquesContext.Provider value={value}>
      {children}
    </TechniquesContext.Provider>
  );
}

export function useTechniques() {
  const context = useContext(TechniquesContext);
  if (context === undefined) {
    throw new Error('useTechniques must be used within a TechniquesProvider');
  }
  return context;
}

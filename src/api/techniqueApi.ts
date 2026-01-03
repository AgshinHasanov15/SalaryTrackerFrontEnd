import { apiFetch } from './config';
import { getAuthHeaders } from './authApi';

export interface Technique {
  id: string;
  name: string;
  monthlyRent: number;
  plannedWorkingDays: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'ended';
  description?: string;
  dayOffs: string[];
  createdAt: string;
}

export interface CreateTechniqueRequest {
  name: string;
  monthlyRent: number;
  plannedWorkingDays: number;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface UpdateTechniqueRequest {
  name?: string;
  monthlyRent?: number;
  plannedWorkingDays?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
  status?: 'active' | 'ended';
  dayOffs?: string[];
}

export const techniqueApi = {
  async getAll(): Promise<Technique[]> {
    return apiFetch<Technique[]>('/techniques', {
      headers: getAuthHeaders(),
    });
  },

  async getById(id: string): Promise<Technique> {
    return apiFetch<Technique>(`/techniques/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  async create(data: CreateTechniqueRequest): Promise<Technique> {
    return apiFetch<Technique>('/techniques', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateTechniqueRequest): Promise<Technique> {
    return apiFetch<Technique>(`/techniques/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/techniques/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  async end(id: string, endDate: string): Promise<Technique> {
    return apiFetch<Technique>(`/techniques/${id}/end`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ endDate }),
    });
  },

  async toggleDayOff(id: string, date: string): Promise<Technique> {
    return apiFetch<Technique>(`/techniques/${id}/dayoffs/toggle`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ date }),
    });
  },
};

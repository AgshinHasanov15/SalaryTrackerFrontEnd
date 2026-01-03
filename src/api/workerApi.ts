import { apiFetch } from './config';
import { getAuthHeaders } from './authApi';

// Worker note type
export interface WorkerNote {
  id: string;
  title?: string;
  content: string;
  createdAt: string;
}

// Worker type matching backend
export interface Worker {
  id: string;
  name: string;           // matches backend
  position: string;
  salary?: number;        // matches backend
  description?: string;
  photo?: string;
  createdAt: string;
  notes?: WorkerNote[];
}

// Payloads for create/update
export interface CreateWorkerRequest {
  name: string;           // matches backend
  position: string;
  salary?: number;
  description?: string;
  photo?: string;
}

export interface UpdateWorkerRequest {
  name?: string;          // matches backend
  position?: string;
  salary?: number;
  description?: string;
  photo?: string;
}

// Note payloads
export interface CreateNoteRequest {
  title?: string;
  content: string;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
}

// API functions
export const workerApi = {
  // Get all workers
  async getAll(): Promise<Worker[]> {
    return apiFetch<Worker[]>('/workers', {
      headers: getAuthHeaders(),
    });
  },

  // Get one worker by id
  async getById(id: string): Promise<Worker> {
    return apiFetch<Worker>(`/workers/${id}`, {
      headers: getAuthHeaders(),
    });
  },

  // Create worker
  async create(data: CreateWorkerRequest): Promise<Worker> {
    return apiFetch<Worker>('/workers', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // Update worker
  async update(id: string, data: UpdateWorkerRequest): Promise<Worker> {
    return apiFetch<Worker>(`/workers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  // Delete worker
  async delete(id: string): Promise<void> {
    await apiFetch(`/workers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },

  // Worker Notes
  async addNote(workerId: string, data: CreateNoteRequest): Promise<WorkerNote> {
    return apiFetch<WorkerNote>(`/workers/${workerId}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  async updateNote(workerId: string, noteId: string, data: UpdateNoteRequest): Promise<WorkerNote> {
    return apiFetch<WorkerNote>(`/workers/${workerId}/notes/${noteId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  async deleteNote(workerId: string, noteId: string): Promise<void> {
    await apiFetch(`/workers/${workerId}/notes/${noteId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};

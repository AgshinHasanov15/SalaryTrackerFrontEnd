import { apiFetch } from './config';
import { getAuthHeaders } from './authApi';

export interface Payment {
  id: string;
  workerId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface CreatePaymentRequest {
  workerId: string;
  amount: number;
  date: string;
  note?: string;
}

export const paymentApi = {
  async getAll(): Promise<Payment[]> {
    return apiFetch<Payment[]>('/payments', {
      headers: getAuthHeaders(),
    });
  },

  async getByWorkerId(workerId: string): Promise<Payment[]> {
    return apiFetch<Payment[]>(`/payments?workerId=${workerId}`, {
      headers: getAuthHeaders(),
    });
  },

  async create(data: CreatePaymentRequest): Promise<Payment> {
    return apiFetch<Payment>('/payments', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    await apiFetch(`/payments/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  },
};

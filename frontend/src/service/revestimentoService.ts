import { apiClient } from './shipService';
import { Revestimento, RevestimentoRequest } from '../types';

export const revestimentoService = {
  getAll: async (): Promise<Revestimento[]> => {
    const response = await apiClient.get<Revestimento[]>('/revestimentos');
    return response.data;
  },

  getById: async (id: number): Promise<Revestimento> => {
    const response = await apiClient.get<Revestimento>(`/revestimentos/${id}`);
    return response.data;
  },

  getByNavio: async (navioId: number): Promise<Revestimento[]> => {
    const response = await apiClient.get<Revestimento[]>(`/revestimentos/navio/${navioId}`);
    return response.data;
  },

  getUltimoByNavio: async (navioId: number): Promise<Revestimento> => {
    const response = await apiClient.get<Revestimento>(`/revestimentos/navio/${navioId}/ultimo`);
    return response.data;
  },

  create: async (data: RevestimentoRequest): Promise<Revestimento> => {
    const response = await apiClient.post<Revestimento>('/revestimentos', data);
    return response.data;
  },

  update: async (id: number, data: RevestimentoRequest): Promise<Revestimento> => {
    const response = await apiClient.put<Revestimento>(`/revestimentos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/revestimentos/${id}`);
  },
};


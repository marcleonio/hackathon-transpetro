import { apiClient } from './shipService';
import { Navio, NavioRequest } from '../types';

export const navioService = {
  getAll: async (): Promise<Navio[]> => {
    const response = await apiClient.get<Navio[]>('/navios');
    return response.data;
  },

  getById: async (id: number): Promise<Navio> => {
    const response = await apiClient.get<Navio>(`/navios/${id}`);
    return response.data;
  },

  getByNome: async (nome: string): Promise<Navio> => {
    const response = await apiClient.get<Navio>(`/navios/nome/${encodeURIComponent(nome)}`);
    return response.data;
  },

  create: async (data: NavioRequest): Promise<Navio> => {
    const response = await apiClient.post<Navio>('/navios', data);
    return response.data;
  },

  update: async (id: number, data: NavioRequest): Promise<Navio> => {
    const response = await apiClient.put<Navio>(`/navios/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/navios/${id}`);
  },
};


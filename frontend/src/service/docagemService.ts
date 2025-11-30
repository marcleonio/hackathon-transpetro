import { apiClient } from './shipService';
import { Docagem, DocagemRequest } from '../types';

export const docagemService = {
  getAll: async (): Promise<Docagem[]> => {
    const response = await apiClient.get<Docagem[]>('/docagens');
    return response.data;
  },

  getById: async (id: number): Promise<Docagem> => {
    const response = await apiClient.get<Docagem>(`/docagens/${id}`);
    return response.data;
  },

  getByNavio: async (navioId: number): Promise<Docagem[]> => {
    const response = await apiClient.get<Docagem[]>(`/docagens/navio/${navioId}`);
    return response.data;
  },

  getUltimaByNavio: async (navioId: number): Promise<Docagem> => {
    const response = await apiClient.get<Docagem>(`/docagens/navio/${navioId}/ultima`);
    return response.data;
  },

  create: async (data: DocagemRequest): Promise<Docagem> => {
    const response = await apiClient.post<Docagem>('/docagens', data);
    return response.data;
  },

  update: async (id: number, data: DocagemRequest): Promise<Docagem> => {
    const response = await apiClient.put<Docagem>(`/docagens/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/docagens/${id}`);
  },
};


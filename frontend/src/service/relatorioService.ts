import { apiClient } from './shipService';
import { Relatorio, RelatorioRequest } from '../types';

export const relatorioService = {
  getAll: async (): Promise<Relatorio[]> => {
    const response = await apiClient.get<Relatorio[]>('/relatorios');
    return response.data;
  },

  getById: async (id: number): Promise<Relatorio> => {
    const response = await apiClient.get<Relatorio>(`/relatorios/${id}`);
    return response.data;
  },

  getByNavio: async (navioId: string): Promise<Relatorio[]> => {
    const response = await apiClient.get<Relatorio[]>(`/relatorios/navio/${encodeURIComponent(navioId)}`);
    return response.data;
  },

  getByTipo: async (tipo: string): Promise<Relatorio[]> => {
    const response = await apiClient.get<Relatorio[]>(`/relatorios/tipo/${tipo}`);
    return response.data;
  },

  getByStatus: async (status: string): Promise<Relatorio[]> => {
    const response = await apiClient.get<Relatorio[]>(`/relatorios/status/${status}`);
    return response.data;
  },

  getByNivel: async (nivel: number): Promise<Relatorio[]> => {
    const response = await apiClient.get<Relatorio[]>(`/relatorios/nivel/${nivel}`);
    return response.data;
  },

  getByPeriodo: async (dataInicio: string, dataFim: string): Promise<Relatorio[]> => {
    const response = await apiClient.get<Relatorio[]>('/relatorios/periodo', {
      params: { dataInicio, dataFim },
    });
    return response.data;
  },

  search: async (termo: string): Promise<Relatorio[]> => {
    const response = await apiClient.get<Relatorio[]>('/relatorios/busca', {
      params: { termo },
    });
    return response.data;
  },

  create: async (data: RelatorioRequest): Promise<Relatorio> => {
    const response = await apiClient.post<Relatorio>('/relatorios', data);
    return response.data;
  },

  update: async (id: number, data: RelatorioRequest): Promise<Relatorio> => {
    const response = await apiClient.put<Relatorio>(`/relatorios/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/relatorios/${id}`);
  },
};


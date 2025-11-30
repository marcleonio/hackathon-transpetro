import { apiClient } from './shipService';
import { Consumo, ConsumoRequest, PageResponse } from '../types';

export const consumoService = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<Consumo>> => {
    const response = await apiClient.get<PageResponse<Consumo>>('/consumos', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Consumo> => {
    const response = await apiClient.get<Consumo>(`/consumos/${id}`);
    return response.data;
  },

  getByNavio: async (navioId: number, page = 0, size = 20): Promise<PageResponse<Consumo>> => {
    const response = await apiClient.get<PageResponse<Consumo>>(`/consumos/navio/${navioId}`, {
      params: { page, size },
    });
    return response.data;
  },

  create: async (data: ConsumoRequest): Promise<Consumo> => {
    const response = await apiClient.post<Consumo>('/consumos', data);
    return response.data;
  },

  update: async (id: number, data: ConsumoRequest): Promise<Consumo> => {
    const response = await apiClient.put<Consumo>(`/consumos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/consumos/${id}`);
  },
};


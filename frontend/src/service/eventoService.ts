import { apiClient } from './shipService';
import { EventoNavegacao, EventoNavegacaoRequest, PageResponse } from '../types';

export const eventoService = {
  getAll: async (page = 0, size = 20): Promise<PageResponse<EventoNavegacao>> => {
    const response = await apiClient.get<PageResponse<EventoNavegacao>>('/eventos', {
      params: { page, size },
    });
    return response.data;
  },

  getById: async (id: number): Promise<EventoNavegacao> => {
    const response = await apiClient.get<EventoNavegacao>(`/eventos/${id}`);
    return response.data;
  },

  getByNavio: async (navioId: number, page = 0, size = 20): Promise<PageResponse<EventoNavegacao>> => {
    const response = await apiClient.get<PageResponse<EventoNavegacao>>(`/eventos/navio/${navioId}`, {
      params: { page, size },
    });
    return response.data;
  },

  getByPeriodo: async (
    navioId: number,
    start: string,
    end: string,
    page = 0,
    size = 20
  ): Promise<PageResponse<EventoNavegacao>> => {
    const response = await apiClient.get<PageResponse<EventoNavegacao>>(`/eventos/navio/${navioId}/periodo`, {
      params: { start, end, page, size },
    });
    return response.data;
  },

  create: async (data: EventoNavegacaoRequest): Promise<EventoNavegacao> => {
    const response = await apiClient.post<EventoNavegacao>('/eventos', data);
    return response.data;
  },

  update: async (id: number, data: EventoNavegacaoRequest): Promise<EventoNavegacao> => {
    const response = await apiClient.put<EventoNavegacao>(`/eventos/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/eventos/${id}`);
  },
};


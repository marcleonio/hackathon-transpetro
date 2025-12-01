import { apiClient } from './shipService';
import axios, { AxiosError } from 'axios';

export interface ImportResult {
  success: boolean;
  imported?: number;
  message: string;
}

const handleImportError = (error: unknown): ImportResult => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; success?: boolean }>;
    
    if (axiosError.response) {
      const data = axiosError.response.data;
      return {
        success: false,
        message: data?.message || `Erro ${axiosError.response.status}: ${axiosError.response.statusText}`,
      };
    }
    
    if (axiosError.request) {
      return {
        success: false,
        message: 'Sem resposta do servidor. Verifique se o backend está rodando.',
      };
    }
  }
  
  return {
    success: false,
    message: error instanceof Error ? error.message : 'Erro desconhecido na importação',
  };
};

export const dataImportService = {
  importAll: async (): Promise<ImportResult> => {
    try {
      const response = await apiClient.post<ImportResult>('/import/all');
      return response.data;
    } catch (error) {
      throw handleImportError(error);
    }
  },

  importNavios: async (file?: File): Promise<ImportResult> => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      const response = await apiClient.post<ImportResult>('/import/navios', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleImportError(error);
    }
  },

  importDocagens: async (file?: File): Promise<ImportResult> => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      const response = await apiClient.post<ImportResult>('/import/docagens', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleImportError(error);
    }
  },

  importEventos: async (file?: File): Promise<ImportResult> => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      const response = await apiClient.post<ImportResult>('/import/eventos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleImportError(error);
    }
  },

  importConsumos: async (file?: File): Promise<ImportResult> => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      const response = await apiClient.post<ImportResult>('/import/consumos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleImportError(error);
    }
  },

  importRevestimentos: async (file?: File): Promise<ImportResult> => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      const response = await apiClient.post<ImportResult>('/import/revestimentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleImportError(error);
    }
  },
};


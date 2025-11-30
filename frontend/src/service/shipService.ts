import axios, { AxiosError, AxiosResponse } from 'axios';
import { CleaningSuggestion } from '../types';
import { sanitizeCleaningSuggestion } from '../utils/validation';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const REQUEST_TIMEOUT = 60000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const BATCH_SIZE = 5;
const BATCH_DELAY = 500;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: REQUEST_TIMEOUT,
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleApiError = (error: unknown, navioId?: string): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.code === 'ECONNABORTED') {
      throw new Error(`Timeout: O servidor demorou muito para responder (${navioId})`);
    }

    if (axiosError.response) {
      const status = axiosError.response.status;
      if (status === 404) {
        throw new Error(`Navio "${navioId}" não encontrado`);
      }
      if (status === 500) {
        throw new Error(`Erro interno do servidor para "${navioId}"`);
      }
      if (status === 503) {
        throw new Error(`Servidor temporariamente indisponível (${navioId})`);
      }
      throw new Error(
        `Erro ${status}: ${axiosError.response.statusText || 'Erro desconhecido'} (${navioId})`
      );
    } else if (axiosError.request) {
      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error(`Erro de rede: Verifique se o servidor está rodando (${navioId})`);
      }
      throw new Error(`Sem resposta do servidor: Verifique sua conexão (${navioId})`);
    }
  }

  if (error instanceof Error) {
    throw error;
  }

  throw new Error(`Erro desconhecido ao comunicar com o servidor (${navioId})`);
};

const retryRequest = async <T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  navioId?: string
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      if (
        axiosError.code === 'ECONNABORTED' ||
        axiosError.code === 'ERR_NETWORK' ||
        (axiosError.response && axiosError.response.status >= 500)
      ) {
        await sleep(RETRY_DELAY);
        return retryRequest(fn, retries - 1, navioId);
      }
    }
    throw error;
  }
};

export const shipService = {
  getCleaningSuggestion: async (navioId: string): Promise<CleaningSuggestion> => {
    if (!navioId || typeof navioId !== 'string' || navioId.trim().length === 0) {
      throw new Error('ID do navio inválido');
    }

    const trimmedNavioId = navioId.trim();

    try {
      const response: AxiosResponse<CleaningSuggestion> = await retryRequest(
        () =>
          apiClient.get('/previsao/limpeza-sugerida', {
            params: { navioId: trimmedNavioId },
          }),
        MAX_RETRIES,
        trimmedNavioId
      );

      if (!response.data) {
        throw new Error('Resposta vazia do servidor');
      }

      const sanitized = sanitizeCleaningSuggestion(response.data);

      if (!sanitized) {
        throw new Error('Dados recebidos são inválidos');
      }

      return sanitized;
    } catch (error) {
      handleApiError(error, trimmedNavioId);
    }
  },

  getCleaningSuggestions: async (
    navioIds: readonly string[]
  ): Promise<Record<string, CleaningSuggestion>> => {
    const results: Record<string, CleaningSuggestion> = {};

    for (let i = 0; i < navioIds.length; i += BATCH_SIZE) {
      const batch = navioIds.slice(i, i + BATCH_SIZE);

      const batchPromises = batch.map(async (navioId) => {
        try {
          const data = await shipService.getCleaningSuggestion(navioId);
          results[navioId] = data;
        } catch (error) {
          // Silent error - handled in hook
        }
      });

      await Promise.all(batchPromises);

      if (i + BATCH_SIZE < navioIds.length) {
        await sleep(BATCH_DELAY);
      }
    }

    return results;
  },
};

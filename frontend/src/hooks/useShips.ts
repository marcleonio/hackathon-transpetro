import { useState, useEffect, useCallback } from 'react';
import { CleaningSuggestion } from '../types';
import { shipService } from '../service/shipService';
import { navioService } from '../service/navioService';
import { NAVIOS } from '../utils/constants';

interface UseShipsReturn {
  ships: Record<string, CleaningSuggestion>;
  errors: Record<string, string>;
  loading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  loadShips: () => Promise<void>;
  totalNavios: number;
}

export const useShips = (): UseShipsReturn => {
  const [ships, setShips] = useState<Record<string, CleaningSuggestion>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalNavios, setTotalNavios] = useState(0);

  const loadShips = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      let allNavios: string[] = [];

    try {
      const naviosFromDB = await navioService.getAll();
        allNavios = naviosFromDB.map(navio => navio.nome.trim());
      } catch (error) {
        // Fallback para lista hardcoded se o serviço falhar
        allNavios = [...NAVIOS];
      }
      
      // Se não houver navios do banco, usa a lista hardcoded
      if (allNavios.length === 0) {
        allNavios = [...NAVIOS];
      }
      
      setTotalNavios(allNavios.length);

      const results: Record<string, CleaningSuggestion> = {};
      const errorResults: Record<string, string> = {};

      const BATCH_SIZE = 5;
      const BATCH_DELAY = 300;

      const processBatch = async (batch: string[]) => {
        const batchPromises = batch.map(async (navioId) => {
          try {
            const data = await shipService.getCleaningSuggestion(navioId);
            if (data && data.navioId) {
            results[navioId] = data;
            } else {
              errorResults[navioId] = 'Dados inválidos recebidos';
            }
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error ? error.message : 'Erro ao carregar dados';
            errorResults[navioId] = errorMessage;
          }
        });

        await Promise.all(batchPromises);
      };

      for (let i = 0; i < allNavios.length; i += BATCH_SIZE) {
        const batch = allNavios.slice(i, i + BATCH_SIZE);
        await processBatch(batch);

        if (i + BATCH_SIZE < allNavios.length) {
          await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
        }
      }

      setShips(results);
      setErrors(errorResults);
    } catch (error) {
      console.error('Erro ao carregar navios:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const refresh = useCallback(() => loadShips(true), [loadShips]);

  useEffect(() => {
    loadShips();
  }, [loadShips]);

  return {
    ships,
    errors,
    loading,
    isRefreshing,
    refresh,
    loadShips,
    totalNavios,
  };
};

import { useState, useEffect, useCallback } from 'react';
import { CleaningSuggestion } from '../types';
import { shipService } from '../service/shipService';
import { NAVIOS } from '../utils/constants';

interface UseShipsReturn {
  ships: Record<string, CleaningSuggestion>;
  errors: Record<string, string>;
  loading: boolean;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
  loadShips: () => Promise<void>;
}

export const useShips = (): UseShipsReturn => {
  const [ships, setShips] = useState<Record<string, CleaningSuggestion>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadShips = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }

    const results: Record<string, CleaningSuggestion> = {};
    const errorResults: Record<string, string> = {};

    const BATCH_SIZE = 5;
    const BATCH_DELAY = 300;

    const processBatch = async (batch: string[]) => {
      const batchPromises = batch.map(async (navioId) => {
        try {
          const data = await shipService.getCleaningSuggestion(navioId);
          results[navioId] = data;
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erro ao carregar dados';
          errorResults[navioId] = errorMessage;
        }
      });

      await Promise.all(batchPromises);
    };

    for (let i = 0; i < NAVIOS.length; i += BATCH_SIZE) {
      const batch = NAVIOS.slice(i, i + BATCH_SIZE);
      await processBatch(batch);

      if (i + BATCH_SIZE < NAVIOS.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    }

    setShips(results);
    setErrors(errorResults);
    setLoading(false);
    setIsRefreshing(false);
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
  };
};

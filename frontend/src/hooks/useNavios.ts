import { useState, useEffect, useCallback } from 'react';
import { navioService } from '../service';
import { Navio, NavioRequest } from '../types';

export const useNavios = () => {
  const [navios, setNavios] = useState<Navio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNavios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await navioService.getAll();
      setNavios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar navios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNavios();
  }, [loadNavios]);

  const createNavio = useCallback(async (data: NavioRequest): Promise<Navio> => {
    try {
      const novoNavio = await navioService.create(data);
      await loadNavios();
      return novoNavio;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao criar navio');
    }
  }, [loadNavios]);

  const updateNavio = useCallback(async (id: number, data: NavioRequest): Promise<Navio> => {
    try {
      const navioAtualizado = await navioService.update(id, data);
      await loadNavios();
      return navioAtualizado;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao atualizar navio');
    }
  }, [loadNavios]);

  const deleteNavio = useCallback(async (id: number): Promise<void> => {
    try {
      await navioService.delete(id);
      await loadNavios();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao deletar navio');
    }
  }, [loadNavios]);

  return {
    navios,
    loading,
    error,
    loadNavios,
    createNavio,
    updateNavio,
    deleteNavio,
  };
};


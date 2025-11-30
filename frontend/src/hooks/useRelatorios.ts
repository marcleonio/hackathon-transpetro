import { useState, useEffect, useCallback } from 'react';
import { relatorioService } from '../service';
import { Relatorio, RelatorioRequest } from '../types';

export const useRelatorios = (navioId?: string) => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRelatorios = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = navioId
        ? await relatorioService.getByNavio(navioId)
        : await relatorioService.getAll();
      setRelatorios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatórios');
    } finally {
      setLoading(false);
    }
  }, [navioId]);

  useEffect(() => {
    loadRelatorios();
  }, [loadRelatorios]);

  const createRelatorio = useCallback(async (data: RelatorioRequest): Promise<Relatorio> => {
    try {
      const novoRelatorio = await relatorioService.create(data);
      await loadRelatorios();
      return novoRelatorio;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao criar relatório');
    }
  }, [loadRelatorios]);

  const updateRelatorio = useCallback(async (id: number, data: RelatorioRequest): Promise<Relatorio> => {
    try {
      const relatorioAtualizado = await relatorioService.update(id, data);
      await loadRelatorios();
      return relatorioAtualizado;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao atualizar relatório');
    }
  }, [loadRelatorios]);

  const deleteRelatorio = useCallback(async (id: number): Promise<void> => {
    try {
      await relatorioService.delete(id);
      await loadRelatorios();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao deletar relatório');
    }
  }, [loadRelatorios]);

  return {
    relatorios,
    loading,
    error,
    loadRelatorios,
    createRelatorio,
    updateRelatorio,
    deleteRelatorio,
  };
};


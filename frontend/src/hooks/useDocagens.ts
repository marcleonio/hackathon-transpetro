import { useState, useEffect, useCallback } from 'react';
import { docagemService } from '../service';
import { Docagem, DocagemRequest } from '../types';

export const useDocagens = (navioId?: number) => {
  const [docagens, setDocagens] = useState<Docagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDocagens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = navioId
        ? await docagemService.getByNavio(navioId)
        : await docagemService.getAll();
      setDocagens(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar docagens');
    } finally {
      setLoading(false);
    }
  }, [navioId]);

  useEffect(() => {
    loadDocagens();
  }, [loadDocagens]);

  const createDocagem = useCallback(async (data: DocagemRequest): Promise<Docagem> => {
    try {
      const novaDocagem = await docagemService.create(data);
      await loadDocagens();
      return novaDocagem;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao criar docagem');
    }
  }, [loadDocagens]);

  const updateDocagem = useCallback(async (id: number, data: DocagemRequest): Promise<Docagem> => {
    try {
      const docagemAtualizada = await docagemService.update(id, data);
      await loadDocagens();
      return docagemAtualizada;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao atualizar docagem');
    }
  }, [loadDocagens]);

  const deleteDocagem = useCallback(async (id: number): Promise<void> => {
    try {
      await docagemService.delete(id);
      await loadDocagens();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao deletar docagem');
    }
  }, [loadDocagens]);

  return {
    docagens,
    loading,
    error,
    loadDocagens,
    createDocagem,
    updateDocagem,
    deleteDocagem,
  };
};


import { useState, useMemo, useCallback } from 'react';
import { CleaningSuggestion } from '../types';

interface UseFiltersReturn {
  searchTerm: string;
  selectedLevel: number | null;
  setSearchTerm: (term: string) => void;
  setSelectedLevel: (level: number | null) => void;
  filteredShipIds: string[];
  clearFilters: () => void;
}

export const useFilters = (
  ships: Record<string, CleaningSuggestion>
): UseFiltersReturn => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const filteredShipIds = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    
    return Object.keys(ships).filter((navioId) => {
      const shipData = ships[navioId];

      if (!shipData) {
        return false;
      }

      if (searchLower) {
        const navioIdLower = navioId.toLowerCase();
        const statusLower = shipData.statusCascoAtual?.toLowerCase() || '';
        
        if (!navioIdLower.includes(searchLower) && !statusLower.includes(searchLower)) {
          return false;
        }
      }

      if (selectedLevel !== null) {
        if (shipData.nivelBioincrustacao !== selectedLevel) {
          return false;
        }
      }

      return true;
    });
  }, [ships, searchTerm, selectedLevel]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedLevel(null);
  }, []);

  return {
    searchTerm,
    selectedLevel,
    setSearchTerm,
    setSelectedLevel,
    filteredShipIds,
    clearFilters,
  };
};


import React from 'react';
import { Filter, ChevronDown, X } from 'lucide-react';

interface FilterPanelProps {
  selectedLevel: number | null;
  onLevelChange: (level: number | null) => void;
}

const levels = [
  { value: null, label: 'Todos os Níveis' },
  { value: 0, label: 'Nível 0 - Limpo' },
  { value: 1, label: 'Nível 1 - Atenção' },
  { value: 2, label: 'Nível 2 - Alerta' },
  { value: 3, label: 'Nível 3 - Crítico' },
  { value: 4, label: 'Nível 4 - Urgente' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedLevel,
  onLevelChange,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Filtros</h3>
        </div>
        {selectedLevel !== null && (
          <button
            onClick={() => onLevelChange(null)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Limpar filtro"
            title="Limpar filtro"
          >
            <X className="h-3.5 w-3.5 text-gray-500" />
          </button>
        )}
      </div>
      <div className="relative">
        <select
          value={selectedLevel ?? ''}
          onChange={(e) => onLevelChange(e.target.value === '' ? null : Number(e.target.value))}
          className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all cursor-pointer hover:border-gray-400"
        >
          {levels.map((level) => (
            <option key={level.value ?? 'all'} value={level.value ?? ''}>
              {level.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
      </div>
    </div>
  );
};

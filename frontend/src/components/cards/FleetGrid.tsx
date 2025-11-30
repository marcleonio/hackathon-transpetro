import React from 'react';
import { CleaningSuggestion } from '../../types';
import { ShipCard } from './ShipCard';
import { AlertCircle, Search } from 'lucide-react';

interface FleetGridProps {
  ships: Record<string, CleaningSuggestion>;
  errors: Record<string, string>;
  filteredShipIds: string[];
  onShipClick: (ship: CleaningSuggestion) => void;
}

export const FleetGrid: React.FC<FleetGridProps> = ({
  ships,
  errors,
  filteredShipIds,
  onShipClick,
}) => {
  if (filteredShipIds.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
          <Search className="h-7 w-7 text-gray-400" />
        </div>
        <p className="text-gray-900 text-base font-semibold mb-2">
          Nenhum navio encontrado
        </p>
        <p className="text-gray-500 text-sm">
          Ajuste os filtros para encontrar navios
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {filteredShipIds.map((navioId, index) => {
        const shipData = ships[navioId];
        const error = errors[navioId];

        if (error || !shipData) {
          return (
            <div
              key={navioId}
              className="bg-white rounded-xl border-2 border-red-200 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 truncate">{navioId}</h3>
              </div>
              <p className="text-sm text-red-600 font-semibold">{error || 'Dados não disponíveis'}</p>
            </div>
          );
        }

        return (
          <ShipCard
            key={navioId}
            data={shipData}
            onClick={() => onShipClick(shipData)}
            index={index}
          />
        );
      })}
    </div>
  );
};

import React, { useMemo } from 'react';
import { CleaningSuggestion } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import {
  getHPIProgressBarColor,
  getCurrentHPI,
  calculateHPIProgress,
} from '../../utils/hpiUtils';
import { formatStatus } from '../../utils/textUtils';
import { BiofoulingLevel } from '../../types';
import { Ship, Calendar, Fuel, TrendingUp, ChevronRight } from 'lucide-react';
import { cn } from '../../utils';

interface ShipListItemProps {
  data: CleaningSuggestion;
  onClick?: () => void;
}

export const ShipListItem: React.FC<ShipListItemProps> = ({ data, onClick }) => {
  const currentHPI = useMemo(() => getCurrentHPI(data.predictions), [data.predictions]);
  const progressBarColor = useMemo(
    () => getHPIProgressBarColor(currentHPI),
    [currentHPI]
  );
  const hpiProgress = useMemo(() => calculateHPIProgress(currentHPI), [currentHPI]);

  const isCritical = currentHPI >= 1.08;
  const isUrgent = data.nivelBioincrustacao >= 4;

  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer group',
        'flex items-center gap-3 p-4'
      )}
      onClick={onClick}
    >
      <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
        <Ship className="h-4 w-4 text-gray-700" />
      </div>

      <div className="flex-1 min-w-0 grid grid-cols-12 gap-3 items-center">
        <div className="col-span-12 sm:col-span-3 min-w-0">
          <h3 className="text-sm font-bold text-gray-900 truncate mb-0.5">
            {data.navioId}
          </h3>
          <p className="text-xs text-gray-500 truncate">
            {formatStatus(data.statusCascoAtual)}
          </p>
        </div>

        <div className="col-span-6 sm:col-span-2 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-gray-600">HPI:</span>
            <span
              className={cn(
                'text-sm font-bold',
                isUrgent
                  ? 'text-red-600'
                  : isCritical
                  ? 'text-orange-600'
                  : 'text-gray-900'
              )}
            >
              {currentHPI.toFixed(3)}
            </span>
          </div>
          <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden w-full">
            <div
              className={cn('h-full transition-all duration-500 rounded-full', progressBarColor)}
              style={{ width: `${hpiProgress}%` }}
            />
          </div>
        </div>

        <div className="col-span-6 sm:col-span-2 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-600 truncate">Limpeza</span>
          </div>
          <p className="text-xs font-bold text-gray-900 truncate">
            {formatDate(data.dataIdealLimpeza)}
          </p>
        </div>

        <div className="col-span-6 sm:col-span-2 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Fuel className="h-3 w-3 text-gray-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-600 truncate">CFI Limpo</span>
          </div>
          <p className="text-xs font-bold text-gray-900 truncate">
            {data.cfiCleanTonPerDay.toFixed(1)} T/d
          </p>
        </div>

        <div className="col-span-6 sm:col-span-2 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="h-3 w-3 text-red-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-red-700 truncate">Consumo Extra</span>
          </div>
          <p className="text-xs font-bold text-red-600 truncate">
            {data.maxExtraFuelTonPerDay.toFixed(2)} Ton/Dia
          </p>
        </div>

        <div className="col-span-12 sm:col-span-1 flex items-center justify-end gap-2">
          <StatusBadge level={data.nivelBioincrustacao as BiofoulingLevel} size="sm" />
          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-petrobras-blue group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
};

import React, { useMemo } from 'react';
import { CleaningSuggestion } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { HPIChart } from '../widgets/HPIChart';
import { formatDate } from '../../utils/dateUtils';
import {
  getHPIProgressBarColor,
  getCurrentHPI,
  calculateHPIProgress,
} from '../../utils/hpiUtils';
import { BiofoulingLevel } from '../../types';
import { Ship, Calendar, Fuel, TrendingUp, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils';
import { useIntersectionObserver } from '../../hooks/useAnimation';

interface ShipCardProps {
  data: CleaningSuggestion;
  isLoading?: boolean;
  onClick?: () => void;
  index?: number;
}

const CHART_HEIGHT = 160;
const HPI_DISPLAY_DECIMALS = 3;

export const ShipCard: React.FC<ShipCardProps> = ({
  data,
  isLoading = false,
  onClick,
  index = 0,
}) => {
  const { ref, hasIntersected } = useIntersectionObserver();
  const currentHPI = useMemo(() => getCurrentHPI(data.predictions), [data.predictions]);
  const progressBarColor = useMemo(
    () => getHPIProgressBarColor(currentHPI),
    [currentHPI]
  );
  const hpiProgress = useMemo(() => calculateHPIProgress(currentHPI), [currentHPI]);

  const isCritical = currentHPI >= 1.08;
  const isUrgent = data.nivelBioincrustacao >= 4;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(hasIntersected && 'animate-fade-in-up')}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div
        className={cn(
          'bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden h-full flex flex-col',
          'hover:border-gray-300'
        )}
        onClick={onClick}
      >
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-3 bg-gray-100 rounded-xl flex-shrink-0">
                <Ship className="h-5 w-5 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-900 truncate">
                  {data.navioId}
                </h3>
              </div>
            </div>
            <StatusBadge level={data.nivelBioincrustacao as BiofoulingLevel} size="md" />
          </div>

          {isUrgent && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-800 leading-relaxed">
                Ação urgente necessária - Limpeza imediata recomendada
              </p>
            </div>
          )}

          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                HPI Atual
              </span>
              <span
                className={cn(
                  'text-2xl font-bold',
                  isUrgent
                    ? 'text-red-600'
                    : isCritical
                    ? 'text-orange-600'
                    : 'text-gray-900'
                )}
              >
                {currentHPI.toFixed(HPI_DISPLAY_DECIMALS)}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className={cn('h-full transition-all duration-500 rounded-full', progressBarColor)}
                style={{ width: `${hpiProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
              <span>1.00</span>
              <span className="text-red-600">1.08</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">Limpeza</span>
              </div>
              <p className="text-sm font-bold text-gray-900 truncate">
                {formatDate(data.dataIdealLimpeza)}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">CFI Limpo</span>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {data.cfiCleanTonPerDay.toFixed(1)} T/d
              </p>
            </div>

            <div className="col-span-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-red-600" />
                <span className="text-xs font-bold text-red-700 uppercase tracking-wide">Consumo Extra Máx</span>
              </div>
              <p className="text-base font-bold text-red-600">
                {data.maxExtraFuelTonPerDay.toFixed(2)} Ton/Dia
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-gray-200">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">
              Projeção HPI (90 dias)
            </h4>
            <div className="h-40 rounded-lg overflow-hidden bg-gray-50 p-2 border border-gray-200">
              <HPIChart predictions={data.predictions} height={CHART_HEIGHT} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

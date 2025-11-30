import React, { useMemo } from 'react';
import { CleaningSuggestion } from '../../types';
import { Clock, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { getCurrentHPI } from '../../utils/hpiUtils';
import { HPI_CONSTANTS } from '../../utils/hpiUtils';
import { cn } from '../../utils';

interface RecentActivityProps {
  ships: Record<string, CleaningSuggestion>;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ ships }) => {
  const criticalShips = useMemo(() => {
    return Object.values(ships)
      .filter((ship) => {
        const currentHPI = getCurrentHPI(ship.predictions);
        return currentHPI >= HPI_CONSTANTS.LEVEL_2_MAX;
      })
      .sort((a, b) => {
        const hpiA = getCurrentHPI(a.predictions);
        const hpiB = getCurrentHPI(b.predictions);
        return hpiB - hpiA;
      })
      .slice(0, 5);
  }, [ships]);

  if (criticalShips.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-200">
          <Clock className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Alertas Recentes</h3>
        </div>
        <p className="text-xs text-gray-500">Nenhum alerta no momento</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-200">
        <Clock className="h-4 w-4 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Alertas Recentes</h3>
      </div>
      <div className="space-y-2.5">
        {criticalShips.map((ship) => {
          const currentHPI = getCurrentHPI(ship.predictions);
          const isUrgent = currentHPI >= HPI_CONSTANTS.CRITICAL_LIMIT;

          return (
            <div
              key={ship.navioId}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                isUrgent
                  ? 'bg-red-50 border-red-200'
                  : 'bg-orange-50 border-orange-200'
              )}
            >
              <div
                className={cn(
                  'p-1.5 rounded-lg flex-shrink-0',
                  isUrgent ? 'bg-red-100' : 'bg-orange-100'
                )}
              >
                <AlertTriangle
                  className={cn('h-3.5 w-3.5', isUrgent ? 'text-red-600' : 'text-orange-600')}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 truncate mb-1">
                  {ship.navioId}
                </p>
                <p className="text-xs text-gray-600">
                  HPI: {currentHPI.toFixed(3)} • {formatDate(ship.dataIdealLimpeza)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

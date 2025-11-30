import React, { useMemo } from 'react';
import { CleaningSuggestion } from '../../types';
import { Ship, AlertTriangle, CheckCircle, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '../../utils';
import { useIntersectionObserver } from '../../hooks/useAnimation';

interface FleetOverviewProps {
  ships: Record<string, CleaningSuggestion>;
  totalNavios: number;
}

export const FleetOverview: React.FC<FleetOverviewProps> = ({ ships, totalNavios }) => {
  const { ref, hasIntersected } = useIntersectionObserver();
  const shipArray = Object.values(ships).filter(s => s !== null && s !== undefined);
  const totalShips = totalNavios || shipArray.length;
  const criticalShips = shipArray.filter((s) => s && s.nivelBioincrustacao >= 3).length;
  const cleanShips = shipArray.filter((s) => s && s.nivelBioincrustacao <= 1).length;
  const totalExtraFuel = shipArray.reduce((sum, s) => sum + (s?.maxExtraFuelTonPerDay || 0), 0);

  const metrics = useMemo(
    () => [
      {
        label: 'Total de Navios',
        value: totalShips,
        icon: Ship,
        color: 'blue',
        trend: null,
      },
      {
        label: 'Navios Críticos',
        value: criticalShips,
        icon: AlertTriangle,
        color: 'red',
        trend: {
          value: totalShips > 0 ? (criticalShips / totalShips) * 100 : 0,
          isPositive: false,
        },
      },
      {
        label: 'Navios Limpos',
        value: cleanShips,
        icon: CheckCircle,
        color: 'green',
        trend: {
          value: totalShips > 0 ? (cleanShips / totalShips) * 100 : 0,
          isPositive: true,
        },
      },
      {
        label: 'Consumo Extra Total',
        value: `${totalExtraFuel.toFixed(1)}`,
        unit: 'Ton/dia',
        icon: TrendingUp,
        color: 'yellow',
        trend: null,
      },
    ],
    [totalShips, criticalShips, cleanShips, totalExtraFuel]
  );

  const iconColors = {
    blue: 'text-petrobras-blue bg-blue-50',
    red: 'text-red-600 bg-red-50',
    green: 'text-petrobras-green bg-green-50',
    yellow: 'text-petrobras-yellow bg-yellow-50',
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
    >
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        const colorKey = metric.color as keyof typeof iconColors;
        return (
          <div
            key={index}
            className={cn(
              'bg-white rounded-xl border border-gray-200 p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md',
              hasIntersected && 'animate-fade-in-up'
            )}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn('p-3 rounded-lg', iconColors[colorKey])}>
                <Icon className="h-5 w-5" />
              </div>
              {metric.trend && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full',
                    metric.trend.isPositive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {metric.trend.isPositive ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{metric.trend.value.toFixed(1)}%</span>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                {metric.label}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl lg:text-3xl font-bold text-gray-900">
                  {metric.value}
                </p>
                {metric.unit && (
                  <p className="text-sm font-medium text-gray-500">{metric.unit}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

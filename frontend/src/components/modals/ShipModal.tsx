import React, { useMemo, useCallback } from 'react';
import { CleaningSuggestion } from '../../types';
import { X, Ship, Calendar, Fuel, TrendingUp, Info } from 'lucide-react';
import {
  formatFullDate,
  calculateDaysUntil,
  getDaysUntilDescription,
} from '../../utils/dateUtils';
import {
  getHPIProgressBarColor,
  getCurrentHPI,
  calculateHPIProgress,
  HPI_CONSTANTS,
} from '../../utils/hpiUtils';
import { formatStatus } from '../../utils/textUtils';
import { BiofoulingLevel } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { HPIChart } from '../widgets/HPIChart';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../utils';

interface ShipModalProps {
  data: CleaningSuggestion;
  isOpen: boolean;
  onClose: () => void;
}

const MODAL_CHART_HEIGHT = 320;
const HPI_DISPLAY_DECIMALS = 3;

export const ShipModal: React.FC<ShipModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const daysUntilCleaning = useMemo(
    () => calculateDaysUntil(data.dataIdealLimpeza),
    [data.dataIdealLimpeza]
  );

  const currentHPI = useMemo(() => getCurrentHPI(data.predictions), [data.predictions]);
  const progressBarColor = useMemo(
    () => getHPIProgressBarColor(currentHPI),
    [currentHPI]
  );
  const hpiProgress = useMemo(
    () => calculateHPIProgress(currentHPI),
    [currentHPI]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-gradient-to-r from-petrobras-blue to-blue-600 text-white p-4 sm:p-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Ship className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold truncate">{data.navioId}</h2>
                <p className="text-blue-100 text-xs sm:text-sm truncate">
                  {formatStatus(data.statusCascoAtual)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 flex-shrink-0"
              aria-label="Fechar"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-center animate-fade-in-up">
            <StatusBadge level={data.nivelBioincrustacao as BiofoulingLevel} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Card className="border-l-4 border-l-petrobras-blue animate-fade-in-up stagger-1">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-petrobras-blue flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Limpeza Sugerida
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatFullDate(data.dataIdealLimpeza)}
                </p>
                {data.diasParaIntervencao > 0 ? (
                  <p className="text-xs text-gray-500 mt-1">
                    {data.diasParaIntervencao} dias para intervenção
                  </p>
                ) : daysUntilCleaning !== null ? (
                  <p className="text-xs text-gray-500 mt-1">
                    {getDaysUntilDescription(daysUntilCleaning)}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-petrobras-green animate-fade-in-up stagger-2">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <Fuel className="h-4 w-4 sm:h-5 sm:w-5 text-petrobras-green flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600">CFI Limpo</span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {data.cfiCleanTonPerDay.toFixed(2)} Ton/Dia
                </p>
                <p className="text-xs text-gray-500 mt-1">Consumo ideal</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500 animate-fade-in-up stagger-3">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-600">
                    Consumo Extra Máx
                  </span>
                </div>
                <p className="text-lg sm:text-xl font-bold text-red-600">
                  {data.maxExtraFuelTonPerDay.toFixed(2)} Ton/Dia
                </p>
                <p className="text-xs text-gray-500 mt-1">Perda estimada</p>
              </CardContent>
            </Card>
          </div>

          {data.dataUltimaLimpeza && (
            <Card className="bg-green-50/50 border-green-200 animate-fade-in-up stagger-4">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-petrobras-green flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                      Última Limpeza
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-700">
                      {formatFullDate(data.dataUltimaLimpeza)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50/50 border-blue-200 animate-fade-in-up stagger-4">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-petrobras-blue mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                    Justificativa
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-700">{data.justificativa}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up stagger-5">
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Projeção Completa de HPI (180 dias)
              </h3>
              <div className="h-64 sm:h-80">
                <HPIChart
                  predictions={data.predictions}
                  height={MODAL_CHART_HEIGHT}
                  showLimit={true}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up stagger-6">
            <CardContent className="p-3 sm:p-4">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">HPI Atual</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="text-3xl sm:text-4xl font-bold text-gray-900">
                  {currentHPI.toFixed(HPI_DISPLAY_DECIMALS)}
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full transition-all duration-500 rounded-full', progressBarColor)}
                      style={{ width: `${hpiProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{HPI_CONSTANTS.IDEAL}</span>
                    <span>{HPI_CONSTANTS.CRITICAL_LIMIT}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

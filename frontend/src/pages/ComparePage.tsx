import React, { useState, useMemo } from 'react';
import { useShips } from '../hooks/useShips';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { InfoTooltip } from '../components/ui/InfoTooltip';
import { X, Calendar, Ship } from 'lucide-react';
import { cn } from '../utils';
import { CleaningSuggestion, BiofoulingLevel } from '../types';
import { getCurrentHPI } from '../utils/hpiUtils';
import { formatDate } from '../utils/dateUtils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { formatShortDate } from '../utils/dateUtils';

interface ComparePageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const { ships, loading } = useShips();
  const [selectedShips, setSelectedShips] = useState<string[]>([]);

  const availableShips = useMemo(() => {
    return Object.values(ships)
      .map((ship) => ({
        id: ship.navioId,
        name: ship.navioId,
        hpi: getCurrentHPI(ship.predictions),
        level: ship.nivelBioincrustacao,
      }))
      .sort((a, b) => b.hpi - a.hpi);
  }, [ships]);

  const selectedShipData = useMemo(() => {
    return selectedShips
      .map((id) => {
        const ship = Object.values(ships).find((s) => s.navioId === id);
        return ship;
      })
      .filter((ship): ship is CleaningSuggestion => ship !== undefined);
  }, [selectedShips, ships]);

  const comparisonChartData = useMemo(() => {
    if (selectedShipData.length === 0) return [];

    const minDays = Math.min(90, ...selectedShipData.map((s) => s.predictions.length));
    const data: Array<Record<string, string | number | null>> = [];

    for (let day = 0; day < minDays; day++) {
      const point: Record<string, string | number | null> = {
        day,
        date: selectedShipData[0].predictions[day]?.data || '',
      };

      selectedShipData.forEach((ship) => {
        const prediction = ship.predictions[day];
        if (prediction) {
          point[ship.navioId] = Number(prediction.hpi.toFixed(3));
        } else {
          point[ship.navioId] = null;
        }
      });

      data.push(point);
    }

    return data;
  }, [selectedShipData]);

  const handleAddShip = (shipId: string) => {
    if (selectedShips.length < 3 && !selectedShips.includes(shipId)) {
      setSelectedShips([...selectedShips, shipId]);
    }
  };

  const handleRemoveShip = (shipId: string) => {
    setSelectedShips(selectedShips.filter((id) => id !== shipId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-semibold">Carregando dados da frota</p>
        </div>
      </div>
    );
  }

  const colors = ['#3b82f6', '#ef4444', '#10b981'];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        onViewChange={onViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={onClose}
        onToggle={onToggle}
      />
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          isOpen && !isMobile ? 'lg:ml-72' : 'lg:ml-20',
          isMobile && 'ml-0'
        )}
      >
        <Header
          searchTerm=""
          onSearchChange={() => {}}
          onMenuToggle={onToggle}
          isSidebarOpen={isOpen}
        />
        <main className="p-6 lg:p-8 xl:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 animate-fadeInUp">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Comparação de Navios
              </h1>
              <p className="text-sm text-gray-600">
                Compare até 3 navios lado a lado para análise detalhada
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-1">
                <Card className="p-4 animate-slideIn" style={{ animationDelay: '0.1s' }}>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Selecionar Navios</h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {availableShips.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">Nenhum navio disponível</p>
                    ) : (
                      availableShips.map((ship) => {
                        const isSelected = selectedShips.includes(ship.id);
                        const isDisabled = !isSelected && selectedShips.length >= 3;
                        
                        return (
                          <button
                            key={ship.id}
                            onClick={() => {
                              if (isSelected) {
                                handleRemoveShip(ship.id);
                              } else if (!isDisabled) {
                                handleAddShip(ship.id);
                              }
                            }}
                            disabled={isDisabled && !isSelected}
                            className={cn(
                              'w-full text-left p-3 rounded-lg border transition-all duration-200',
                              isSelected
                                ? 'bg-petrobras-blue/10 border-petrobras-blue shadow-sm hover:bg-petrobras-blue/20'
                                : isDisabled
                                ? 'bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed'
                                : 'bg-white border-gray-200 hover:border-petrobras-blue hover:bg-blue-50 hover:shadow-sm'
                            )}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-semibold text-gray-900 truncate flex-1">
                                {ship.name}
                              </span>
                              <StatusBadge level={ship.level as BiofoulingLevel} size="sm" />
                            </div>
                            <p className="text-xs text-gray-500">HPI: {ship.hpi.toFixed(3)}</p>
                          </button>
                        );
                      })
                    )}
                  </div>
                </Card>
              </div>

              <div className="lg:col-span-3">
                {selectedShipData.length === 0 ? (
                  <Card className="p-12 text-center animate-scaleIn" style={{ animationDelay: '0.2s' }}>
                    <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Ship className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Selecione navios para comparar
                    </h3>
                    <p className="text-sm text-gray-600">
                      Escolha até 3 navios da lista ao lado para iniciar a comparação
                    </p>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 flex-wrap animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                      {selectedShipData.map((ship, index) => (
                        <div
                          key={ship.navioId}
                          className="flex items-center gap-2 bg-white border-2 border-gray-200 rounded-lg px-4 py-2.5 shadow-sm animate-scaleIn"
                          style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                        >
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: colors[index] }}
                          />
                          <span className="text-sm font-semibold text-gray-900">
                            {ship.navioId}
                          </span>
                          <button
                            onClick={() => handleRemoveShip(ship.navioId)}
                            className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                            aria-label="Remover navio"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {selectedShipData.map((ship, index) => {
                        const currentHPI = getCurrentHPI(ship.predictions);
                        const isUrgent = ship.nivelBioincrustacao >= 4;
                        const isCritical = ship.nivelBioincrustacao >= 3;

                        return (
                          <Card
                            key={ship.navioId}
                            className={cn(
                              'p-6 border-2 hover:shadow-lg transition-all duration-200 animate-fadeInUp',
                              isUrgent && 'border-l-4 border-l-red-500',
                              isCritical && !isUrgent && 'border-l-4 border-l-orange-500'
                            )}
                            style={{ animationDelay: `${0.4 + index * 0.15}s` }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div
                                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-base flex-shrink-0"
                                  style={{ backgroundColor: colors[index] }}
                                >
                                  {index + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-base font-bold text-gray-900 truncate mb-1">
                                    {ship.navioId}
                                  </h3>
                                  <StatusBadge
                                    level={ship.nivelBioincrustacao as BiofoulingLevel}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-1">
                                    <p className="text-xs font-semibold text-gray-600">HPI Atual</p>
                                    <InfoTooltip
                                      title="Como é calculado o HPI?"
                                      content="HPI = Consumo Real / Consumo Ideal (CFI Limpo). Valores acima de 1.0 indicam ineficiência devido à bioincrustação. Calculado a partir do primeiro dia da projeção (dia 0)."
                                    />
                                  </div>
                                </div>
                                <p className={cn(
                                  'text-2xl font-bold',
                                  isUrgent ? 'text-red-600' : isCritical ? 'text-orange-600' : 'text-gray-900'
                                )}>
                                  {currentHPI.toFixed(3)}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 gap-3">
                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  <p className="text-xs font-semibold text-gray-600 mb-1">CFI Limpo</p>
                                  <p className="text-lg font-bold text-gray-900">
                                    {ship.cfiCleanTonPerDay.toFixed(1)} T/d
                                  </p>
                                </div>

                                <div className="p-3 bg-white rounded-lg border border-gray-200">
                                  <p className="text-xs font-semibold text-gray-600 mb-1">Consumo Extra</p>
                                  <p className="text-lg font-bold text-orange-600">
                                    {ship.maxExtraFuelTonPerDay.toFixed(2)} Ton/d
                                  </p>
                                </div>
                              </div>

                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <Calendar className="h-4 w-4" />
                                  <span className="font-semibold">Data Limpeza:</span>
                                </div>
                                <p className="text-sm font-bold text-gray-900">
                                  {ship.dataIdealLimpeza ? formatDate(ship.dataIdealLimpeza) : 'N/A'}
                                </p>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>

                          <Card className="p-6 animate-scaleIn" style={{ animationDelay: '0.5s' }}>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-bold text-gray-900">
                                Comparação de HPI (90 dias)
                              </h3>
                        <InfoTooltip
                          title="Como funciona a comparação?"
                          content="O gráfico mostra a projeção de HPI para os próximos 90 dias baseada no modelo de regressão linear OLS. Cada linha representa um navio, permitindo comparar a evolução da degradação do casco ao longo do tempo."
                        />
                      </div>
                      {comparisonChartData.length > 0 ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={comparisonChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis
                                dataKey="date"
                                stroke="#6b7280"
                                fontSize={10}
                                tickFormatter={(value) => formatShortDate(value)}
                                interval="preserveStartEnd"
                              />
                              <YAxis
                                stroke="#6b7280"
                                fontSize={10}
                                domain={[0.95, 'auto']}
                                tickFormatter={(value) => value.toFixed(2)}
                              />
                              <Tooltip
                                labelFormatter={(value) => formatShortDate(value)}
                                formatter={(value: unknown) => {
                                  if (value === null || value === undefined) return 'N/A';
                                  return typeof value === 'number' ? value.toFixed(3) : String(value);
                                }}
                              />
                              <ReferenceLine
                                y={1.08}
                                stroke="#dc2626"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                label={{ value: 'Limite Crítico (1.08)', position: 'insideTopRight', fill: '#dc2626', fontSize: 10 }}
                              />
                              <ReferenceLine
                                y={1.0}
                                stroke="#00b21e"
                                strokeWidth={2}
                                strokeDasharray="3 3"
                                opacity={0.7}
                                label={{ value: 'HPI Ideal (1.0)', position: 'insideTopRight', fill: '#00b21e', fontSize: 10 }}
                              />
                              <Legend />
                              {selectedShipData.map((ship, index) => (
                                <Line
                                  key={ship.navioId}
                                  type="monotone"
                                  dataKey={ship.navioId}
                                  stroke={colors[index]}
                                  strokeWidth={2.5}
                                  dot={false}
                                  name={ship.navioId}
                                  connectNulls={false}
                                />
                              ))}
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-80 flex items-center justify-center text-gray-500">
                          <p>Dados insuficientes para comparação</p>
                        </div>
                      )}
                    </Card>

                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

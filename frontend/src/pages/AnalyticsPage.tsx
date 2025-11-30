import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShips } from '../hooks/useShips';
import { useSidebar } from '../hooks/useSidebar';
import { useIntersectionObserver } from '../hooks/useAnimation';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Download, Filter, Calendar, Zap } from 'lucide-react';
import { cn } from '../utils';
import { getCurrentHPI } from '../utils/hpiUtils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { exportToCSV } from '../utils/exportUtils';
import { Button } from '../components/ui/Button';
import { formatDate } from '../utils/dateUtils';

interface AnalyticsPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const COLORS = ['#00b21e', '#fceb0f', '#f59e0b', '#ea580c', '#dc2626'];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { ships, loading } = useShips();
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'critical' | 'clean'>('all');
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const analytics = useMemo(() => {
    const shipArray = Object.values(ships);
    const levelCounts = [0, 0, 0, 0, 0];
    let totalHPI = 0;
    let totalExtraFuel = 0;
    let totalCFI = 0;

    shipArray.forEach((ship) => {
      const level = ship.nivelBioincrustacao;
      if (level >= 0 && level <= 4) {
        levelCounts[level]++;
      }
      const currentHPI = getCurrentHPI(ship.predictions);
      totalHPI += currentHPI;
      totalExtraFuel += ship.maxExtraFuelTonPerDay;
      totalCFI += ship.cfiCleanTonPerDay;
    });

    const avgHPI = shipArray.length > 0 ? totalHPI / shipArray.length : 0;
    const criticalShips = shipArray.filter((s) => s.nivelBioincrustacao >= 3).length;
    const cleanShips = shipArray.filter((s) => s.nivelBioincrustacao <= 1).length;
    const urgentShips = shipArray.filter((s) => s.nivelBioincrustacao >= 4).length;

    return {
      levelCounts,
      avgHPI,
      totalExtraFuel,
      totalCFI,
      criticalShips,
      cleanShips,
      urgentShips,
      totalShips: shipArray.length,
    };
  }, [ships]);

  const distributionData = [
    { name: 'Limpo', value: analytics.levelCounts[0], color: COLORS[0] },
    { name: 'Atenção', value: analytics.levelCounts[1], color: COLORS[1] },
    { name: 'Alerta', value: analytics.levelCounts[2], color: COLORS[2] },
    { name: 'Crítico', value: analytics.levelCounts[3], color: COLORS[3] },
    { name: 'Urgente', value: analytics.levelCounts[4], color: COLORS[4] },
  ];

  const hpiTrendData = useMemo(() => {
    let filteredShips = Object.values(ships);
    
    if (selectedPeriod === 'critical') {
      filteredShips = filteredShips.filter((s) => s.nivelBioincrustacao >= 3);
    } else if (selectedPeriod === 'clean') {
      filteredShips = filteredShips.filter((s) => s.nivelBioincrustacao <= 1);
    }

    return filteredShips
      .map((ship) => ({
        name: ship.navioId.substring(0, 10),
        hpi: getCurrentHPI(ship.predictions),
        navioId: ship.navioId,
      }))
      .sort((a, b) => b.hpi - a.hpi)
      .slice(0, 20);
  }, [ships, selectedPeriod]);

  const topCriticalShips = useMemo(() => {
    return Object.values(ships)
      .filter((s) => s.nivelBioincrustacao >= 3)
      .sort((a, b) => {
        const hpiA = getCurrentHPI(a.predictions);
        const hpiB = getCurrentHPI(b.predictions);
        return hpiB - hpiA;
      })
      .slice(0, 10);
  }, [ships]);

  const handleExportAnalytics = () => {
    const exportData = Object.values(ships).map((ship) => {
      const currentHPI = getCurrentHPI(ship.predictions);
      return {
        navioId: ship.navioId,
        nivelBioincrustacao: ship.nivelBioincrustacao,
        hpiAtual: currentHPI.toFixed(3),
        dataLimpeza: ship.dataIdealLimpeza ? formatDate(ship.dataIdealLimpeza) : 'N/A',
        cfiLimpo: ship.cfiCleanTonPerDay.toFixed(2),
        consumoExtra: ship.maxExtraFuelTonPerDay.toFixed(2),
      };
    });

    const csvContent = [
      ['Navio ID', 'Nível', 'HPI Atual', 'Data Limpeza', 'CFI Limpo', 'Consumo Extra'].join(','),
      ...exportData.map((row) => Object.values(row).map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-semibold">Carregando análises</p>
        </div>
      </div>
    );
  }

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
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <BarChart3 className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                      Análises e Relatórios
                    </h1>
                    <p className="text-sm text-gray-600">
                      Análise detalhada da performance da frota
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleExportAnalytics}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Exportar Relatório
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-5 animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-petrobras-blue" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">HPI Médio</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{analytics.avgHPI.toFixed(3)}</p>
                <p className="text-xs text-gray-500 mt-1">Média da frota</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">Navios Críticos</span>
                </div>
                <p className="text-2xl font-bold text-red-600">{analytics.criticalShips}</p>
                <p className="text-xs text-gray-500 mt-1">{analytics.urgentShips} urgentes</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">Navios Limpos</span>
                </div>
                <p className="text-2xl font-bold text-green-600">{analytics.cleanShips}</p>
                <p className="text-xs text-gray-500 mt-1">{((analytics.cleanShips / analytics.totalShips) * 100).toFixed(1)}% da frota</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-5 animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span className="text-xs font-semibold text-gray-600 uppercase">Consumo Extra Total</span>
                </div>
                <p className="text-2xl font-bold text-orange-600">{analytics.totalExtraFuel.toFixed(1)} Ton/dia</p>
                <p className="text-xs text-gray-500 mt-1">Total da frota</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-slideIn" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Distribuição por Nível</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 animate-slideIn" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Top Navios por HPI</h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedPeriod}
                      onChange={(e) => setSelectedPeriod(e.target.value as 'all' | 'critical' | 'clean')}
                      className="text-xs px-2 py-1 border border-gray-300 rounded-lg text-gray-700"
                    >
                      <option value="all">Todos</option>
                      <option value="critical">Críticos</option>
                      <option value="clean">Limpos</option>
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  {chartType === 'bar' ? (
                    <BarChart data={hpiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#6b7280" fontSize={10} />
                      <Tooltip />
                      <Bar dataKey="hpi" fill="#3248fc" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={hpiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={10} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#6b7280" fontSize={10} />
                      <Tooltip />
                      <Line type="monotone" dataKey="hpi" stroke="#3248fc" strokeWidth={2} dot={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setChartType('bar')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-lg transition-colors',
                      chartType === 'bar' ? 'bg-petrobras-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Barras
                  </button>
                  <button
                    onClick={() => setChartType('line')}
                    className={cn(
                      'px-3 py-1 text-xs rounded-lg transition-colors',
                      chartType === 'line' ? 'bg-petrobras-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    Linha
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 animate-scaleIn" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Navios Críticos - Ação Necessária</h3>
              <div className="space-y-3">
                {topCriticalShips.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum navio crítico no momento</p>
                ) : (
                  topCriticalShips.map((ship, index) => {
                    const currentHPI = getCurrentHPI(ship.predictions);
                    return (
                      <div
                        key={ship.navioId}
                        onClick={() => navigate(`/ship/${encodeURIComponent(ship.navioId)}`)}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-petrobras-blue hover:shadow-md transition-all cursor-pointer animate-fadeInUp"
                        style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-red-600">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{ship.navioId}</p>
                            <p className="text-xs text-gray-500">HPI: {currentHPI.toFixed(3)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-red-600">
                            {ship.maxExtraFuelTonPerDay.toFixed(2)} Ton/dia
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(ship.dataIdealLimpeza)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Insights e Recomendações</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="font-semibold text-blue-900 mb-1">Consumo Extra Total</p>
                    <p className="text-sm text-blue-700 mb-2">
                      A frota está consumindo <strong>{analytics.totalExtraFuel.toFixed(1)} Ton/dia</strong> de combustível extra devido à bioincrustação.
                    </p>
                    <p className="text-xs text-blue-600 italic">
                      Baseado no consumo extra máximo de todos os navios da frota
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="font-semibold text-yellow-900 mb-1">Prioridade de Ação</p>
                    <p className="text-sm text-yellow-700">
                      {analytics.urgentShips} navio(s) requerem ação imediata para evitar perdas significativas.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="font-semibold text-green-900 mb-1">Status da Frota</p>
                    <p className="text-sm text-green-700">
                      {analytics.cleanShips} navio(s) estão em condições ideais ({((analytics.cleanShips / analytics.totalShips) * 100).toFixed(1)}% da frota).
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Métricas de Performance</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Consumo Extra Total</span>
                    <span className="text-lg font-bold text-gray-900">{analytics.totalExtraFuel.toFixed(1)} Ton/dia</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">CFI Médio</span>
                    <span className="text-lg font-bold text-gray-900">
                      {analytics.totalShips > 0 ? (analytics.totalCFI / analytics.totalShips).toFixed(1) : 0} Ton/dia
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-semibold text-gray-700">Taxa de Navios Críticos</span>
                    <span className="text-lg font-bold text-red-600">
                      {analytics.totalShips > 0 ? ((analytics.criticalShips / analytics.totalShips) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

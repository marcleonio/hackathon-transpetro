import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShips } from '../hooks/useShips';
import { useSidebar } from '../hooks/useSidebar';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { HPIChart } from '../components/widgets/HPIChart';
import { StatusBadge } from '../components/ui/StatusBadge';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import {
  Ship,
  ArrowLeft,
  Calendar,
  Fuel,
  TrendingUp,
  Bell,
  MessageSquare,
  Settings,
  User,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../utils';
import { formatFullDate, calculateDaysUntil } from '../utils/dateUtils';
import { getCurrentHPI, getHPIProgressBarColor, calculateHPIProgress, HPI_CONSTANTS } from '../utils/hpiUtils';
import { formatStatus } from '../utils/textUtils';
import { BiofoulingLevel } from '../types';
import { Button } from '../components/ui/Button';

interface ShipDetailPageProps {
  shipId: string;
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const ShipDetailPage: React.FC<ShipDetailPageProps> = ({
  shipId,
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { ships, loading } = useShips();
  const [activeTab, setActiveTab] = useState<'overview' | 'notifications' | 'messages' | 'settings'>('overview');
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'warning', message: 'HPI acima do limite crítico', date: new Date(), read: false },
    { id: 2, type: 'info', message: 'Limpeza recomendada em 15 dias', date: new Date(), read: false },
  ]);
  const [messages, setMessages] = useState([
    { id: 1, from: 'Sistema', subject: 'Alerta de HPI', body: 'O HPI deste navio está acima do limite crítico.', date: new Date() },
  ]);

  const decodedShipId = decodeURIComponent(shipId).trim();
  
  const ship = ships[decodedShipId] || 
               ships[decodedShipId.toUpperCase()] || 
               ships[decodedShipId.toLowerCase()] ||
               Object.values(ships).find(s => 
                 s.navioId.toLowerCase() === decodedShipId.toLowerCase() ||
                 s.navioId.toUpperCase() === decodedShipId.toUpperCase() ||
                 s.navioId.trim().toLowerCase() === decodedShipId.toLowerCase()
               );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600 font-semibold">Carregando dados do navio</p>
        </div>
      </div>
    );
  }

  if (!ship) {
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
        <div className={cn('flex-1 transition-all duration-300', isOpen && !isMobile ? 'lg:ml-72' : 'lg:ml-20', isMobile && 'ml-0')}>
          <Header
            searchTerm=""
            onSearchChange={() => {}}
            onMenuToggle={onToggle}
            isSidebarOpen={isOpen}
          />
          <main className="p-6 lg:p-8 xl:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Navio não encontrado</h2>
                <p className="text-gray-600 mb-2">
                  O navio <span className="font-semibold text-gray-900">{decodedShipId}</span> não foi encontrado na base de dados.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                  Verifique se o ID do navio está correto ou tente buscar na lista completa.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button
                    onClick={() => navigate('/fleet')}
                    variant="default"
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    Ver Todas as Frotas
                  </Button>
                  <Button
                    onClick={() => navigate(-1)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentHPI = getCurrentHPI(ship.predictions);
  const progressBarColor = getHPIProgressBarColor(currentHPI);
  const hpiProgress = calculateHPIProgress(currentHPI);
  const daysUntil = ship.dataIdealLimpeza ? calculateDaysUntil(ship.dataIdealLimpeza) : null;
  const isUrgent = ship.nivelBioincrustacao >= 4;
  const isCritical = currentHPI >= HPI_CONSTANTS.CRITICAL_LIMIT;

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
            <button
              onClick={() => navigate('/fleet')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-semibold">Voltar para Frota</span>
            </button>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8 mb-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gray-100 rounded-xl">
                    <Ship className="h-8 w-8 text-gray-700" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{ship.navioId}</h1>
                    <p className="text-sm text-gray-600 mb-3">{formatStatus(ship.statusCascoAtual)}</p>
                    <StatusBadge level={ship.nivelBioincrustacao as BiofoulingLevel} size="lg" />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-b border-gray-200 mb-6 overflow-x-auto">
                {(['overview', 'notifications', 'messages', 'settings'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'px-4 py-2 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap',
                      activeTab === tab
                        ? 'border-petrobras-blue text-petrobras-blue'
                        : 'border-transparent text-gray-600 hover:text-gray-900'
                    )}
                  >
                    {tab === 'overview' && 'Visão Geral'}
                    {tab === 'notifications' && 'Notificações'}
                    {tab === 'messages' && 'Mensagens'}
                    {tab === 'settings' && 'Configurações'}
                  </button>
                ))}
              </div>

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {isUrgent && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900 mb-1">Ação Urgente Necessária</p>
                        <p className="text-sm text-red-700">Limpeza imediata recomendada para este navio.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-600 uppercase">HPI Atual</span>
                      </div>
                      <p className={cn('text-2xl font-bold', isUrgent ? 'text-red-600' : isCritical ? 'text-orange-600' : 'text-gray-900')}>
                        {currentHPI.toFixed(3)}
                      </p>
                      <div className="h-2 bg-gray-200 rounded-full mt-2">
                        <div className={cn('h-full rounded-full', progressBarColor)} style={{ width: `${hpiProgress}%` }} />
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-600 uppercase">Limpeza Recomendada</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{formatFullDate(ship.dataIdealLimpeza)}</p>
                      {ship.diasParaIntervencao > 0 ? (
                        <p className="text-xs text-gray-500 mt-1">{ship.diasParaIntervencao} dias para intervenção</p>
                      ) : daysUntil !== null ? (
                        <p className="text-xs text-gray-500 mt-1">{daysUntil} dias restantes</p>
                      ) : null}
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Fuel className="h-4 w-4 text-gray-600" />
                        <span className="text-xs font-semibold text-gray-600 uppercase">CFI Limpo</span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">{ship.cfiCleanTonPerDay.toFixed(1)} Ton/dia</p>
                    </div>
                  </div>

                  {ship.dataUltimaLimpeza && (
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-semibold text-green-700 uppercase">Última Limpeza</span>
                      </div>
                      <p className="text-lg font-bold text-green-900">{formatFullDate(ship.dataUltimaLimpeza)}</p>
                    </div>
                  )}

                  <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-700">Consumo Extra Máximo</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600">{ship.maxExtraFuelTonPerDay.toFixed(2)} Ton/Dia</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Projeção HPI (90 dias)</h3>
                    <div className="h-80">
                      <HPIChart predictions={ship.predictions} height={320} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={cn(
                        'p-4 rounded-lg border',
                        notif.read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">{notif.message}</p>
                          <p className="text-xs text-gray-500">{notif.date.toLocaleString('pt-BR')}</p>
                        </div>
                        {!notif.read && (
                          <button
                            onClick={() => setNotifications(notifications.map(n => n.id === notif.id ? { ...n, read: true } : n))}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Marcar como lida
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'messages' && (
                <div className="space-y-3">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{msg.from}</p>
                          <p className="text-sm text-gray-600">{msg.subject}</p>
                        </div>
                        <span className="text-xs text-gray-500">{msg.date.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-2">{msg.body}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Configurações do Navio</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Limite de Alerta HPI</label>
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={HPI_CONSTANTS.CRITICAL_LIMIT}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Frequência de Notificações</label>
                        <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue">
                          <option>Diária</option>
                          <option>Semanal</option>
                          <option>Mensal</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

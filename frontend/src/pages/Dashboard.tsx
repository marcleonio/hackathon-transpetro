import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useShips } from '../hooks/useShips';
import { useFilters } from '../hooks/useFilters';
import { useSidebar } from '../hooks/useSidebar';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { FleetOverview } from '../components/widgets/FleetOverview';
import { AnalyticsWidget } from '../components/widgets/AnalyticsWidget';
import { RecentActivity } from '../components/widgets/RecentActivity';
import { FleetGrid } from '../components/cards/FleetGrid';
import { ShipModal } from '../components/modals/ShipModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { AlertCircle, Activity, ArrowRight, Ship, TrendingUp } from 'lucide-react';
import { cn } from '../utils';
import { FleetPage } from './FleetPage';
import { AnalyticsPage } from './AnalyticsPage';
import { ComparePage } from './ComparePage';
import { ShipDetailPage } from './ShipDetailPage';
import { SettingsPage } from './SettingsPage';
import { NaviosPage } from './NaviosPage';
import { NavioFormPage } from './NavioFormPage';
import { RelatoriosPage } from './RelatoriosPage';
import { RelatorioFormPage } from './RelatorioFormPage';
import { DocagensPage } from './DocagensPage';
import { DocagemFormPage } from './DocagemFormPage';
import { Button } from '../components/ui/Button';
import { CleaningSuggestion } from '../types';
import { getCurrentHPI } from '../utils/hpiUtils';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState(() => {
    if (location.pathname.startsWith('/ship/')) return 'ship-detail';
    if (location.pathname === '/fleet') return 'fleet';
    if (location.pathname === '/analytics') return 'analytics';
    if (location.pathname === '/compare') return 'compare';
    if (location.pathname === '/settings') return 'settings';
    if (location.pathname.startsWith('/navios')) return 'navios';
    if (location.pathname.startsWith('/relatorios')) return 'relatorios';
    if (location.pathname.startsWith('/docagens')) return 'docagens';
    return 'dashboard';
  });
  const { isOpen, isMobile, toggle, close } = useSidebar();
  const { ships, errors, loading, totalNavios } = useShips();
  const { searchTerm, setSearchTerm } = useFilters(ships);
  const [selectedShip, setSelectedShip] = useState<CleaningSuggestion | null>(null);

  const topShips = useMemo(() => {
    const validShips = Object.entries(ships)
      .filter(([, ship]) => {
        if (!ship) return false;
        if (!ship.predictions || ship.predictions.length === 0) return false;
        try {
          const hpi = getCurrentHPI(ship.predictions);
          return !isNaN(hpi) && isFinite(hpi);
        } catch {
          return false;
        }
      })
      .sort(([, a], [, b]) => {
        try {
          const hpiA = getCurrentHPI(a.predictions);
          const hpiB = getCurrentHPI(b.predictions);
          return hpiB - hpiA;
        } catch {
          return 0;
        }
      })
      .slice(0, 6)
      .map(([navioId]) => navioId);
    
    return validShips;
  }, [ships]);

  useEffect(() => {
    if (location.pathname.startsWith('/ship/')) {
      setActiveView('ship-detail');
    } else if (location.pathname === '/fleet') {
      setActiveView('fleet');
    } else if (location.pathname === '/analytics') {
      setActiveView('analytics');
    } else if (location.pathname === '/compare') {
      setActiveView('compare');
    } else if (location.pathname === '/settings') {
      setActiveView('settings');
    } else     if (location.pathname.startsWith('/navios')) {
      setActiveView('navios');
    } else if (location.pathname.startsWith('/relatorios')) {
      setActiveView('relatorios');
    } else if (location.pathname.startsWith('/docagens')) {
      setActiveView('docagens');
    } else if (location.pathname === '/') {
      setActiveView('dashboard');
    }
  }, [location.pathname, activeView]);

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (view === 'fleet') {
      navigate('/fleet');
    } else if (view === 'analytics') {
      navigate('/analytics');
    } else if (view === 'compare') {
      navigate('/compare');
    } else if (view === 'settings') {
      navigate('/settings');
    } else if (view === 'navios') {
      navigate('/navios');
    } else if (view === 'relatorios') {
      navigate('/relatorios');
    } else if (view === 'docagens') {
      navigate('/docagens');
    } else {
      navigate('/');
    }
  };

  const handleShipClick = (ship: CleaningSuggestion) => {
    navigate(`/ship/${encodeURIComponent(ship.navioId)}`);
  };

  if (activeView === 'fleet') {
    return (
      <FleetPage
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
    );
  }

  if (activeView === 'analytics') {
    return (
      <AnalyticsPage
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
    );
  }

  if (activeView === 'compare') {
    return (
      <ComparePage
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
    );
  }


  if (activeView === 'settings') {
    return (
      <SettingsPage
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
    );
  }

  if (location.pathname.startsWith('/navios')) {
    if (location.pathname === '/navios/novo' || location.pathname.match(/^\/navios\/\d+$/)) {
      return (
        <NavioFormPage
          activeView="navios"
          onViewChange={handleViewChange}
          isOpen={isOpen}
          isMobile={isMobile}
          onClose={close}
          onToggle={toggle}
        />
      );
    }
    return (
      <NaviosPage
        activeView="navios"
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
    );
  }

  if (location.pathname.startsWith('/relatorios')) {
    if (location.pathname === '/relatorios/novo' || location.pathname.match(/^\/relatorios\/\d+$/)) {
      return (
        <RelatorioFormPage
          activeView="relatorios"
          onViewChange={handleViewChange}
          isOpen={isOpen}
          isMobile={isMobile}
          onClose={close}
          onToggle={toggle}
        />
      );
    }
    return (
      <RelatoriosPage
        activeView="relatorios"
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
    );
  }

  if (location.pathname.startsWith('/docagens')) {
    if (location.pathname === '/docagens/novo' || location.pathname.match(/^\/docagens\/\d+$/)) {
      return (
        <DocagemFormPage
          activeView="docagens"
          onViewChange={handleViewChange}
          isOpen={isOpen}
          isMobile={isMobile}
          onClose={close}
          onToggle={toggle}
        />
      );
    }
    return (
      <DocagensPage
        activeView="docagens"
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
    );
  }

  if (location.pathname.startsWith('/ship/')) {
    const encodedShipId = location.pathname.split('/ship/')[1];
    const shipId = encodedShipId ? decodeURIComponent(encodedShipId) : '';
    return (
      <ShipDetailPage
        shipId={shipId}
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
    );
  }

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeView={activeView}
        onViewChange={handleViewChange}
        isOpen={isOpen}
        isMobile={isMobile}
        onClose={close}
        onToggle={toggle}
      />
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          isOpen && !isMobile ? 'lg:ml-72' : 'lg:ml-20',
          isMobile && 'ml-0'
        )}
      >
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onMenuToggle={toggle}
          isSidebarOpen={isOpen}
        />
        <main className="p-6 lg:p-8 xl:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    {new Date().toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                    Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Visão geral da performance e status da frota
                  </p>
                </div>
                <Button
                  onClick={() => handleViewChange('fleet')}
                  variant="default"
                  className="hidden sm:flex items-center gap-2"
                >
                  Ver Todas as Frotas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mb-8">
              <FleetOverview ships={ships} totalNavios={totalNavios} />
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="mb-8 bg-yellow-50 border-l-4 border-petrobras-yellow p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-yellow-900 mb-1">
                      {Object.keys(errors).length} navio(s) com erro ao carregar dados
                    </p>
                    <p className="text-xs text-yellow-700">
                      Alguns navios podem não estar disponíveis no momento
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <div className="lg:col-span-8">
                <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Activity className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-0.5">
                        Análise de Distribuição
                      </h2>
                      <p className="text-xs text-gray-500">
                        Distribuição de navios por nível de bioincrustação
                      </p>
                    </div>
                  </div>
                  <AnalyticsWidget ships={ships} />
                </section>
              </div>

              <div className="lg:col-span-4">
                <RecentActivity ships={ships} />
              </div>
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-gradient-to-br from-petrobras-blue/10 to-blue-100/50 rounded-2xl">
                    <TrendingUp className="w-7 h-7 text-petrobras-blue" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      Navios em Destaque
                    </h2>
                    <p className="text-sm text-gray-600">
                      {topShips.length > 0 
                        ? `${topShips.length} navio(s) com maior HPI requerendo atenção imediata`
                        : 'Carregando navios...'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleViewChange('fleet')}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  Ver Todas as Frotas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              {topShips.length > 0 ? (
                <FleetGrid
                  ships={ships}
                  errors={errors}
                  filteredShipIds={topShips}
                  onShipClick={handleShipClick}
                />
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Ship className="h-10 w-10 text-gray-400" />
                  </div>
                  <p className="text-gray-700 font-semibold text-lg mb-2">Carregando navios em destaque</p>
                  <p className="text-sm text-gray-500">Aguarde enquanto os dados são carregados</p>
                </div>
              )}
            </div>

            {selectedShip && (
              <ShipModal
                data={selectedShip}
                isOpen={!!selectedShip}
                onClose={() => setSelectedShip(null)}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

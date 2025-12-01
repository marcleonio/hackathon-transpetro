import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CleaningSuggestion } from '../types';
import { useShips } from '../hooks/useShips';
import { useFilters } from '../hooks/useFilters';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { FleetGrid } from '../components/cards/FleetGrid';
import { ShipListItem } from '../components/cards/ShipListItem';
import { FilterPanel } from '../components/widgets/FilterPanel';
import { ShipModal } from '../components/modals/ShipModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Ship, Download, Filter, Grid3x3, List, X } from 'lucide-react';
import { cn } from '../utils';
import { exportToCSV } from '../utils/exportUtils';

interface FleetPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

type ViewMode = 'grid' | 'list';

export const FleetPage: React.FC<FleetPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { ships, errors, loading, totalNavios } = useShips();
  const {
    searchTerm,
    selectedLevel,
    setSearchTerm,
    setSelectedLevel,
    filteredShipIds,
    clearFilters,
  } = useFilters(ships);
  const [selectedShip, setSelectedShip] = useState<CleaningSuggestion | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const handleShipClick = (ship: CleaningSuggestion) => {
    navigate(`/ship/${encodeURIComponent(ship.navioId)}`);
  };

  const handleExport = () => {
    const filteredShips: Record<string, CleaningSuggestion> = {};
    filteredShipIds.forEach((id) => {
      if (ships[id]) {
        filteredShips[id] = ships[id];
      }
    });
    exportToCSV(filteredShips, 'frota-filtrada');
  };

  const hasActiveFilters = searchTerm.trim() !== '' || selectedLevel !== null;

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

  const totalShips = totalNavios || Object.keys(ships).length;
  const criticalShips = Object.values(ships).filter((s) => s.nivelBioincrustacao >= 3).length;

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
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onMenuToggle={onToggle}
          isSidebarOpen={isOpen}
        />
        <main className="p-6 lg:p-8 xl:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Ship className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                      Frota Completa
                    </h1>
                    <p className="text-sm text-gray-600">
                      Gerencie e monitore todos os navios da frota
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        viewMode === 'grid'
                          ? 'bg-petrobras-blue text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                      aria-label="Visualização em grade"
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={cn(
                        'p-2 rounded-lg transition-colors',
                        viewMode === 'list'
                          ? 'bg-petrobras-blue text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      )}
                      aria-label="Visualização em lista"
                    >
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-700"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Exportar</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Total de Navios
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{totalShips}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Navios Críticos
                  </p>
                  <p className="text-2xl font-bold text-red-600">{criticalShips}</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">
                    Resultados
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{filteredShipIds.length}</p>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mb-4 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-gray-600">Filtros ativos:</span>
                  {searchTerm.trim() && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                      Busca: {searchTerm}
                      <button
                        onClick={() => setSearchTerm('')}
                        className="hover:bg-blue-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  {selectedLevel !== null && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold">
                      Nível: {selectedLevel}
                      <button
                        onClick={() => setSelectedLevel(null)}
                        className="hover:bg-blue-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-600 hover:text-gray-900 font-semibold underline"
                  >
                    Limpar todos
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-9">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 lg:p-8">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 mb-1">
                        {filteredShipIds.length} navio(s) encontrado(s)
                      </h2>
                      <p className="text-sm text-gray-500">
                        {totalShips} navio(s) no total
                      </p>
                    </div>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className="lg:hidden flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold text-gray-700"
                    >
                      <Filter className="h-4 w-4" />
                      <span>Filtros</span>
                    </button>
                  </div>
                  {viewMode === 'grid' ? (
                    <FleetGrid
                      ships={ships}
                      errors={errors}
                      filteredShipIds={filteredShipIds}
                      onShipClick={handleShipClick}
                    />
                  ) : (
                    <div className="space-y-3">
                      {filteredShipIds.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-gray-600 font-semibold mb-2">Nenhum navio encontrado</p>
                          <p className="text-sm text-gray-500">Tente ajustar os filtros de busca</p>
                        </div>
                      ) : (
                        filteredShipIds.map((navioId) => {
                          const shipData = ships[navioId];
                          const error = errors[navioId];

                          if (error || !shipData) {
                            return null;
                          }

                          return (
                            <ShipListItem
                              key={navioId}
                              data={shipData}
                              onClick={() => handleShipClick(shipData)}
                            />
                          );
                        })
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div
                className={cn(
                  'lg:col-span-3',
                  showFilters ? 'block' : 'hidden lg:block'
                )}
              >
                <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
                  {showFilters && (
                    <div className="lg:hidden mb-4 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-900">Filtros</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="p-1 hover:bg-gray-100 rounded-lg"
                      >
                        <X className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  <FilterPanel
                    selectedLevel={selectedLevel}
                    onLevelChange={setSelectedLevel}
                  />
                </div>
              </div>
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

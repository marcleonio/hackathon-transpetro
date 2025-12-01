import React from 'react';
import { Home, Ship, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, GitCompare, FileText, Anchor, Wrench } from 'lucide-react';
import { cn } from '../../utils';
import { SilecLogo } from '../ui/SilecLogo';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'fleet', label: 'Frota', icon: Ship },
  { id: 'analytics', label: 'Analíticos', icon: BarChart3 },
  { id: 'compare', label: 'Comparar', icon: GitCompare },
  { id: 'navios', label: 'Navios', icon: Anchor },
  { id: 'docagens', label: 'Docagens', icon: Wrench },
  { id: 'relatorios', label: 'Relatórios', icon: FileText },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  return (
    <>
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'bg-white border-r border-gray-100 h-screen fixed left-0 top-0 overflow-y-auto flex flex-col transition-all duration-300 z-50',
          isOpen ? 'w-72' : 'w-20',
          isMobile && !isOpen && '-translate-x-full',
          isMobile && isOpen && 'translate-x-0'
        )}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="mb-6 relative">
            <div className={cn('flex items-center gap-2', !isOpen && 'justify-center')}>
              {isOpen ? (
                <SilecLogo size="md" showText={true} />
              ) : (
                <SilecLogo size="sm" showText={false} />
              )}
            </div>
            {!isMobile && (
              <button
                onClick={onToggle}
                className={cn(
                  'absolute top-0 right-0 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 hover:border-petrobras-blue transition-all duration-200 z-10',
                  !isOpen && 'hidden'
                )}
                aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'}
              >
                <ChevronLeft className="h-3 w-3 text-gray-600" />
              </button>
            )}
          </div>

          {!isMobile && !isOpen && (
            <button
              onClick={onToggle}
              className="absolute top-6 -right-3 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 hover:border-petrobras-blue transition-all duration-200 z-10"
              aria-label="Expandir menu"
            >
              <ChevronRight className="h-3 w-3 text-gray-600" />
            </button>
          )}

          <nav className="flex-1 space-y-2">
            {isOpen && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
                Menu
              </p>
            )}
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    if (isMobile) onClose();
                  }}
                  className={cn(
                    'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 relative group',
                    isActive
                      ? 'bg-gradient-to-r from-petrobras-blue to-blue-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-50',
                    !isOpen && 'justify-center px-0'
                  )}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-transform duration-200 flex-shrink-0',
                      isActive
                        ? 'text-white scale-110'
                        : 'text-gray-500 group-hover:text-petrobras-blue group-hover:scale-110'
                    )}
                  />
                  {isOpen && (
                    <span className="animate-fade-in truncate flex-1">{item.label}</span>
                  )}
                  {isActive && isOpen && (
                    <div className="absolute right-4 w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
            {isOpen && (
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
                Geral
              </p>
            )}
            <button
              onClick={() => onViewChange('settings')}
              className={cn(
                'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 group',
                !isOpen && 'justify-center px-0'
              )}
              title={!isOpen ? 'Configurações' : undefined}
            >
              <Settings className="h-5 w-5 text-gray-500 group-hover:text-petrobras-blue group-hover:rotate-90 transition-all duration-200 flex-shrink-0" />
              {isOpen && <span>Configurações</span>}
            </button>
            <button
              className={cn(
                'w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 group',
                !isOpen && 'justify-center px-0'
              )}
              title={!isOpen ? 'Sair' : undefined}
            >
              <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-500 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
              {isOpen && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

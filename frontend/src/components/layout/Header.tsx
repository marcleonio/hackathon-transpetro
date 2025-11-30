import React from 'react';
import { Search, Bell, MessageSquare, User, Menu } from 'lucide-react';

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  onMenuToggle,
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-10 py-4 lg:py-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 lg:gap-4 flex-1">
            <button
              onClick={onMenuToggle}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 lg:hidden"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 max-w-md lg:max-w-lg">
              <div className="relative group">
                <Search className="absolute left-3 lg:left-5 top-1/2 transform -translate-y-1/2 h-4 w-4 lg:h-5 lg:w-5 text-gray-400 group-focus-within:text-petrobras-blue transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar navio..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 lg:pl-14 pr-4 py-2.5 lg:py-3.5 border-2 border-gray-200 rounded-xl lg:rounded-2xl focus:outline-none focus:ring-2 focus:ring-petrobras-blue/20 focus:border-petrobras-blue bg-gray-50/50 text-sm font-medium transition-all hover:border-gray-300"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4">
            <button className="p-2 lg:p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 relative group hover:scale-110 hidden sm:flex">
              <MessageSquare className="h-5 w-5 group-hover:text-petrobras-blue group-hover:rotate-12 transition-all duration-200" />
            </button>
            <button className="p-2 lg:p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 relative group hover:scale-110">
              <Bell className="h-5 w-5 group-hover:text-petrobras-blue group-hover:animate-pulse" />
              <span className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 w-2 h-2 lg:w-2.5 lg:h-2.5 bg-petrobras-yellow rounded-full border-2 border-white shadow-sm animate-pulse" />
            </button>
            <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-5 border-l-2 border-gray-100">
              <div className="w-9 h-9 lg:w-11 lg:h-11 bg-gradient-to-br from-petrobras-blue to-blue-600 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200">
                <User className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs lg:text-sm font-bold text-gray-900">Admin</p>
                <p className="text-xs text-gray-500 font-medium hidden lg:block">admin@transpetro.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

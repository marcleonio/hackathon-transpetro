import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Settings, User, Bell, Shield, Database, Save } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../components/ui/Button';

interface SettingsPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'data'>('profile');
  const [profile, setProfile] = useState({
    name: 'Admin',
    email: 'admin@transpetro.com',
    role: 'Administrador',
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: false,
    criticalOnly: true,
  });

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
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Settings className="w-6 h-6 text-gray-700" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                    Configurações
                  </h1>
                  <p className="text-sm text-gray-600">
                    Gerencie suas preferências e configurações da conta
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex border-b border-gray-200">
                {([
                  { id: 'profile', label: 'Perfil', icon: User },
                  { id: 'notifications', label: 'Notificações', icon: Bell },
                  { id: 'security', label: 'Segurança', icon: Shield },
                  { id: 'data', label: 'Dados', icon: Database },
                ] as const).map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex-1 px-6 py-4 text-sm font-semibold border-b-2 transition-colors flex items-center justify-center gap-2',
                        activeTab === tab.id
                          ? 'border-petrobras-blue text-petrobras-blue bg-blue-50/50'
                          : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="p-6 lg:p-8">
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Informações do Perfil</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nome</label>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Função</label>
                          <input
                            type="text"
                            value={profile.role}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                    <Button className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Preferências de Notificação</h3>
                      <div className="space-y-4">
                        {Object.entries(notifications).map(([key, value]) => (
                          <label key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <span className="text-sm font-semibold text-gray-700">
                              {key === 'email' && 'Notificações por Email'}
                              {key === 'push' && 'Notificações Push'}
                              {key === 'sms' && 'Notificações por SMS'}
                              {key === 'criticalOnly' && 'Apenas Alertas Críticos'}
                            </span>
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => setNotifications({ ...notifications, [key]: e.target.checked })}
                              className="w-5 h-5 text-petrobras-blue rounded focus:ring-petrobras-blue"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                    <Button className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Salvar Preferências
                    </Button>
                  </div>
                )}

                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Segurança da Conta</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Senha Atual</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nova Senha</label>
                          <input
                            type="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue"
                          />
                        </div>
                      </div>
                    </div>
                    <Button className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Atualizar Senha
                    </Button>
                  </div>
                )}

                {activeTab === 'data' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Gerenciamento de Dados</h3>
                      <div className="space-y-4">
                        <div className="p-4 border border-gray-200 rounded-lg">
                          <p className="text-sm font-semibold text-gray-900 mb-2">Exportar Dados</p>
                          <p className="text-xs text-gray-600 mb-3">Baixe todos os seus dados em formato CSV</p>
                          <Button variant="outline" size="sm">Exportar Dados</Button>
                        </div>
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                          <p className="text-sm font-semibold text-red-900 mb-2">Excluir Conta</p>
                          <p className="text-xs text-red-700 mb-3">Esta ação não pode ser desfeita</p>
                          <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                            Excluir Conta
                          </Button>
                        </div>
                      </div>
                    </div>
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


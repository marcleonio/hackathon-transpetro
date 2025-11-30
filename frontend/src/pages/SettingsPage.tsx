import React, { useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Settings, User, Bell, Shield, Database, Save, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { cn } from '../utils';
import { Button } from '../components/ui/Button';
import { dataImportService, ImportResult } from '../service/dataImportService';
import { Card } from '../components/ui/Card';

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
  const [importing, setImporting] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<Record<string, ImportResult>>({});
  const [searchTerm, setSearchTerm] = useState('');

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
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Importação de Dados CSV</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Importe dados dos arquivos CSV padrão do sistema para o banco de dados
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <Card className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Navios</h4>
                              <p className="text-xs text-gray-600">Importa dados de navios do arquivo CSV</p>
                            </div>
                          </div>
                          {importResults.navios && (
                            <div className={cn(
                              "mb-3 p-2 rounded-lg flex items-center gap-2 text-sm",
                              importResults.navios.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                            )}>
                              {importResults.navios.success ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              <span>{importResults.navios.message}</span>
                            </div>
                          )}
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".csv"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setImporting('navios');
                                try {
                                  const result = await dataImportService.importNavios(file);
                                  setImportResults({ ...importResults, navios: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    navios: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                  e.target.value = '';
                                }
                              }}
                              disabled={importing === 'navios'}
                              className="hidden"
                              id="navios-file-input"
                            />
                            <label
                              htmlFor="navios-file-input"
                              className={cn(
                                "w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                importing === 'navios'
                                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                  : "border-gray-300 hover:border-petrobras-blue hover:bg-blue-50"
                              )}
                            >
                              {importing === 'navios' ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  <span className="text-sm font-medium">Importando...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm font-medium">Selecionar arquivo CSV</span>
                                </>
                              )}
                            </label>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                setImporting('navios');
                                try {
                                  const result = await dataImportService.importNavios();
                                  setImportResults({ ...importResults, navios: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    navios: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                }
                              }}
                              disabled={importing === 'navios'}
                              className="w-full"
                            >
                              Usar arquivo padrão
                            </Button>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Docagens</h4>
                              <p className="text-xs text-gray-600">Importa dados de docagens do arquivo CSV</p>
                            </div>
                          </div>
                          {importResults.docagens && (
                            <div className={cn(
                              "mb-3 p-2 rounded-lg flex items-center gap-2 text-sm",
                              importResults.docagens.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                            )}>
                              {importResults.docagens.success ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              <span>{importResults.docagens.message}</span>
                            </div>
                          )}
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".csv"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setImporting('docagens');
                                try {
                                  const result = await dataImportService.importDocagens(file);
                                  setImportResults({ ...importResults, docagens: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    docagens: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                  e.target.value = '';
                                }
                              }}
                              disabled={importing === 'docagens'}
                              className="hidden"
                              id="docagens-file-input"
                            />
                            <label
                              htmlFor="docagens-file-input"
                              className={cn(
                                "w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                importing === 'docagens'
                                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                  : "border-gray-300 hover:border-petrobras-blue hover:bg-blue-50"
                              )}
                            >
                              {importing === 'docagens' ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  <span className="text-sm font-medium">Importando...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm font-medium">Selecionar arquivo CSV</span>
                                </>
                              )}
                            </label>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                setImporting('docagens');
                                try {
                                  const result = await dataImportService.importDocagens();
                                  setImportResults({ ...importResults, docagens: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    docagens: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                }
                              }}
                              disabled={importing === 'docagens'}
                              className="w-full"
                            >
                              Usar arquivo padrão
                            </Button>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Eventos</h4>
                              <p className="text-xs text-gray-600">Importa eventos de navegação do arquivo CSV</p>
                            </div>
                          </div>
                          {importResults.eventos && (
                            <div className={cn(
                              "mb-3 p-2 rounded-lg flex items-center gap-2 text-sm",
                              importResults.eventos.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                            )}>
                              {importResults.eventos.success ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              <span>{importResults.eventos.message}</span>
                            </div>
                          )}
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".csv"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setImporting('eventos');
                                try {
                                  const result = await dataImportService.importEventos(file);
                                  setImportResults({ ...importResults, eventos: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    eventos: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                  e.target.value = '';
                                }
                              }}
                              disabled={importing === 'eventos'}
                              className="hidden"
                              id="eventos-file-input"
                            />
                            <label
                              htmlFor="eventos-file-input"
                              className={cn(
                                "w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                importing === 'eventos'
                                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                  : "border-gray-300 hover:border-petrobras-blue hover:bg-blue-50"
                              )}
                            >
                              {importing === 'eventos' ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  <span className="text-sm font-medium">Importando...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm font-medium">Selecionar arquivo CSV</span>
                                </>
                              )}
                            </label>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                setImporting('eventos');
                                try {
                                  const result = await dataImportService.importEventos();
                                  setImportResults({ ...importResults, eventos: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    eventos: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                }
                              }}
                              disabled={importing === 'eventos'}
                              className="w-full"
                            >
                              Usar arquivo padrão
                            </Button>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Consumos</h4>
                              <p className="text-xs text-gray-600">Importa consumos do arquivo CSV</p>
                            </div>
                          </div>
                          {importResults.consumos && (
                            <div className={cn(
                              "mb-3 p-2 rounded-lg flex items-center gap-2 text-sm",
                              importResults.consumos.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                            )}>
                              {importResults.consumos.success ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              <span>{importResults.consumos.message}</span>
                            </div>
                          )}
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".csv"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setImporting('consumos');
                                try {
                                  const result = await dataImportService.importConsumos(file);
                                  setImportResults({ ...importResults, consumos: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    consumos: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                  e.target.value = '';
                                }
                              }}
                              disabled={importing === 'consumos'}
                              className="hidden"
                              id="consumos-file-input"
                            />
                            <label
                              htmlFor="consumos-file-input"
                              className={cn(
                                "w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                importing === 'consumos'
                                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                  : "border-gray-300 hover:border-petrobras-blue hover:bg-blue-50"
                              )}
                            >
                              {importing === 'consumos' ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  <span className="text-sm font-medium">Importando...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm font-medium">Selecionar arquivo CSV</span>
                                </>
                              )}
                            </label>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                setImporting('consumos');
                                try {
                                  const result = await dataImportService.importConsumos();
                                  setImportResults({ ...importResults, consumos: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    consumos: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                }
                              }}
                              disabled={importing === 'consumos'}
                              className="w-full"
                            >
                              Usar arquivo padrão
                            </Button>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-1">Revestimentos</h4>
                              <p className="text-xs text-gray-600">Importa revestimentos do arquivo CSV</p>
                            </div>
                          </div>
                          {importResults.revestimentos && (
                            <div className={cn(
                              "mb-3 p-2 rounded-lg flex items-center gap-2 text-sm",
                              importResults.revestimentos.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                            )}>
                              {importResults.revestimentos.success ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <AlertCircle className="h-4 w-4" />
                              )}
                              <span>{importResults.revestimentos.message}</span>
                            </div>
                          )}
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".csv"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                setImporting('revestimentos');
                                try {
                                  const result = await dataImportService.importRevestimentos(file);
                                  setImportResults({ ...importResults, revestimentos: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    revestimentos: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                  e.target.value = '';
                                }
                              }}
                              disabled={importing === 'revestimentos'}
                              className="hidden"
                              id="revestimentos-file-input"
                            />
                            <label
                              htmlFor="revestimentos-file-input"
                              className={cn(
                                "w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
                                importing === 'revestimentos'
                                  ? "border-gray-300 bg-gray-50 cursor-not-allowed"
                                  : "border-gray-300 hover:border-petrobras-blue hover:bg-blue-50"
                              )}
                            >
                              {importing === 'revestimentos' ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  <span className="text-sm font-medium">Importando...</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4" />
                                  <span className="text-sm font-medium">Selecionar arquivo CSV</span>
                                </>
                              )}
                            </label>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={async () => {
                                setImporting('revestimentos');
                                try {
                                  const result = await dataImportService.importRevestimentos();
                                  setImportResults({ ...importResults, revestimentos: result });
                                  if (result.success && result.imported !== undefined) {
                                    setTimeout(() => {
                                      window.location.reload();
                                    }, 2000);
                                  }
                                } catch (error) {
                                  const errorResult = error as ImportResult;
                                  setImportResults({
                                    ...importResults,
                                    revestimentos: errorResult
                                  });
                                } finally {
                                  setImporting(null);
                                }
                              }}
                              disabled={importing === 'revestimentos'}
                              className="w-full"
                            >
                              Usar arquivo padrão
                            </Button>
                          </div>
                        </Card>
                      </div>

                      <Card className="p-4 bg-petrobras-blue/5 border-petrobras-blue/20">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">Importar Todos</h4>
                            <p className="text-xs text-gray-600">Importa todos os arquivos CSV padrão de uma vez</p>
                          </div>
                        </div>
                        {importResults.all && (
                          <div className={cn(
                            "mb-3 p-2 rounded-lg flex items-center gap-2 text-sm",
                            importResults.all.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                          )}>
                            {importResults.all.success ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <AlertCircle className="h-4 w-4" />
                            )}
                            <span>{importResults.all.message}</span>
                          </div>
                        )}
                        <Button
                          size="sm"
                          onClick={async () => {
                            setImporting('all');
                            try {
                              const result = await dataImportService.importAll();
                              setImportResults({ ...importResults, all: result });
                              if (result.success) {
                                setTimeout(() => {
                                  window.location.reload();
                                }, 2000);
                              }
                            } catch (error) {
                              const errorResult = error as ImportResult;
                              setImportResults({
                                ...importResults,
                                all: errorResult
                              });
                            } finally {
                              setImporting(null);
                            }
                          }}
                          disabled={importing === 'all'}
                          className="w-full"
                        >
                          {importing === 'all' ? (
                            <>
                              <Loader className="h-4 w-4 mr-2 animate-spin" />
                              Importando todos...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Importar Todos os CSVs
                            </>
                          )}
                        </Button>
                      </Card>
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


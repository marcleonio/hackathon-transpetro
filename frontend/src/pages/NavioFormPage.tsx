import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useNavios } from '../hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';
import { NavioRequest } from '../types';
import { cn } from '../utils';

interface NavioFormPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const NavioFormPage: React.FC<NavioFormPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { navios, loading, createNavio, updateNavio } = useNavios();
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<NavioRequest>({
    nome: '',
    classe: '',
    tipo: '',
    porteBruto: 0,
    comprimentoTotal: undefined,
    boca: undefined,
    calado: undefined,
    pontal: undefined,
  });

  const isEdit = !!id;
  const navio = isEdit ? navios.find((n) => n.id === Number(id)) : null;

  useEffect(() => {
    if (isEdit && navio) {
      setFormData({
        nome: navio.nome,
        classe: navio.classe,
        tipo: navio.tipo,
        porteBruto: navio.porteBruto,
        comprimentoTotal: navio.comprimentoTotal,
        boca: navio.boca,
        calado: navio.calado,
        pontal: navio.pontal,
      });
    }
  }, [isEdit, navio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (isEdit && id) {
        await updateNavio(Number(id), formData);
      } else {
        await createNavio(formData);
      }
      navigate('/navios');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar navio');
    } finally {
      setSaving(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <LoadingSpinner size="lg" />
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
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onMenuToggle={onToggle}
          isSidebarOpen={isOpen}
        />
        <main className="p-6 lg:p-8 xl:p-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="secondary" onClick={() => navigate('/navios')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEdit ? 'Editar Navio' : 'Novo Navio'}
                </h1>
              </div>
            </div>

            <Card className="p-6 lg:p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Informações Básicas
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nome do Navio *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all bg-white"
                        placeholder="Ex: Navio Exemplo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Classe *
                      </label>
                      <select
                        required
                        value={formData.classe}
                        onChange={(e) => setFormData({ ...formData, classe: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all bg-white"
                      >
                        <option value="">Selecione a classe</option>
                        <option value="Suezmax">Suezmax</option>
                        <option value="Aframax">Aframax</option>
                        <option value="VLCC">VLCC</option>
                        <option value="ULCC">ULCC</option>
                        <option value="Panamax">Panamax</option>
                        <option value="Handysize">Handysize</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tipo *
                      </label>
                      <select
                        required
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all bg-white"
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="Petroleiro">Petroleiro</option>
                        <option value="Gaseiro">Gaseiro</option>
                        <option value="Químico">Químico</option>
                        <option value="Cargueiro">Cargueiro</option>
                        <option value="Container">Container</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Porte Bruto (toneladas) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.porteBruto || ''}
                        onChange={(e) => setFormData({ ...formData, porteBruto: Number(e.target.value) })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all bg-white"
                        placeholder="Ex: 150000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Dimensões (Opcional)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Comprimento Total (metros)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.comprimentoTotal || ''}
                        onChange={(e) => setFormData({ ...formData, comprimentoTotal: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all bg-white"
                        placeholder="Ex: 250.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Boca (metros)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.boca || ''}
                        onChange={(e) => setFormData({ ...formData, boca: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all bg-white"
                        placeholder="Ex: 44.2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Calado (metros)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.calado || ''}
                        onChange={(e) => setFormData({ ...formData, calado: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all bg-white"
                        placeholder="Ex: 15.8"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pontal (metros)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.pontal || ''}
                        onChange={(e) => setFormData({ ...formData, pontal: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue transition-all bg-white"
                        placeholder="Ex: 23.1"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate('/navios')} 
                    disabled={saving}
                    className="px-6"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="px-6"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar Navio'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};


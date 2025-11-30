import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useDocagens } from '../hooks';
import { useNavios } from '../hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';
import { DocagemRequest } from '../types';
import { cn } from '../utils';

interface DocagemFormPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const DocagemFormPage: React.FC<DocagemFormPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { docagens, loading, createDocagem, updateDocagem } = useDocagens();
  const { navios } = useNavios();
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<DocagemRequest>({
    navioId: 0,
    dataDocagem: new Date().toISOString().split('T')[0],
    tipo: 'Especial',
    observacoes: '',
  });

  const isEdit = !!id;
  const docagem = isEdit ? docagens.find((d) => d.id === Number(id)) : null;

  useEffect(() => {
    if (isEdit && docagem) {
      setFormData({
        navioId: docagem.navioId,
        dataDocagem: docagem.dataDocagem,
        tipo: docagem.tipo,
        observacoes: docagem.observacoes || '',
      });
    }
  }, [isEdit, docagem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.navioId || formData.navioId === 0) {
      alert('Selecione um navio');
      return;
    }
    try {
      setSaving(true);
      if (isEdit && id) {
        await updateDocagem(Number(id), formData);
      } else {
        await createDocagem(formData);
      }
      navigate('/docagens');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar docagem');
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
              <Button variant="secondary" onClick={() => navigate('/docagens')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEdit ? 'Editar Docagem' : 'Nova Docagem'}
                </h1>
              </div>
            </div>

            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Navio *
                  </label>
                  <select
                    required
                    value={formData.navioId}
                    onChange={(e) => setFormData({ ...formData, navioId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                  >
                    <option value={0}>Selecione um navio</option>
                    {navios.map((navio) => (
                      <option key={navio.id} value={navio.id}>
                        {navio.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Data da Docagem *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.dataDocagem}
                      onChange={(e) => setFormData({ ...formData, dataDocagem: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo *
                    </label>
                    <select
                      required
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                    >
                      <option value="Especial">Especial</option>
                      <option value="Manutenção">Manutenção</option>
                      <option value="Limpeza">Limpeza</option>
                      <option value="Reparo">Reparo</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                    placeholder="Adicione observações sobre a docagem..."
                  />
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                  <Button variant="secondary" onClick={() => navigate('/docagens')} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Salvando...' : 'Salvar'}
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


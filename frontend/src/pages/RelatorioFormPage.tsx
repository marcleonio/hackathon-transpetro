import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useRelatorios } from '../hooks';
import { useNavios } from '../hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { RelatorioRequest } from '../types';
import { cn } from '../utils';
import { MapPicker } from '../components/ui/MapPicker';

interface RelatorioFormPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const TIPOS_RELATORIO = ['INSPECAO', 'LIMPEZA', 'OBSERVACAO', 'CONSUMO'];
const STATUS_RELATORIO = ['RASCUNHO', 'FINALIZADO', 'ARQUIVADO'];
const TIPOS_LIMPEZA = ['Parcial', 'Completa', 'Em Docagem'];

export const RelatorioFormPage: React.FC<RelatorioFormPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { relatorios, loading, createRelatorio, updateRelatorio } = useRelatorios();
  const { navios } = useNavios();
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [formData, setFormData] = useState<RelatorioRequest>({
    navioId: '',
    tipoRelatorio: 'INSPECAO',
    titulo: '',
    descricao: '',
    localizacao: '',
    nivelBioincrustacao: undefined,
    consumoObservado: undefined,
    tipoLimpeza: undefined,
    dataLimpeza: undefined,
    status: 'RASCUNHO',
    anexos: [],
    coordenadas: '',
    observacoesAdicionais: '',
    registradoPor: 'Admin',
  });

  const isEdit = !!id;
  const relatorio = isEdit ? relatorios.find((r) => r.id === Number(id)) : null;

  useEffect(() => {
    if (isEdit && relatorio) {
      setFormData({
        navioId: relatorio.navioId,
        tipoRelatorio: relatorio.tipoRelatorio,
        titulo: relatorio.titulo,
        descricao: relatorio.descricao || '',
        localizacao: relatorio.localizacao || '',
        nivelBioincrustacao: relatorio.nivelBioincrustacao,
        consumoObservado: relatorio.consumoObservado,
        tipoLimpeza: relatorio.tipoLimpeza,
        dataLimpeza: relatorio.dataLimpeza,
        status: relatorio.status,
        anexos: relatorio.anexos || [],
        coordenadas: relatorio.coordenadas || '',
        observacoesAdicionais: relatorio.observacoesAdicionais || '',
        registradoPor: relatorio.registradoPor,
      });
    }
  }, [isEdit, relatorio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.navioId || !formData.titulo) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    try {
      setSaving(true);
      if (isEdit && id) {
        await updateRelatorio(Number(id), formData);
      } else {
        await createRelatorio(formData);
      }
      navigate('/relatorios');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar relatório');
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Button variant="secondary" onClick={() => navigate('/relatorios')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEdit ? 'Editar Relatório' : 'Novo Relatório'}
                </h1>
              </div>
            </div>

            <Card className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Navio *
                    </label>
                    <select
                      required
                      value={formData.navioId}
                      onChange={(e) => setFormData({ ...formData, navioId: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent bg-white"
                    >
                      <option value="">Selecione um navio</option>
                      {navios.map((navio) => (
                        <option key={navio.id} value={navio.nome}>
                          {navio.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Relatório *
                    </label>
                    <select
                      required
                      value={formData.tipoRelatorio}
                      onChange={(e) => setFormData({ ...formData, tipoRelatorio: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent bg-white"
                    >
                      {TIPOS_RELATORIO.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                      placeholder="Digite o título do relatório"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={formData.descricao}
                      onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                      placeholder="Descreva os detalhes do relatório..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formData.localizacao || ''}
                      onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                      placeholder="Ex: Porto de Santos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nível de Bioincrustação (0-4)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="4"
                      value={formData.nivelBioincrustacao || ''}
                      onChange={(e) => setFormData({ ...formData, nivelBioincrustacao: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                    />
                  </div>
                  {formData.tipoRelatorio === 'CONSUMO' && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Consumo Observado (Ton/dia)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.consumoObservado || ''}
                        onChange={(e) => setFormData({ ...formData, consumoObservado: e.target.value ? Number(e.target.value) : undefined })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                      />
                    </div>
                  )}
                  {formData.tipoRelatorio === 'LIMPEZA' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Tipo de Limpeza
                        </label>
                        <select
                          value={formData.tipoLimpeza || ''}
                          onChange={(e) => setFormData({ ...formData, tipoLimpeza: e.target.value || undefined })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent bg-white"
                        >
                          <option value="">Selecione</option>
                          {TIPOS_LIMPEZA.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Data da Limpeza
                        </label>
                        <input
                          type="date"
                          value={formData.dataLimpeza || ''}
                          onChange={(e) => setFormData({ ...formData, dataLimpeza: e.target.value || undefined })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                        />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent bg-white"
                    >
                      {STATUS_RELATORIO.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Registrado Por
                    </label>
                    <input
                      type="text"
                      value={formData.registradoPor || ''}
                      onChange={(e) => setFormData({ ...formData, registradoPor: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                      placeholder="Nome do responsável"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Coordenadas
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.coordenadas || ''}
                        onChange={(e) => setFormData({ ...formData, coordenadas: e.target.value })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                        placeholder="Ex: -23.9608, -46.3332"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowMapPicker(true)}
                        className="flex items-center gap-2"
                      >
                        <MapPin className="h-4 w-4" />
                        Selecionar
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observações Adicionais
                    </label>
                    <textarea
                      value={formData.observacoesAdicionais || ''}
                      onChange={(e) => setFormData({ ...formData, observacoesAdicionais: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent"
                      placeholder="Observações complementares..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
                  <Button variant="secondary" onClick={() => navigate('/relatorios')} disabled={saving}>
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
      {showMapPicker && (
        <MapPicker
          value={formData.coordenadas || ''}
          onChange={(coords) => {
            setFormData({ ...formData, coordenadas: coords });
          }}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useRelatorios } from '../hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { Plus, Edit, Trash2, FileText } from 'lucide-react';
import { Relatorio } from '../types';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { cn } from '../utils';

interface RelatoriosPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'FINALIZADO':
      return 'success';
    case 'RASCUNHO':
      return 'warning';
    case 'ARQUIVADO':
      return 'default';
    default:
      return 'default';
  }
};

const getTipoColor = (tipo: string) => {
  switch (tipo) {
    case 'INSPECAO':
      return 'info';
    case 'LIMPEZA':
      return 'success';
    case 'OBSERVACAO':
      return 'warning';
    case 'CONSUMO':
      return 'default';
    default:
      return 'default';
  }
};

export const RelatoriosPage: React.FC<RelatoriosPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { relatorios, loading, error, deleteRelatorio } = useRelatorios();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; titulo: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRelatorios = relatorios.filter((relatorio) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      relatorio.titulo.toLowerCase().includes(term) ||
      relatorio.descricao?.toLowerCase().includes(term) ||
      relatorio.navioId.toLowerCase().includes(term) ||
      relatorio.registradoPor.toLowerCase().includes(term)
    );
  });

  const handleDeleteClick = (id: number, titulo: string) => {
    setConfirmDelete({ id, titulo });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeletingId(confirmDelete.id);
      await deleteRelatorio(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar relatório');
      setDeletingId(null);
    } finally {
      setDeletingId(null);
    }
  };

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
                <p className="text-gray-600">Gerencie os relatórios de campo dos marinheiros</p>
              </div>
              <Button onClick={() => navigate('/relatorios/novo')} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-5 w-5" />
                Novo Relatório
              </Button>
            </div>

            {loading && (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {!loading && !error && filteredRelatorios.length === 0 && relatorios.length === 0 && (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum relatório cadastrado</h3>
                <p className="text-gray-600 mb-6">Comece criando seu primeiro relatório</p>
                <Button onClick={() => navigate('/relatorios/novo')}>Criar Primeiro Relatório</Button>
              </Card>
            )}

            {!loading && searchTerm && filteredRelatorios.length === 0 && relatorios.length > 0 && (
              <Card className="p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum relatório encontrado</h3>
                <p className="text-gray-600">Tente ajustar sua busca</p>
              </Card>
            )}

            {!loading && filteredRelatorios.length > 0 && (
              <div className="space-y-4">
                {filteredRelatorios.map((relatorio) => (
                  <Card key={relatorio.id} className="p-6 hover:shadow-lg transition-shadow" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{relatorio.titulo}</h3>
                          <Badge variant={getTipoColor(relatorio.tipoRelatorio)}>
                            {relatorio.tipoRelatorio}
                          </Badge>
                          <Badge variant={getStatusColor(relatorio.status)}>
                            {relatorio.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Navio: <span className="font-semibold">{relatorio.navioId}</span>
                        </p>
                        {relatorio.descricao && (
                          <p className="text-gray-700 mb-2 line-clamp-2">{relatorio.descricao}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            Registrado por: <span className="font-semibold">{relatorio.registradoPor}</span>
                          </span>
                          <span>
                            {format(new Date(relatorio.dataRegistro), "dd 'de' MMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                          {relatorio.nivelBioincrustacao !== null && relatorio.nivelBioincrustacao !== undefined && (
                            <span>
                              Nível: <span className="font-semibold">{relatorio.nivelBioincrustacao}/4</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/relatorios/${relatorio.id}`)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(relatorio.id, relatorio.titulo);
                        }}
                        disabled={deletingId === relatorio.id}
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Deletar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja deletar o relatório "${confirmDelete?.titulo}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingId === confirmDelete?.id}
      />
    </div>
  );
};


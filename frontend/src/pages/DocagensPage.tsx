import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useDocagens } from '../hooks';
import { useNavios } from '../hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Badge } from '../components/ui/Badge';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { Plus, Edit, Trash2, Anchor, Calendar } from 'lucide-react';
import { cn } from '../utils';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface DocagensPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const DocagensPage: React.FC<DocagensPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { docagens, loading, error, deleteDocagem } = useDocagens();
  const { navios } = useNavios();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; navioNome: string; data: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNavioId, setSelectedNavioId] = useState<number | null>(null);

  const filteredDocagens = docagens.filter((docagem) => {
    if (selectedNavioId && docagem.navioId !== selectedNavioId) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      docagem.navioNome.toLowerCase().includes(term) ||
      docagem.tipo.toLowerCase().includes(term) ||
      docagem.observacoes?.toLowerCase().includes(term)
    );
  });

  const handleDeleteClick = (id: number, navioNome: string, data: string) => {
    setConfirmDelete({ id, navioNome, data });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeletingId(confirmDelete.id);
      await deleteDocagem(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar docagem');
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Docagens</h1>
                <p className="text-gray-600">Gerencie as docagens e limpezas dos navios</p>
              </div>
              <Button onClick={() => navigate('/docagens/novo')} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-5 w-5" />
                Nova Docagem
              </Button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              <select
                value={selectedNavioId || ''}
                onChange={(e) => setSelectedNavioId(e.target.value ? Number(e.target.value) : null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-transparent bg-white"
              >
                <option value="">Todos os navios</option>
                {navios.map((navio) => (
                  <option key={navio.id} value={navio.id}>
                    {navio.nome}
                  </option>
                ))}
              </select>
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

            {!loading && !error && filteredDocagens.length === 0 && docagens.length === 0 && (
              <Card className="p-12 text-center">
                <Anchor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma docagem cadastrada</h3>
                <p className="text-gray-600 mb-6">Comece registrando a primeira docagem</p>
                <Button onClick={() => navigate('/docagens/novo')}>Registrar Primeira Docagem</Button>
              </Card>
            )}

            {!loading && searchTerm && filteredDocagens.length === 0 && docagens.length > 0 && (
              <Card className="p-12 text-center">
                <Anchor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhuma docagem encontrada</h3>
                <p className="text-gray-600">Tente ajustar sua busca ou filtro</p>
              </Card>
            )}

            {!loading && filteredDocagens.length > 0 && (
              <div className="space-y-4">
                {filteredDocagens.map((docagem) => (
                  <Card key={docagem.id} className="p-6 hover:shadow-lg transition-shadow" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{docagem.navioNome}</h3>
                          <Badge variant="info">{docagem.tipo}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(docagem.dataDocagem), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        {docagem.observacoes && (
                          <p className="text-gray-700 mb-2">{docagem.observacoes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(`/docagens/${docagem.id}`)}
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
                          handleDeleteClick(
                            docagem.id, 
                            docagem.navioNome, 
                            format(new Date(docagem.dataDocagem), "dd 'de' MMM 'de' yyyy", { locale: ptBR })
                          );
                        }}
                        disabled={deletingId === docagem.id}
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
        message={`Tem certeza que deseja deletar a docagem do navio "${confirmDelete?.navioNome}" de ${confirmDelete?.data}? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingId === confirmDelete?.id}
      />
    </div>
  );
};


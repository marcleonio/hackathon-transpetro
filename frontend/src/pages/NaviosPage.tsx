import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useNavios } from '../hooks';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { Plus, Edit, Trash2, Ship } from 'lucide-react';
import { cn } from '../utils';

interface NaviosPageProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export const NaviosPage: React.FC<NaviosPageProps> = ({
  activeView,
  onViewChange,
  isOpen,
  isMobile,
  onClose,
  onToggle,
}) => {
  const navigate = useNavigate();
  const { navios, loading, error, deleteNavio } = useNavios();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; nome: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNavios = navios.filter((navio) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      navio.nome.toLowerCase().includes(term) ||
      navio.classe.toLowerCase().includes(term) ||
      navio.tipo.toLowerCase().includes(term)
    );
  });

  const handleDeleteClick = (id: number, nome: string) => {
    setConfirmDelete({ id, nome });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    try {
      setDeletingId(confirmDelete.id);
      await deleteNavio(confirmDelete.id);
      setConfirmDelete(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar navio');
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
        <main className="p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Navios</h1>
                <p className="text-gray-600">Gerencie os navios cadastrados no sistema</p>
              </div>
              <Button onClick={() => navigate('/navios/novo')} className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Navio
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

            {!loading && !error && filteredNavios.length === 0 && navios.length === 0 && (
              <Card className="p-12 text-center">
                <Ship className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum navio cadastrado</h3>
                <p className="text-gray-600 mb-6">Comece criando seu primeiro navio</p>
                <Button onClick={() => navigate('/navios/novo')}>Criar Primeiro Navio</Button>
              </Card>
            )}

            {!loading && searchTerm && filteredNavios.length === 0 && navios.length > 0 && (
              <Card className="p-12 text-center">
                <Ship className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum navio encontrado</h3>
                <p className="text-gray-600">Tente ajustar sua busca</p>
              </Card>
            )}

            {!loading && filteredNavios.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNavios.map((navio) => (
                  <Card 
                    key={navio.id} 
                    className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => navigate(`/ship/${encodeURIComponent(navio.nome)}`)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{navio.nome}</h3>
                        <p className="text-sm text-gray-600">{navio.classe} • {navio.tipo}</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Porte Bruto:</span>
                        <span className="font-semibold">{navio.porteBruto.toLocaleString('pt-BR')} t</span>
                      </div>
                      {navio.comprimentoTotal && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Comprimento:</span>
                          <span className="font-semibold">{navio.comprimentoTotal} m</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 pt-4 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/navios/${navio.id}`);
                        }}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(navio.id, navio.nome);
                        }}
                        disabled={deletingId === navio.id}
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
        message={`Tem certeza que deseja deletar o navio "${confirmDelete?.nome}"? Esta ação não pode ser desfeita.`}
        confirmText="Deletar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deletingId === confirmDelete?.id}
      />
    </div>
  );
};


import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageSquare, Send, Search } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../utils';

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread: boolean;
}

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockMessages: Message[] = [
  {
    id: '1',
    from: 'Equipe de Manutenção',
    subject: 'Solicitação de limpeza - Victor Oliveira',
    preview: 'O navio Victor Oliveira requer limpeza urgente devido ao HPI crítico...',
    time: 'Há 1 hora',
    unread: true,
  },
  {
    id: '2',
    from: 'Sistema',
    subject: 'Relatório semanal gerado',
    preview: 'O relatório semanal de performance da frota foi gerado com sucesso...',
    time: 'Há 3 horas',
    unread: true,
  },
  {
    id: '3',
    from: 'Administrador',
    subject: 'Atualização de dados',
    preview: 'Os dados de consumo foram atualizados para o período de novembro...',
    time: 'Há 1 dia',
    unread: false,
  },
];

export const MessagesModal: React.FC<MessagesModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const unreadCount = mockMessages.filter(m => m.unread).length;
  const filteredMessages = mockMessages.filter(
    m => m.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
         m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-start justify-end p-4 pt-20"
      onClick={onClose}
    >
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        aria-hidden="true"
      />
      <Card 
        className="relative w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl bg-white"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Mensagens</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-petrobras-blue text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar mensagens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-petrobras-blue focus:border-petrobras-blue"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhuma mensagem encontrada</p>
            </div>
          ) : (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "p-4 rounded-lg border border-gray-200 transition-all cursor-pointer hover:shadow-md",
                  message.unread && "bg-blue-50 border-blue-200"
                )}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-gray-900 text-sm">{message.from}</h3>
                  {message.unread && (
                    <span className="w-2 h-2 bg-petrobras-blue rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="font-medium text-gray-800 text-sm mb-1">{message.subject}</p>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.preview}</p>
                <p className="text-xs text-gray-500">{message.time}</p>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-gray-200">
          <Button className="w-full flex items-center justify-center gap-2">
            <Send className="h-4 w-4" />
            Nova Mensagem
          </Button>
        </div>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};


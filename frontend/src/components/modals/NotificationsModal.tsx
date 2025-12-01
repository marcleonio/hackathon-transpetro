import React from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Card } from '../ui/Card';
import { cn } from '../../utils';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'warning',
    title: 'Navio com HPI Crítico',
    message: 'O navio Victor Oliveira atingiu HPI de 1.09. Limpeza recomendada.',
    time: 'Há 2 horas',
    read: false,
  },
  {
    id: '2',
    type: 'info',
    title: 'Nova docagem registrada',
    message: 'Docagem do navio Carla Silva foi registrada com sucesso.',
    time: 'Há 5 horas',
    read: false,
  },
  {
    id: '3',
    type: 'success',
    title: 'Importação concluída',
    message: 'Dados de eventos foram importados com sucesso. 1.234 registros adicionados.',
    time: 'Há 1 dia',
    read: true,
  },
];

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const unreadCount = mockNotifications.filter(n => !n.read).length;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

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
            <Bell className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Notificações</h2>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {mockNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhuma notificação</p>
            </div>
          ) : (
            mockNotifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                  getBgColor(notification.type),
                  !notification.read && "ring-2 ring-petrobras-blue/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-petrobras-blue rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {mockNotifications.length > 0 && (
          <div className="p-4 border-t border-gray-200">
            <button className="w-full text-sm font-semibold text-petrobras-blue hover:text-petrobras-blue/80 transition-colors">
              Marcar todas como lidas
            </button>
          </div>
        )}
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};


import React from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Settings, LogOut, Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate('/settings');
    onClose();
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
        className="relative w-full max-w-sm overflow-hidden flex flex-col shadow-2xl bg-white"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Perfil</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Fechar"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-petrobras-blue to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Admin</h3>
              <p className="text-sm text-gray-600">Administrador do Sistema</p>
            </div>
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Mail className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Email</p>
                <p className="text-xs text-gray-600">admin@silec.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              <Shield className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Permissões</p>
                <p className="text-xs text-gray-600">Acesso total</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleSettingsClick}
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
            <Button
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};


import React from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/image.png';

interface SilecLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  logoOnly?: boolean;
}

export const SilecLogo: React.FC<SilecLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '',
  logoOnly = false
}) => {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };
  const sizeMap = {
    sm: { icon: 48, text: 'text-xs' },
    md: { icon: 48, text: 'text-sm' },
    lg: { icon: 64, text: 'text-base' },
  };

  const { icon: iconSize, text: textSize } = sizeMap[size];

  if (logoOnly) {
    return (
      <button
        onClick={handleLogoClick}
        className="relative rounded-2xl overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center bg-white cursor-pointer hover:shadow-xl transition-shadow duration-200"
        style={{ width: iconSize, height: iconSize }}
        aria-label="Ir para o dashboard"
      >
        <img
          src={logoImage}
          alt="SELIC Logo"
          className="w-full h-full object-cover"
          style={{ width: iconSize, height: iconSize }}
        />
      </button>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        onClick={handleLogoClick}
        className="relative rounded-2xl overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center bg-white cursor-pointer hover:shadow-xl transition-shadow duration-200"
        style={{ width: iconSize, height: iconSize }}
        aria-label="Ir para o dashboard"
      >
        <img
          src={logoImage}
          alt="SELIC Logo"
          className="w-full h-full object-cover"
          style={{ width: iconSize, height: iconSize }}
        />
      </button>
      
      {showText && (
        <div className="flex flex-col min-w-0 flex-1">
          <h1 className={`${textSize} font-bold text-gray-900 leading-tight break-words`}>SELIC</h1>
          <p className="text-[10px] leading-tight text-gray-600 font-medium hidden sm:block break-words">
            Sistema Inteligente de Limpeza de Casco
          </p>
        </div>
      )}
    </div>
  );
};


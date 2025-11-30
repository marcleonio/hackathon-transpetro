import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { cn } from '../../utils';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  title?: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  content,
  title,
  className,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800 transition-colors',
          className
        )}
        aria-label="Informações"
      >
        <Info className="h-3 w-3" />
      </button>

      {isHovered && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 p-4 pointer-events-none">
          {title && (
            <h4 className="text-sm font-bold text-gray-900 mb-2">{title}</h4>
          )}
          <div className="text-xs text-gray-700 leading-relaxed">
            {typeof content === 'string' ? <p>{content}</p> : content}
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
            <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-300" />
          </div>
        </div>
      )}
    </div>
  );
};


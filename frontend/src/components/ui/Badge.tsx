import React from 'react';
import { cn } from '../../utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-800 border-gray-300',
  success: 'bg-green-50 text-petrobras-green border-petrobras-green',
  warning: 'bg-yellow-50 text-petrobras-yellow border-petrobras-yellow',
  danger: 'bg-red-50 text-red-700 border-red-300',
  info: 'bg-blue-50 text-petrobras-blue border-petrobras-blue',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

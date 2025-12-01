import React from 'react';
import { BiofoulingLevel } from '../../types';
import { cn } from '../../utils';
import { CheckCircle, AlertCircle, AlertTriangle, XCircle, AlertOctagon } from 'lucide-react';

interface StatusBadgeProps {
  level: BiofoulingLevel;
  size?: 'sm' | 'md' | 'lg';
}

const levelConfig: Record<
  number,
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  0: {
    label: 'Limpo',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: CheckCircle,
  },
  1: {
    label: 'Atenção',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: AlertCircle,
  },
  2: {
    label: 'Alerta',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: AlertTriangle,
  },
  3: {
    label: 'Crítico',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: XCircle,
  },
  4: {
    label: 'Urgente',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: AlertOctagon,
  },
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ level, size = 'md' }) => {
  const config = levelConfig[level] || levelConfig[0];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border font-semibold',
        config.bgColor,
        config.borderColor,
        config.color,
        sizeClasses[size]
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </div>
  );
};

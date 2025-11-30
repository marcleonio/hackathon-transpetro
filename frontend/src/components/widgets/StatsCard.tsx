import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: 'primary' | 'success' | 'warning' | 'danger';
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const gradientClasses = {
  primary: 'from-petrobras-blue to-accent-600',
  success: 'from-petrobras-green to-primary-600',
  warning: 'from-petrobras-yellow to-secondary-600',
  danger: 'from-red-500 to-red-600',
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient = 'primary',
  trend,
}) => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-white border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300',
          gradientClasses[gradient]
        )}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              'p-3 rounded-lg bg-gradient-to-br',
              gradientClasses[gradient]
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full',
                trend.isPositive
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

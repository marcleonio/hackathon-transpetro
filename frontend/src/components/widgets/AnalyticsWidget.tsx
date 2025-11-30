import React, { useMemo } from 'react';
import { CleaningSuggestion } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getCurrentHPI } from '../../utils/hpiUtils';

interface AnalyticsWidgetProps {
  ships: Record<string, CleaningSuggestion>;
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({ ships }) => {
  const chartData = useMemo(() => {
    const shipArray = Object.values(ships);
    const levelCounts = [0, 0, 0, 0, 0];

    shipArray.forEach((ship) => {
      const level = ship.nivelBioincrustacao;
      if (level >= 0 && level <= 4) {
        levelCounts[level]++;
      }
    });

    return [
      { name: 'Limpo', value: levelCounts[0], color: '#00b21e' },
      { name: 'Atenção', value: levelCounts[1], color: '#fceb0f' },
      { name: 'Alerta', value: levelCounts[2], color: '#f59e0b' },
      { name: 'Crítico', value: levelCounts[3], color: '#ea580c' },
      { name: 'Urgente', value: levelCounts[4], color: '#dc2626' },
    ];
  }, [ships]);

  const avgHPI = useMemo(() => {
    const shipArray = Object.values(ships);
    if (shipArray.length === 0) return 0;

    const totalHPI = shipArray.reduce((sum, ship) => {
      const currentHPI = getCurrentHPI(ship.predictions);
      return sum + currentHPI;
    }, 0);

    return totalHPI / shipArray.length;
  }, [ships]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg
              className="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900">Distribuição por Nível</h3>
        </div>
        <div className="text-right bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
            HPI Médio
          </p>
          <p className="text-xl font-bold text-gray-900">{avgHPI.toFixed(3)}</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={11}
            fontWeight={600}
          />
          <YAxis stroke="#6b7280" fontSize={11} fontWeight={600} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

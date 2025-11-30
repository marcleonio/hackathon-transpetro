import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { BIOFOULING_LEVELS } from '../../utils/constants';
import { Info } from 'lucide-react';

export const BiofoulingLevels: React.FC = () => {
  return (
    <div className="mb-6 animate-fade-in-up">
      <div className="flex items-center gap-2 mb-4">
        <Info className="h-5 w-5 text-petrobras-blue" />
        <h2 className="text-xl font-semibold text-gray-900">
          Níveis de Bioincrustação
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Object.values(BIOFOULING_LEVELS).map((level) => (
          <Card
            key={level.level}
            className={`${level.bgColor} ${level.borderColor} border-l-4 hover:shadow-lg transition-all duration-300`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Nível {level.level}</h3>
                  <p className="text-xs font-semibold text-gray-700">{level.label}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">{level.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

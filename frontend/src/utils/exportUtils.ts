import { CleaningSuggestion } from '../types';
import { formatFullDate } from './dateUtils';
import { getCurrentHPI } from './hpiUtils';

export const exportToCSV = (ships: Record<string, CleaningSuggestion>, filename = 'frota-hpi') => {
  const headers = [
    'Navio ID',
    'Status Casco',
    'Nível Bioincrustação',
    'HPI Atual',
    'Última Limpeza',
    'Data Ideal Limpeza',
    'Dias para Intervenção',
    'CFI Limpo (Ton/dia)',
    'Consumo Extra Máx (Ton/dia)',
    'Comprometimento do Casco (%)',
  ];

  const rows = Object.values(ships).map((ship) => {
    const currentHPI = getCurrentHPI(ship.predictions);
    return [
      ship.navioId,
      ship.statusCascoAtual,
      ship.nivelBioincrustacao,
      currentHPI.toFixed(3),
      ship.dataUltimaLimpeza ? formatFullDate(ship.dataUltimaLimpeza) : 'N/A',
      ship.dataIdealLimpeza ? formatFullDate(ship.dataIdealLimpeza) : 'N/A',
      ship.diasParaIntervencao.toString(),
      ship.cfiCleanTonPerDay.toFixed(2),
      ship.maxExtraFuelTonPerDay.toFixed(2),
      ship.porcentagemComprometimentoAtual.toFixed(2),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


import { DailyPrediction } from '../types';

export const HPI_CONSTANTS = {
  IDEAL: 1.0,
  LEVEL_1_MAX: 1.03,
  LEVEL_2_MAX: 1.06,
  CRITICAL_LIMIT: 1.08,
} as const;

export const getHPIColor = (hpi: number): string => {
  if (hpi >= HPI_CONSTANTS.CRITICAL_LIMIT) return '#dc2626';
  if (hpi >= HPI_CONSTANTS.LEVEL_2_MAX) return '#ea580c';
  if (hpi >= HPI_CONSTANTS.LEVEL_1_MAX) return '#f59e0b';
  return '#00b21e';
};

export const getHPIColorClasses = (hpi: number): string => {
  if (hpi >= HPI_CONSTANTS.CRITICAL_LIMIT) return 'border-red-500 bg-red-50/50';
  if (hpi >= HPI_CONSTANTS.LEVEL_2_MAX) return 'border-orange-500 bg-orange-50/50';
  if (hpi >= HPI_CONSTANTS.LEVEL_1_MAX) return 'border-yellow-500 bg-yellow-50/50';
  return 'border-petrobras-green bg-green-50/50';
};

export const getHPIProgressBarColor = (hpi: number): string => {
  if (hpi >= HPI_CONSTANTS.CRITICAL_LIMIT) return 'bg-red-500';
  if (hpi >= HPI_CONSTANTS.LEVEL_2_MAX) return 'bg-orange-500';
  if (hpi >= HPI_CONSTANTS.LEVEL_1_MAX) return 'bg-petrobras-yellow';
  return 'bg-petrobras-green';
};

export const calculateHPIProgress = (hpi: number): number => {
  const progress =
    ((hpi - HPI_CONSTANTS.IDEAL) /
      (HPI_CONSTANTS.CRITICAL_LIMIT - HPI_CONSTANTS.IDEAL)) *
    100;
  return Math.min(Math.max(progress, 0), 100);
};

export const getCurrentHPI = (predictions: DailyPrediction[]): number => {
  return predictions[0]?.hpi ?? HPI_CONSTANTS.IDEAL;
};

export const calculateHPIRange = (
  predictions: DailyPrediction[],
  limit: number = 90
): { min: number; max: number } => {
  const limited = predictions.slice(0, limit);

  if (limited.length === 0) {
    return { min: HPI_CONSTANTS.IDEAL, max: HPI_CONSTANTS.CRITICAL_LIMIT };
  }

  const hpiValues = limited.map((p) => p.hpi);
  return {
    min: Math.min(...hpiValues, HPI_CONSTANTS.IDEAL),
    max: Math.max(...hpiValues, HPI_CONSTANTS.CRITICAL_LIMIT),
  };
};

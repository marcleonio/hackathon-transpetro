export interface DailyPrediction {
  data: string;
  hpi: number;
  dragPercent: number;
  extraFuelTonPerDay: number;
}

export interface CleaningSuggestion {
  navioId: string;
  dataIdealLimpeza: string | null;
  justificativa: string;
  statusCascoAtual: string;
  nivelBioincrustacao: number;
  cfiCleanTonPerDay: number;
  maxExtraFuelTonPerDay: number;
  predictions: DailyPrediction[];
}

export type BiofoulingLevel = 0 | 1 | 2 | 3 | 4;

export interface BiofoulingLevelInfo {
  level: BiofoulingLevel;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}


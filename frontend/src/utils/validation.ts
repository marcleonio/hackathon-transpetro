import { CleaningSuggestion, DailyPrediction } from '../types';

export const isValidCleaningSuggestion = (
  data: unknown
): data is CleaningSuggestion => {
  if (!data || typeof data !== 'object') return false;

  const suggestion = data as Partial<CleaningSuggestion>;

  return (
    typeof suggestion.navioId === 'string' &&
    typeof suggestion.nivelBioincrustacao === 'number' &&
    typeof suggestion.cfiCleanTonPerDay === 'number' &&
    typeof suggestion.maxExtraFuelTonPerDay === 'number' &&
    typeof suggestion.diasParaIntervencao === 'number' &&
    typeof suggestion.porcentagemComprometimentoAtual === 'number' &&
    Array.isArray(suggestion.predictions) &&
    (suggestion.dataUltimaLimpeza === null ||
      typeof suggestion.dataUltimaLimpeza === 'string') &&
    (suggestion.dataIdealLimpeza === null ||
      typeof suggestion.dataIdealLimpeza === 'string')
  );
};

export const isValidDailyPrediction = (
  prediction: unknown
): prediction is DailyPrediction => {
  if (!prediction || typeof prediction !== 'object') return false;

  const pred = prediction as Partial<DailyPrediction>;

  return (
    typeof pred.data === 'string' &&
    typeof pred.hpi === 'number' &&
    typeof pred.dragPercent === 'number' &&
    typeof pred.extraFuelTonPerDay === 'number' &&
    !isNaN(pred.hpi) &&
    !isNaN(pred.dragPercent) &&
    !isNaN(pred.extraFuelTonPerDay) &&
    (pred.estimatedIncrustationCoverage === undefined ||
      (typeof pred.estimatedIncrustationCoverage === 'number' &&
        !isNaN(pred.estimatedIncrustationCoverage)))
  );
};

export const sanitizeCleaningSuggestion = (
  data: unknown
): CleaningSuggestion | null => {
  if (!isValidCleaningSuggestion(data)) {
    return null;
  }

  const validPredictions = data.predictions.filter(isValidDailyPrediction);

  return {
    ...data,
    dataUltimaLimpeza: data.dataUltimaLimpeza ?? null,
    dataIdealLimpeza: data.dataIdealLimpeza ?? null,
    diasParaIntervencao: data.diasParaIntervencao ?? 0,
    porcentagemComprometimentoAtual: data.porcentagemComprometimentoAtual ?? 0,
    predictions: validPredictions,
  };
};

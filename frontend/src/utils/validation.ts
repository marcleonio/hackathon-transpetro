import { CleaningSuggestion, DailyPrediction } from '../types';

export const isValidCleaningSuggestion = (
  data: unknown
): data is CleaningSuggestion => {
  if (!data || typeof data !== 'object') return false;

  const suggestion = data as Partial<CleaningSuggestion>;

  // Validação mais flexível - verifica apenas campos essenciais
  const hasNavioId = typeof suggestion.navioId === 'string' && suggestion.navioId.length > 0;
  const hasNivel = typeof suggestion.nivelBioincrustacao === 'number' && !isNaN(suggestion.nivelBioincrustacao);
  const hasCfi = typeof suggestion.cfiCleanTonPerDay === 'number' && !isNaN(suggestion.cfiCleanTonPerDay);
  const hasMaxFuel = typeof suggestion.maxExtraFuelTonPerDay === 'number' && !isNaN(suggestion.maxExtraFuelTonPerDay);
  const hasPredictions = Array.isArray(suggestion.predictions);
  
  // Campos opcionais - mais permissivo
  const validDias = suggestion.diasParaIntervencao === undefined || 
    suggestion.diasParaIntervencao === null ||
    (typeof suggestion.diasParaIntervencao === 'number' && !isNaN(suggestion.diasParaIntervencao));
  const validPorcentagem = suggestion.porcentagemComprometimentoAtual === undefined ||
    suggestion.porcentagemComprometimentoAtual === null ||
    (typeof suggestion.porcentagemComprometimentoAtual === 'number' && !isNaN(suggestion.porcentagemComprometimentoAtual));
  const validDataUltima = suggestion.dataUltimaLimpeza === undefined ||
    suggestion.dataUltimaLimpeza === null || 
    typeof suggestion.dataUltimaLimpeza === 'string';
  const validDataIdeal = suggestion.dataIdealLimpeza === undefined ||
    suggestion.dataIdealLimpeza === null ||
    typeof suggestion.dataIdealLimpeza === 'string';
  
  // Campos de texto - aceita string ou null/undefined (será preenchido no sanitize)
  const validJustificativa = suggestion.justificativa === undefined ||
    suggestion.justificativa === null ||
    typeof suggestion.justificativa === 'string';
  const validStatus = suggestion.statusCascoAtual === undefined ||
    suggestion.statusCascoAtual === null ||
    typeof suggestion.statusCascoAtual === 'string';

  return hasNavioId && hasNivel && hasCfi && hasMaxFuel && hasPredictions && 
         validDias && validPorcentagem && validDataUltima && validDataIdeal &&
         validJustificativa && validStatus;
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
    justificativa: data.justificativa ?? 'Sem justificativa',
    statusCascoAtual: data.statusCascoAtual ?? 'Status desconhecido',
    predictions: validPredictions,
  };
};

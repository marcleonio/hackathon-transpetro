export interface DailyPrediction {
  data: string;
  hpi: number;
  dragPercent: number;
  extraFuelTonPerDay: number;
  estimatedIncrustationCoverage?: number;
}

export interface CleaningSuggestion {
  navioId: string;
  dataUltimaLimpeza: string | null;
  dataIdealLimpeza: string | null;
  diasParaIntervencao: number;
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

export interface Navio {
  id: number;
  nome: string;
  classe: string;
  tipo: string;
  porteBruto: number;
  comprimentoTotal?: number;
  boca?: number;
  calado?: number;
  pontal?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NavioRequest {
  nome: string;
  classe: string;
  tipo: string;
  porteBruto: number;
  comprimentoTotal?: number;
  boca?: number;
  calado?: number;
  pontal?: number;
}

export interface Docagem {
  id: number;
  navioId: number;
  navioNome: string;
  dataDocagem: string;
  tipo: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocagemRequest {
  navioId: number;
  dataDocagem: string;
  tipo: string;
  observacoes?: string;
}

export interface Relatorio {
  id: number;
  navioId: string;
  tipoRelatorio: string;
  dataRegistro: string;
  registradoPor: string;
  titulo: string;
  descricao?: string;
  localizacao?: string;
  nivelBioincrustacao?: number;
  consumoObservado?: number;
  tipoLimpeza?: string;
  dataLimpeza?: string;
  status: string;
  anexos?: string[];
  coordenadas?: string;
  observacoesAdicionais?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RelatorioRequest {
  navioId: string;
  tipoRelatorio: string;
  titulo: string;
  descricao?: string;
  localizacao?: string;
  nivelBioincrustacao?: number;
  consumoObservado?: number;
  tipoLimpeza?: string;
  dataLimpeza?: string;
  status?: string;
  anexos?: string[];
  coordenadas?: string;
  observacoesAdicionais?: string;
  registradoPor?: string;
}

export interface EventoNavegacao {
  id: number;
  navioId: number;
  navioNome: string;
  sessionId: string;
  eventName: string;
  startGMTDate: string;
  endGMTDate?: string;
  duration?: number;
  distance?: number;
  aftDraft?: number;
  fwdDraft?: number;
  midDraft?: number;
  trim?: number;
  displacement?: number;
  beaufortScale?: number;
  seaCondition?: string;
  speed?: number;
  speedGps?: number;
  porto?: string;
  decLatitude?: number;
  decLongitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventoNavegacaoRequest {
  navioId: number;
  sessionId: string;
  eventName: string;
  startGMTDate: string;
  endGMTDate?: string;
  duration?: number;
  distance?: number;
  aftDraft?: number;
  fwdDraft?: number;
  midDraft?: number;
  trim?: number;
  displacement?: number;
  beaufortScale?: number;
  seaCondition?: string;
  speed?: number;
  speedGps?: number;
  porto?: string;
  decLatitude?: number;
  decLongitude?: number;
}

export interface Consumo {
  id: number;
  navioId: number;
  navioNome: string;
  eventoId?: number;
  sessionId: string;
  consumedQuantity: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsumoRequest {
  navioId: number;
  eventoId?: number;
  sessionId: string;
  consumedQuantity: number;
  description: string;
}

export interface Revestimento {
  id: number;
  navioId: number;
  navioNome: string;
  sigla?: string;
  dataAplicacao: string;
  periodoBaseVerificacao: number;
  paradaMaximaAcumulada: number;
  createdAt: string;
  updatedAt: string;
}

export interface RevestimentoRequest {
  navioId: number;
  sigla?: string;
  dataAplicacao: string;
  periodoBaseVerificacao: number;
  paradaMaximaAcumulada: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}


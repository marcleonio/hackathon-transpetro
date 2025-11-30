import { BiofoulingLevelInfo } from '../types';

export const NAVIOS = [
  'Bruno Lima',
  'Carla Silva',
  'Daniel Pereira',
  'Eduardo Costa',
  'Fábio Santos',
  'Felipe Ribeiro',
  'Gabriela Martins',
  'Giselle Carvalho',
  'Henrique Alves',
  'Lucas Mendonça',
  'Marcos Cavalcanti',
  'Maria Valentina',
  'Paulo Moura',
  'Rafael Santos',
  'Raul Martins',
  'Renato Gomes',
  'Ricardo Barbosa',
  'Rodrigo Pinheiro',
  'Romario Silva',
  'Thiago Fernandes',
  'Victor Oliveira',
] as const;

export const BIOFOULING_LEVELS: Record<number, BiofoulingLevelInfo> = {
  0: {
    level: 0,
    label: 'Limpo',
    description: 'HPI ≈ 1.0. Eficiência máxima. Monitoramento de rotina.',
    color: 'text-petrobras-green',
    bgColor: 'bg-green-50',
    borderColor: 'border-petrobras-green',
    icon: '',
  },
  1: {
    level: 1,
    label: 'Atenção',
    description: 'HPI 1.0 - 1.03. Microincrustação leve. Iniciar planejamento de limpeza.',
    color: 'text-petrobras-yellow',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-petrobras-yellow',
    icon: '',
  },
  2: {
    level: 2,
    label: 'Alerta',
    description: 'HPI 1.03 - 1.06. Macroincrustação leve. Planejar limpeza.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    icon: '',
  },
  3: {
    level: 3,
    label: 'Crítico',
    description: 'HPI 1.06 - 1.08. Macroincrustação moderada. Agendar limpeza urgente.',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    icon: '',
  },
  4: {
    level: 4,
    label: 'Urgente',
    description: 'HPI > 1.08. Macroincrustação pesada. Perda de eficiência inaceitável.',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-600',
    icon: '',
  },
} as const;

export const HPI_LIMIT = 1.08;
export const HPI_LEVEL_1_MAX = 1.03;
export const HPI_LEVEL_2_MAX = 1.06;


import { format, parseISO, isValid } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

export const formatDate = (
  dateString: string | null,
  formatString: string = "dd 'de' MMM, yyyy"
): string => {
  if (!dateString) return 'N/A';

  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
    if (!isValid(date)) {
      return dateString;
    }
    return format(date, formatString, { locale: ptBR });
  } catch {
    return dateString;
  }
};

export const formatFullDate = (dateString: string | null): string => {
  return formatDate(dateString, "dd 'de' MMMM 'de' yyyy");
};

export const formatShortDate = (dateString: string | null): string => {
  return formatDate(dateString, 'dd/MM');
};

export const calculateDaysUntil = (targetDate: string | null): number | null => {
  if (!targetDate) return null;

  try {
    const target = typeof targetDate === 'string' ? parseISO(targetDate) : new Date(targetDate);
    if (!isValid(target)) {
      return null;
    }
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
};

export const getDaysUntilDescription = (days: number | null): string => {
  if (days === null) return 'Não definida';
  if (days > 0) return `Em ${days} dias`;
  if (days === 0) return 'Hoje';
  return 'Atrasado';
};

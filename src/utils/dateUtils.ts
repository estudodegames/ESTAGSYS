import { MeetingStatus } from '../types';

export const MESES_NOMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * Format date to PT-BR dd/mm/yyyy
 */
export function formatDateBr(isoOrDate: string | Date | undefined): string {
  if (!isoOrDate) return '-';
  if (typeof isoOrDate === 'string' && isoOrDate.includes('-')) {
    const parts = isoOrDate.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  }
  try {
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) return String(isoOrDate);
    return d.toLocaleDateString('pt-BR');
  } catch (e) {
    return String(isoOrDate);
  }
}

/**
 * Format phone with Brazilian mask: (11) 98765-4321
 */
export function formatPhone(val: string): string {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10)
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

/**
 * Visual badge details for Meeting Status
 */
export function getStatusDetails(status: MeetingStatus): {
  label: string;
  badgeBg: string;
  badgeText: string;
  textColor: string;
  border: string;
} {
  switch (status) {
    case 'Presente':
      return {
        label: 'Presente na Reunião',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
        badgeText: 'Presente',
        textColor: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
      };
    case 'Falta':
      return {
        label: 'Falta na Reunião',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300',
        badgeText: 'Falta',
        textColor: 'text-rose-600 dark:text-rose-400',
        border: 'border-rose-200 dark:border-rose-800',
      };
    case 'Estágio Cancelado':
      return {
        label: 'Estágio Cancelado',
        badgeBg: 'bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300',
        badgeText: 'Cancelado',
        textColor: 'text-red-600 dark:text-red-400',
        border: 'border-red-300 dark:border-red-800',
      };
    case 'Estágio Concluído':
      return {
        label: 'Estágio Concluído',
        badgeBg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300',
        badgeText: 'Concluído',
        textColor: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
      };
    case 'Pendente':
    default:
      return {
        label: 'Reunião Pendente',
        badgeBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        badgeText: 'Pendente',
        textColor: 'text-slate-500 dark:text-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
      };
  }
}

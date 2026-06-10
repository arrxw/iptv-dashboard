/**
 * Formatea una fecha en formato YYYY-MM-DD a DD/MM/YYYY
 * @param dateString - Fecha en formato YYYY-MM-DD o ISO string
 * @returns Fecha formateada como DD/MM/YYYY
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';

  try {
    // Parse la fecha (puede ser YYYY-MM-DD o ISO string)
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString; // Si no es válida, retorna la original
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/**
 * Calcula días restantes hasta una fecha
 * @param endDate - Fecha final en formato YYYY-MM-DD o ISO string
 * @returns Número de días restantes
 */
export function daysRemaining(endDate: string): number {
  try {
    const today = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - today;

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

/**
 * Obtiene el estado de alerta basado en días restantes
 * @param days - Número de días restantes
 * @returns Estado: 'normal' | 'warning' | 'danger' | 'critical'
 */
export function getAlertStatus(
  days: number
): 'normal' | 'warning' | 'danger' | 'critical' {
  if (days < 7) return 'critical';
  if (days < 15) return 'danger';
  if (days < 30) return 'warning';
  return 'normal';
}

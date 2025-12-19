/**
 * ===========================================
 * UTILITÁRIOS DE TEMPO
 * ===========================================
 * 
 * Funções para formatar e manipular tempo.
 */

/**
 * Formata segundos para o formato MM:SS
 * 
 * @example
 * formatTime(65)  // "01:05"
 * formatTime(0)   // "00:00"
 * formatTime(600) // "10:00"
 * 
 * @param seconds - Total de segundos
 * @returns String formatada "MM:SS"
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  // padStart garante 2 dígitos (ex: "5" vira "05")
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

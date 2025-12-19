/**
 * ===========================================
 * UTILITÁRIOS DE ARRAY
 * ===========================================
 * 
 * Funções puras que manipulam arrays.
 * "Puras" significa: mesma entrada = mesma saída.
 */

/**
 * Embaralha um array usando o algoritmo Fisher-Yates.
 * 
 * @example
 * shuffleArray([1, 2, 3, 4]) // [3, 1, 4, 2] (aleatório)
 * 
 * @param array - Array a ser embaralhado
 * @returns Novo array embaralhado (não modifica o original)
 */
export function shuffleArray<T>(array: T[]): T[] {
  // Cria uma cópia para não modificar o original
  const newArray = [...array];
  
  // Algoritmo Fisher-Yates: percorre do fim ao início
  // trocando cada elemento com um anterior aleatório
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  
  return newArray;
}

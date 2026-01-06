/**
 * ===========================================
 * GAMEIA Z-INDEX LAYER SYSTEM
 * ===========================================
 * 
 * Sistema padronizado de camadas para z-index.
 * Use SEMPRE estas constantes em vez de valores numéricos.
 */

export const Z_LAYERS = {
  // Elementos base e conteúdo
  base: 0,
  content: 10,
  
  // Elementos fixos e sticky
  sticky: 20,
  header: 25,
  
  // Dropdowns e menus
  dropdown: 30,
  popover: 35,
  
  // Overlays e modais
  overlay: 40,
  sidebar: 42,
  sheet: 45,
  modal: 50,
  
  // Elementos de feedback
  toast: 60,
  notification: 65,
  
  // Tooltips e elementos flutuantes
  tooltip: 70,
  
  // Elemento máximo (emergências)
  max: 100,
} as const;

export type ZLayerKey = keyof typeof Z_LAYERS;

/**
 * Retorna a classe Tailwind para um z-index
 */
export function getZIndex(layer: ZLayerKey): string {
  return `z-[${Z_LAYERS[layer]}]`;
}

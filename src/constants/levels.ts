/**
 * Sistema de Níveis
 * 
 * XP necessário para cada nível e recompensas associadas.
 * Fórmula: XP_necessário = level * 100
 */

import { TIER_COLORS, getLevelTier as getColorTier, type TierKey } from "./colors";

export interface LevelInfo {
  level: number;
  xpRequired: number;
  xpForNext: number;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
}

// XP ganho por ação
export const XP_REWARDS = {
  GAME_COMPLETED: 10,        // Completar qualquer jogo
  SCORE_BONUS: 0.1,          // 10% do score como XP
  ACHIEVEMENT_UNLOCK: 50,    // Desbloquear conquista
  TITLE_UNLOCK: 25,          // Desbloquear título
  DAILY_LOGIN: 5,            // Login diário
  TOP_10: 100,               // Entrar no top 10
  TOP_3: 250,                // Entrar no top 3
  TOP_1: 500,                // Primeiro lugar
};

// Títulos por nível
export const LEVEL_TITLES: Record<number, { title: string; icon: string }> = {
  1: { title: "Novato", icon: "🌱" },
  5: { title: "Aprendiz", icon: "📚" },
  10: { title: "Jogador", icon: "🎮" },
  15: { title: "Aventureiro", icon: "🗺️" },
  20: { title: "Guerreiro", icon: "⚔️" },
  25: { title: "Veterano", icon: "🎖️" },
  30: { title: "Mestre", icon: "🏆" },
  35: { title: "Campeão", icon: "👑" },
  40: { title: "Lenda", icon: "⭐" },
  45: { title: "Herói", icon: "🦸" },
  50: { title: "Titã", icon: "🗿" },
  60: { title: "Semideus", icon: "⚡" },
  70: { title: "Deus", icon: "☀️" },
  80: { title: "Supremo", icon: "💎" },
  90: { title: "Transcendente", icon: "🌌" },
  100: { title: "Infinito", icon: "♾️" },
};

// Cores por faixa de nível - usando sistema centralizado
export const LEVEL_COLORS: Record<TierKey, { color: string; bgColor: string; glowColor: string }> = {
  bronze: { color: "text-tier-bronze", bgColor: "bg-tier-bronze/20", glowColor: "shadow-[0_0_10px_hsl(var(--tier-bronze)/0.3)]" },
  silver: { color: "text-tier-silver", bgColor: "bg-tier-silver/20", glowColor: "shadow-[0_0_10px_hsl(var(--tier-silver)/0.3)]" },
  gold: { color: "text-tier-gold", bgColor: "bg-tier-gold/20", glowColor: "shadow-[0_0_15px_hsl(var(--tier-gold)/0.4)]" },
  platinum: { color: "text-tier-platinum", bgColor: "bg-tier-platinum/20", glowColor: "shadow-[0_0_18px_hsl(var(--tier-platinum)/0.4)]" },
  diamond: { color: "text-tier-diamond", bgColor: "bg-tier-diamond/20", glowColor: "shadow-[0_0_20px_hsl(var(--tier-diamond)/0.5)]" },
  master: { color: "text-tier-master", bgColor: "bg-tier-master/20", glowColor: "shadow-[0_0_25px_hsl(var(--tier-master)/0.5)]" },
  grandmaster: { color: "text-tier-grandmaster", bgColor: "bg-tier-grandmaster/20", glowColor: "shadow-glow" },
  legendary: { color: "text-primary", bgColor: "bg-gradient-primary", glowColor: "shadow-glow-strong" },
};

/**
 * Retorna a faixa de cor baseada no nível
 */
export function getLevelTier(level: number): TierKey {
  return getColorTier(level);
}

/**
 * Calcula XP necessário para um nível
 */
export function getXPForLevel(level: number): number {
  return level * 100;
}

/**
 * Calcula o nível baseado no XP total
 */
export function calculateLevel(xp: number): number {
  return Math.min(100, Math.max(1, Math.floor(xp / 100) + 1));
}

/**
 * Retorna informações completas do nível
 */
export function getLevelInfo(level: number, currentXP: number): LevelInfo {
  const tier = getLevelTier(level);
  const tierColors = LEVEL_COLORS[tier];
  
  // Encontra o título mais alto que o jogador desbloqueou
  const unlockedTitles = Object.entries(LEVEL_TITLES)
    .filter(([lvl]) => parseInt(lvl) <= level)
    .sort(([a], [b]) => parseInt(b) - parseInt(a));
  
  const currentTitle = unlockedTitles[0] || LEVEL_TITLES[1];
  
  const xpRequired = getXPForLevel(level);
  const xpForNext = getXPForLevel(level + 1);
  const xpInCurrentLevel = currentXP - (level - 1) * 100;
  
  return {
    level,
    xpRequired,
    xpForNext,
    title: currentTitle[1].title,
    icon: currentTitle[1].icon,
    color: tierColors.color,
    bgColor: tierColors.bgColor,
  };
}

/**
 * Calcula progresso para o próximo nível (0-100%)
 */
export function getLevelProgress(xp: number, level: number): number {
  const xpInLevel = xp - (level - 1) * 100;
  return Math.min(100, Math.max(0, xpInLevel));
}

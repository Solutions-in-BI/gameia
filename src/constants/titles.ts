/**
 * Sistema de Títulos
 * 
 * Títulos desbloqueáveis baseados em conquistas do jogador.
 * Cada título tem requisitos específicos para ser desbloqueado.
 */

export interface GameTitle {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "general" | "snake" | "dino" | "tetris" | "memory";
  rarity: "common" | "rare" | "epic" | "legendary";
  requirement: {
    type: "score" | "games" | "achievement" | "rank";
    game?: string;
    value: number;
    achievementId?: string;
  };
}

export const GAME_TITLES: GameTitle[] = [
  // Títulos Gerais
  {
    id: "iniciante",
    name: "Iniciante",
    description: "Complete seu primeiro jogo",
    icon: "🌱",
    category: "general",
    rarity: "common",
    requirement: { type: "games", value: 1 },
  },
  {
    id: "jogador_dedicado",
    name: "Jogador Dedicado",
    description: "Complete 50 jogos",
    icon: "🎮",
    category: "general",
    rarity: "rare",
    requirement: { type: "games", value: 50 },
  },
  {
    id: "veterano",
    name: "Veterano",
    description: "Complete 100 jogos",
    icon: "⭐",
    category: "general",
    rarity: "epic",
    requirement: { type: "games", value: 100 },
  },
  {
    id: "lenda_viva",
    name: "Lenda Viva",
    description: "Complete 500 jogos",
    icon: "👑",
    category: "general",
    rarity: "legendary",
    requirement: { type: "games", value: 500 },
  },

  // Títulos Snake
  {
    id: "domador_serpentes",
    name: "Domador de Serpentes",
    description: "Alcance 100 pontos no Snake",
    icon: "🐍",
    category: "snake",
    rarity: "common",
    requirement: { type: "score", game: "snake", value: 100 },
  },
  {
    id: "rei_cobra",
    name: "Rei Cobra",
    description: "Alcance 300 pontos no Snake",
    icon: "🐍",
    category: "snake",
    rarity: "rare",
    requirement: { type: "score", game: "snake", value: 300 },
  },
  {
    id: "imperador_serpente",
    name: "Imperador Serpente",
    description: "Alcance 500 pontos no Snake",
    icon: "🐍",
    category: "snake",
    rarity: "epic",
    requirement: { type: "score", game: "snake", value: 500 },
  },
  {
    id: "mestre_snake",
    name: "Mestre do Snake",
    description: "Top 3 no ranking Snake",
    icon: "🏆",
    category: "snake",
    rarity: "legendary",
    requirement: { type: "rank", game: "snake", value: 3 },
  },

  // Títulos Dino
  {
    id: "corredor_jurassico",
    name: "Corredor Jurássico",
    description: "Alcance 200 pontos no Dino",
    icon: "🦖",
    category: "dino",
    rarity: "common",
    requirement: { type: "score", game: "dino", value: 200 },
  },
  {
    id: "dinossauro_veloz",
    name: "Dinossauro Veloz",
    description: "Alcance 500 pontos no Dino",
    icon: "🦖",
    category: "dino",
    rarity: "rare",
    requirement: { type: "score", game: "dino", value: 500 },
  },
  {
    id: "rei_jurássico",
    name: "Rei Jurássico",
    description: "Alcance 1000 pontos no Dino",
    icon: "🦖",
    category: "dino",
    rarity: "epic",
    requirement: { type: "score", game: "dino", value: 1000 },
  },
  {
    id: "mestre_dino",
    name: "Mestre do Dino",
    description: "Top 3 no ranking Dino",
    icon: "🏆",
    category: "dino",
    rarity: "legendary",
    requirement: { type: "rank", game: "dino", value: 3 },
  },

  // Títulos Tetris
  {
    id: "empilhador",
    name: "Empilhador",
    description: "Alcance 1000 pontos no Tetris",
    icon: "🧱",
    category: "tetris",
    rarity: "common",
    requirement: { type: "score", game: "tetris", value: 1000 },
  },
  {
    id: "arquiteto",
    name: "Arquiteto",
    description: "Alcance 5000 pontos no Tetris",
    icon: "🧱",
    category: "tetris",
    rarity: "rare",
    requirement: { type: "score", game: "tetris", value: 5000 },
  },
  {
    id: "imperador_blocos",
    name: "Imperador dos Blocos",
    description: "Alcance 10000 pontos no Tetris",
    icon: "🧱",
    category: "tetris",
    rarity: "epic",
    requirement: { type: "score", game: "tetris", value: 10000 },
  },
  {
    id: "mestre_tetris",
    name: "Mestre do Tetris",
    description: "Top 3 no ranking Tetris",
    icon: "🏆",
    category: "tetris",
    rarity: "legendary",
    requirement: { type: "rank", game: "tetris", value: 3 },
  },

  // Títulos Memória
  {
    id: "mente_aguçada",
    name: "Mente Aguçada",
    description: "Complete o modo fácil em menos de 15 movimentos",
    icon: "🧠",
    category: "memory",
    rarity: "common",
    requirement: { type: "score", game: "memory", value: 15 },
  },
  {
    id: "memoria_fotografica",
    name: "Memória Fotográfica",
    description: "Complete o modo difícil",
    icon: "🧠",
    category: "memory",
    rarity: "rare",
    requirement: { type: "games", game: "memory", value: 10 },
  },
  {
    id: "genio_cerebral",
    name: "Gênio Cerebral",
    description: "Complete 50 jogos de memória",
    icon: "🧠",
    category: "memory",
    rarity: "epic",
    requirement: { type: "games", game: "memory", value: 50 },
  },
  {
    id: "mestre_memoria",
    name: "Mestre da Memória",
    description: "Top 3 no ranking Memória",
    icon: "🏆",
    category: "memory",
    rarity: "legendary",
    requirement: { type: "rank", game: "memory", value: 3 },
  },

  // Títulos Especiais
  {
    id: "campeao_supremo",
    name: "Campeão Supremo",
    description: "Seja Top 1 em qualquer ranking",
    icon: "👑",
    category: "general",
    rarity: "legendary",
    requirement: { type: "rank", value: 1 },
  },
  {
    id: "colecionador",
    name: "Colecionador",
    description: "Desbloqueie 10 conquistas",
    icon: "🏅",
    category: "general",
    rarity: "rare",
    requirement: { type: "achievement", value: 10 },
  },
  {
    id: "perfeccionista",
    name: "Perfeccionista",
    description: "Desbloqueie todas as conquistas",
    icon: "💎",
    category: "general",
    rarity: "legendary",
    requirement: { type: "achievement", value: 50 },
  },
];

export const RARITY_COLORS = {
  common: {
    border: "border-muted-foreground/30",
    bg: "bg-muted/20",
    text: "text-muted-foreground",
  },
  rare: {
    border: "border-blue-500/50",
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
  epic: {
    border: "border-purple-500/50",
    bg: "bg-purple-500/10",
    text: "text-purple-500",
  },
  legendary: {
    border: "border-yellow-500/50",
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
  },
};

export const RARITY_LABELS = {
  common: "Comum",
  rare: "Raro",
  epic: "Épico",
  legendary: "Lendário",
};

export function getTitleById(id: string): GameTitle | undefined {
  return GAME_TITLES.find(t => t.id === id);
}

export function getTitlesByCategory(category: string): GameTitle[] {
  return GAME_TITLES.filter(t => t.category === category);
}

/**
 * ===========================================
 * GAMEIA CENTRALIZED COLOR SYSTEM
 * ===========================================
 * 
 * Este arquivo centraliza TODAS as cores semânticas do sistema.
 * NUNCA use cores hardcoded (purple-500, blue-400, etc.) em componentes.
 * Sempre use as variáveis e classes definidas aqui.
 * 
 * Paleta: Honey & Charcoal
 */

// ============================================
// CORES DE STATUS
// ============================================
export const STATUS_COLORS = {
  success: {
    text: "text-gameia-success",
    bg: "bg-gameia-success",
    bgSubtle: "bg-gameia-success/10",
    border: "border-gameia-success/20",
    badge: "bg-gameia-success/10 text-gameia-success border-gameia-success/20",
  },
  warning: {
    text: "text-gameia-warning",
    bg: "bg-gameia-warning",
    bgSubtle: "bg-gameia-warning/10",
    border: "border-gameia-warning/20",
    badge: "bg-gameia-warning/10 text-gameia-warning border-gameia-warning/20",
  },
  error: {
    text: "text-destructive",
    bg: "bg-destructive",
    bgSubtle: "bg-destructive/10",
    border: "border-destructive/20",
    badge: "bg-destructive/10 text-destructive border-destructive/20",
  },
  info: {
    text: "text-gameia-info",
    bg: "bg-gameia-info",
    bgSubtle: "bg-gameia-info/10",
    border: "border-gameia-info/20",
    badge: "bg-gameia-info/10 text-gameia-info border-gameia-info/20",
  },
} as const;

// ============================================
// CORES DE RARIDADE (Marketplace, Badges, Items)
// ============================================
export const RARITY_COLORS = {
  common: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    bgSubtle: "bg-muted/50",
    border: "border-border",
    glow: "",
    label: "Comum",
  },
  uncommon: {
    text: "text-gameia-success",
    bg: "bg-gameia-success",
    bgSubtle: "bg-gameia-success/10",
    border: "border-gameia-success/30",
    glow: "",
    label: "Incomum",
  },
  rare: {
    text: "text-gameia-info",
    bg: "bg-gameia-info",
    bgSubtle: "bg-gameia-info/10",
    border: "border-gameia-info/30",
    glow: "shadow-[0_0_10px_hsl(var(--gameia-info)/0.3)]",
    label: "Raro",
  },
  epic: {
    text: "text-secondary-foreground",
    bg: "bg-secondary",
    bgSubtle: "bg-secondary/20",
    border: "border-secondary/40",
    glow: "shadow-[0_0_15px_hsl(var(--secondary)/0.4)]",
    label: "Épico",
  },
  legendary: {
    text: "text-primary",
    bg: "bg-primary",
    bgSubtle: "bg-primary/15",
    border: "border-primary/40",
    glow: "shadow-glow animate-pulse",
    label: "Lendário",
  },
} as const;

export type RarityKey = keyof typeof RARITY_COLORS;

// ============================================
// CORES DE TIER/NÍVEL (Levels, Rankings)
// ============================================
export const TIER_COLORS = {
  bronze: {
    text: "text-tier-bronze",
    bg: "bg-tier-bronze",
    bgSubtle: "bg-tier-bronze/15",
    glow: "shadow-[0_0_10px_hsl(var(--tier-bronze)/0.3)]",
  },
  silver: {
    text: "text-tier-silver",
    bg: "bg-tier-silver",
    bgSubtle: "bg-tier-silver/15",
    glow: "shadow-[0_0_12px_hsl(var(--tier-silver)/0.3)]",
  },
  gold: {
    text: "text-tier-gold",
    bg: "bg-tier-gold",
    bgSubtle: "bg-tier-gold/15",
    glow: "shadow-[0_0_15px_hsl(var(--tier-gold)/0.4)]",
  },
  platinum: {
    text: "text-tier-platinum",
    bg: "bg-tier-platinum",
    bgSubtle: "bg-tier-platinum/15",
    glow: "shadow-[0_0_18px_hsl(var(--tier-platinum)/0.4)]",
  },
  diamond: {
    text: "text-tier-diamond",
    bg: "bg-tier-diamond",
    bgSubtle: "bg-tier-diamond/15",
    glow: "shadow-[0_0_20px_hsl(var(--tier-diamond)/0.5)]",
  },
  master: {
    text: "text-tier-master",
    bg: "bg-tier-master",
    bgSubtle: "bg-tier-master/15",
    glow: "shadow-[0_0_25px_hsl(var(--tier-master)/0.5)]",
  },
  grandmaster: {
    text: "text-tier-grandmaster",
    bg: "bg-tier-grandmaster",
    bgSubtle: "bg-tier-grandmaster/15",
    glow: "shadow-glow-strong",
  },
  legendary: {
    text: "text-primary",
    bg: "bg-gradient-primary",
    bgSubtle: "bg-primary/20",
    glow: "shadow-glow-strong animate-pulse",
  },
} as const;

export type TierKey = keyof typeof TIER_COLORS;

// ============================================
// CORES DE CATEGORIA DE SKILLS
// ============================================
export const SKILL_CATEGORY_COLORS = {
  comunicacao: {
    text: "text-gameia-info",
    bg: "bg-gameia-info",
    bgSubtle: "bg-gameia-info/10",
    border: "border-gameia-info/20",
    icon: "text-gameia-info",
  },
  lideranca: {
    text: "text-accent",
    bg: "bg-accent",
    bgSubtle: "bg-accent/10",
    border: "border-accent/20",
    icon: "text-accent",
  },
  tecnico: {
    text: "text-secondary-foreground",
    bg: "bg-secondary",
    bgSubtle: "bg-secondary/10",
    border: "border-secondary/20",
    icon: "text-secondary-foreground",
  },
  vendas: {
    text: "text-gameia-success",
    bg: "bg-gameia-success",
    bgSubtle: "bg-gameia-success/10",
    border: "border-gameia-success/20",
    icon: "text-gameia-success",
  },
  negociacao: {
    text: "text-primary",
    bg: "bg-primary",
    bgSubtle: "bg-primary/10",
    border: "border-primary/20",
    icon: "text-primary",
  },
  atendimento: {
    text: "text-gameia-teal",
    bg: "bg-gameia-teal",
    bgSubtle: "bg-gameia-teal/10",
    border: "border-gameia-teal/20",
    icon: "text-gameia-teal",
  },
  default: {
    text: "text-muted-foreground",
    bg: "bg-muted",
    bgSubtle: "bg-muted/50",
    border: "border-border",
    icon: "text-muted-foreground",
  },
} as const;

export type SkillCategoryKey = keyof typeof SKILL_CATEGORY_COLORS;

// ============================================
// CORES DE PROFUNDIDADE (AI Reflection, Scores)
// ============================================
export const DEPTH_COLORS = {
  shallow: {
    text: "text-gameia-warning",
    bg: "bg-gameia-warning/10",
    label: "Superficial",
  },
  moderate: {
    text: "text-gameia-info",
    bg: "bg-gameia-info/10",
    label: "Moderado",
  },
  deep: {
    text: "text-gameia-success",
    bg: "bg-gameia-success/10",
    label: "Profundo",
  },
  exceptional: {
    text: "text-primary",
    bg: "bg-primary/10",
    label: "Excepcional",
  },
} as const;

export type DepthKey = keyof typeof DEPTH_COLORS;

// ============================================
// CORES DE PROGRESSO/PERFORMANCE
// ============================================
export const PROGRESS_COLORS = {
  low: {
    text: "text-destructive",
    bg: "bg-destructive",
    bgSubtle: "bg-destructive/10",
  },
  medium: {
    text: "text-gameia-warning",
    bg: "bg-gameia-warning",
    bgSubtle: "bg-gameia-warning/10",
  },
  high: {
    text: "text-gameia-success",
    bg: "bg-gameia-success",
    bgSubtle: "bg-gameia-success/10",
  },
  excellent: {
    text: "text-primary",
    bg: "bg-primary",
    bgSubtle: "bg-primary/10",
  },
} as const;

// ============================================
// CORES DE PILARES DO SISTEMA
// ============================================
export const PILLAR_COLORS = {
  curriculum: {
    text: "text-pillar-curriculum",
    bg: "bg-pillar-curriculum",
    bgSubtle: "bg-pillar-curriculum/10",
  },
  gamification: {
    text: "text-pillar-gamification",
    bg: "bg-pillar-gamification",
    bgSubtle: "bg-pillar-gamification/10",
  },
  guidance: {
    text: "text-pillar-guidance",
    bg: "bg-pillar-guidance",
    bgSubtle: "bg-pillar-guidance/10",
  },
} as const;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna as cores de raridade para uma chave
 */
export function getRarityColors(rarity: string) {
  return RARITY_COLORS[rarity as RarityKey] || RARITY_COLORS.common;
}

/**
 * Retorna as cores de tier para um nível
 */
export function getTierColors(tier: string) {
  return TIER_COLORS[tier as TierKey] || TIER_COLORS.bronze;
}

/**
 * Retorna as cores de categoria de skill
 */
export function getSkillCategoryColors(category: string) {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
  return SKILL_CATEGORY_COLORS[normalizedCategory as SkillCategoryKey] || SKILL_CATEGORY_COLORS.default;
}

/**
 * Retorna as cores de profundidade
 */
export function getDepthColors(depth: string) {
  return DEPTH_COLORS[depth as DepthKey] || DEPTH_COLORS.moderate;
}

/**
 * Retorna cor de progresso baseado em percentual
 */
export function getProgressColors(percentage: number) {
  if (percentage >= 90) return PROGRESS_COLORS.excellent;
  if (percentage >= 70) return PROGRESS_COLORS.high;
  if (percentage >= 40) return PROGRESS_COLORS.medium;
  return PROGRESS_COLORS.low;
}

/**
 * Retorna cor de status baseado em string
 */
export function getStatusColors(status: string) {
  const statusMap: Record<string, keyof typeof STATUS_COLORS> = {
    success: 'success',
    completed: 'success',
    active: 'success',
    approved: 'success',
    warning: 'warning',
    pending: 'warning',
    in_progress: 'warning',
    error: 'error',
    failed: 'error',
    rejected: 'error',
    cancelled: 'error',
    info: 'info',
    default: 'info',
  };
  
  return STATUS_COLORS[statusMap[status.toLowerCase()] || 'info'];
}

/**
 * Determina o tier baseado no nível numérico
 */
export function getLevelTier(level: number): TierKey {
  if (level >= 90) return 'legendary';
  if (level >= 75) return 'grandmaster';
  if (level >= 60) return 'master';
  if (level >= 45) return 'diamond';
  if (level >= 30) return 'platinum';
  if (level >= 20) return 'gold';
  if (level >= 10) return 'silver';
  return 'bronze';
}

/**
 * Ordem de raridade para sorting
 */
export function getRarityOrder(rarity: string): number {
  const order: Record<string, number> = {
    legendary: 5,
    epic: 4,
    rare: 3,
    uncommon: 2,
    common: 1,
  };
  return order[rarity] || 0;
}

// ============================================
// CORES DE TIPOS DE CONTEÚDO
// ============================================
export const CONTENT_TYPE_COLORS = {
  training: {
    gradient: "from-primary to-accent",
    gradientSubtle: "from-primary/10 to-accent/10",
    icon: "text-primary",
    border: "border-primary/30",
  },
  journey: {
    gradient: "from-secondary to-secondary/80",
    gradientSubtle: "from-secondary/10 to-secondary/5",
    icon: "text-secondary-foreground",
    border: "border-secondary/30",
  },
  skill: {
    gradient: "from-accent to-primary",
    gradientSubtle: "from-accent/10 to-primary/10",
    icon: "text-accent",
    border: "border-accent/30",
  },
  level: {
    gradient: "from-gameia-success to-gameia-teal",
    gradientSubtle: "from-gameia-success/10 to-gameia-teal/10",
    icon: "text-gameia-success",
    border: "border-gameia-success/30",
  },
  behavioral: {
    gradient: "from-destructive/80 to-destructive",
    gradientSubtle: "from-destructive/10 to-destructive/5",
    icon: "text-destructive",
    border: "border-destructive/30",
  },
} as const;

export type ContentTypeKey = keyof typeof CONTENT_TYPE_COLORS;

// ============================================
// CORES DE DIFICULDADE
// ============================================
export const DIFFICULTY_COLORS = {
  beginner: {
    text: "text-gameia-success",
    bg: "bg-gameia-success",
    bgSubtle: "bg-gameia-success/10",
    border: "border-gameia-success/30",
    gradient: "from-gameia-success to-gameia-teal",
    glow: "shadow-[0_0_15px_hsl(var(--gameia-success)/0.4)]",
  },
  easy: {
    text: "text-gameia-success",
    bg: "bg-gameia-success",
    bgSubtle: "bg-gameia-success/10",
    border: "border-gameia-success/30",
    gradient: "from-gameia-success to-gameia-teal",
    glow: "shadow-[0_0_15px_hsl(var(--gameia-success)/0.4)]",
  },
  intermediate: {
    text: "text-secondary-foreground",
    bg: "bg-secondary",
    bgSubtle: "bg-secondary/10",
    border: "border-secondary/30",
    gradient: "from-secondary to-muted",
    glow: "shadow-[0_0_15px_hsl(var(--secondary)/0.4)]",
  },
  medium: {
    text: "text-gameia-warning",
    bg: "bg-gameia-warning",
    bgSubtle: "bg-gameia-warning/10",
    border: "border-gameia-warning/30",
    gradient: "from-gameia-warning to-accent",
    glow: "shadow-[0_0_15px_hsl(var(--gameia-warning)/0.4)]",
  },
  advanced: {
    text: "text-primary",
    bg: "bg-primary",
    bgSubtle: "bg-primary/10",
    border: "border-primary/30",
    gradient: "from-primary to-accent",
    glow: "shadow-[0_0_15px_hsl(var(--primary)/0.4)]",
  },
  hard: {
    text: "text-destructive",
    bg: "bg-destructive",
    bgSubtle: "bg-destructive/10",
    border: "border-destructive/30",
    gradient: "from-destructive to-destructive/70",
    glow: "shadow-[0_0_15px_hsl(var(--destructive)/0.4)]",
  },
  expert: {
    text: "text-destructive",
    bg: "bg-destructive",
    bgSubtle: "bg-destructive/10",
    border: "border-destructive/30",
    gradient: "from-destructive to-destructive/80",
    glow: "shadow-[0_0_20px_hsl(var(--destructive)/0.5)]",
  },
} as const;

export type DifficultyKey = keyof typeof DIFFICULTY_COLORS;

/**
 * Retorna cores de dificuldade
 */
export function getDifficultyColors(difficulty: string) {
  const normalized = difficulty?.toLowerCase().replace(/\s+/g, '') || 'beginner';
  return DIFFICULTY_COLORS[normalized as DifficultyKey] || DIFFICULTY_COLORS.beginner;
}

// ============================================
// CORES DE AÇÕES/NEXT STEPS
// ============================================
export const ACTION_COLORS = {
  practice: {
    text: "text-accent",
    bg: "bg-accent",
    bgSubtle: "bg-accent/10",
    border: "border-accent/30",
    icon: "text-accent",
  },
  mission: {
    text: "text-gameia-success",
    bg: "bg-gameia-success",
    bgSubtle: "bg-gameia-success/10",
    border: "border-gameia-success/30",
    icon: "text-gameia-success",
  },
  meeting: {
    text: "text-gameia-info",
    bg: "bg-gameia-info",
    bgSubtle: "bg-gameia-info/10",
    border: "border-gameia-info/30",
    icon: "text-gameia-info",
  },
  reflection: {
    text: "text-secondary-foreground",
    bg: "bg-secondary",
    bgSubtle: "bg-secondary/10",
    border: "border-secondary/30",
    icon: "text-secondary-foreground",
  },
  goal: {
    text: "text-primary",
    bg: "bg-primary",
    bgSubtle: "bg-primary/10",
    border: "border-primary/30",
    icon: "text-primary",
  },
} as const;

export type ActionKey = keyof typeof ACTION_COLORS;

// ============================================
// CORES DE RECOMPENSAS
// ============================================
export const REWARD_COLORS = {
  xp: {
    text: "text-accent",
    icon: "text-accent",
    bg: "bg-accent",
    bgSubtle: "bg-accent/10",
    gradient: "from-accent/20 to-primary/20",
    border: "border-accent/30",
  },
  coins: {
    text: "text-primary",
    icon: "text-primary",
    bg: "bg-primary",
    bgSubtle: "bg-primary/10",
    gradient: "from-primary/20 to-accent/20",
    border: "border-primary/30",
  },
  badge: {
    text: "text-secondary-foreground",
    icon: "text-secondary-foreground",
    bg: "bg-secondary",
    bgSubtle: "bg-secondary/10",
    gradient: "from-secondary/20 to-muted/20",
    border: "border-secondary/30",
  },
  achievement: {
    text: "text-gameia-info",
    icon: "text-gameia-info",
    bg: "bg-gameia-info",
    bgSubtle: "bg-gameia-info/10",
    gradient: "from-gameia-info/20 to-accent/20",
    border: "border-gameia-info/30",
  },
  streak: {
    text: "text-primary",
    icon: "text-primary",
    bg: "bg-primary",
    bgSubtle: "bg-primary/10",
    gradient: "from-primary to-accent",
    border: "border-primary/30",
  },
} as const;

export type RewardKey = keyof typeof REWARD_COLORS;

// ============================================
// CORES DE MODOS DE JOGO
// ============================================
export const GAME_MODE_COLORS = {
  beginner: {
    gradient: "from-gameia-success/20 to-gameia-teal/20",
    gradientSolid: "from-gameia-success to-gameia-teal",
    border: "border-gameia-success/50",
    text: "text-gameia-success",
  },
  challenge: {
    gradient: "from-primary/20 to-accent/20",
    gradientSolid: "from-primary to-accent",
    border: "border-primary/50",
    text: "text-primary",
  },
  marathon: {
    gradient: "from-secondary/20 to-muted/20",
    gradientSolid: "from-secondary to-muted",
    border: "border-secondary/50",
    text: "text-secondary-foreground",
  },
  blitz: {
    gradient: "from-destructive/20 to-accent/20",
    gradientSolid: "from-destructive to-accent",
    border: "border-destructive/50",
    text: "text-destructive",
  },
  training: {
    gradient: "from-gameia-info/20 to-accent/20",
    gradientSolid: "from-gameia-info to-accent",
    border: "border-gameia-info/50",
    text: "text-gameia-info",
  },
} as const;

export type GameModeKey = keyof typeof GAME_MODE_COLORS;

// ============================================
// CORES DE FRAME/AVATAR (Raridade visual)
// ============================================
export const FRAME_RARITY_COLORS = {
  common: {
    ring: "ring-border",
    glow: "",
    gradient: "",
  },
  rare: {
    ring: "ring-gameia-info",
    glow: "shadow-[0_0_15px_hsl(var(--gameia-info)/0.5)]",
    gradient: "from-gameia-info via-gameia-teal to-gameia-info",
  },
  epic: {
    ring: "ring-secondary",
    glow: "shadow-[0_0_25px_hsl(var(--secondary)/0.6)]",
    gradient: "from-secondary via-muted to-secondary",
  },
  legendary: {
    ring: "ring-primary",
    glow: "shadow-[0_0_35px_hsl(var(--primary)/0.7)]",
    gradient: "from-primary via-accent to-primary",
  },
} as const;

export type FrameRarityKey = keyof typeof FRAME_RARITY_COLORS;

/**
 * Challenge Types Configuration
 * 
 * Configurações visuais e de comportamento para os tipos de desafios no GAMEIA.
 * Baseado no princípio: "Desafio não é conteúdo. Desafio é execução com prazo e consequência."
 */

import {
  Target,
  Brain,
  Trophy,
  Calendar,
  Users,
  Rocket,
  GraduationCap,
  Map,
  ClipboardCheck,
  UserCheck,
  Cpu,
  CheckCircle,
  FileText,
  Link,
  Upload,
  Activity,
  type LucideIcon,
} from "lucide-react";

// =====================================================
// TIPOS DE DESAFIO
// =====================================================

export type ChallengeType =
  | "practical"    // 🎯 Aplicação Prática
  | "cognitive"    // 🧠 Cognitivo
  | "performance"  // 🏆 Performance
  | "consistency"  // 📅 Consistência
  | "team"         // 🤝 Time
  | "strategic";   // 🚀 Estratégico

export interface ChallengeTypeConfig {
  icon: LucideIcon;
  label: string;
  emoji: string;
  color: string;
  description: string;
}

export const CHALLENGE_TYPE_CONFIG: Record<ChallengeType, ChallengeTypeConfig> = {
  practical: {
    icon: Target,
    label: "Aplicação Prática",
    emoji: "🎯",
    color: "blue",
    description: "Aplicar conhecimento no dia a dia",
  },
  cognitive: {
    icon: Brain,
    label: "Cognitivo",
    emoji: "🧠",
    color: "purple",
    description: "Desenvolver habilidades mentais",
  },
  performance: {
    icon: Trophy,
    label: "Performance",
    emoji: "🏆",
    color: "amber",
    description: "Atingir metas de resultado",
  },
  consistency: {
    icon: Calendar,
    label: "Consistência",
    emoji: "📅",
    color: "green",
    description: "Manter comportamentos ao longo do tempo",
  },
  team: {
    icon: Users,
    label: "Time",
    emoji: "🤝",
    color: "indigo",
    description: "Conquistas coletivas",
  },
  strategic: {
    icon: Rocket,
    label: "Estratégico",
    emoji: "🚀",
    color: "rose",
    description: "Impacto organizacional direto",
  },
};

// =====================================================
// ORIGEM DO DESAFIO
// =====================================================

export type ChallengeOrigin =
  | "training"    // Treinamento
  | "journey"     // Jornada
  | "pdi"         // PDI
  | "assessment"  // Avaliação
  | "manager"     // Gestor
  | "system";     // Sistema

export interface ChallengeOriginConfig {
  icon: LucideIcon;
  label: string;
  description: string;
}

export const CHALLENGE_ORIGIN_CONFIG: Record<ChallengeOrigin, ChallengeOriginConfig> = {
  training: {
    icon: GraduationCap,
    label: "Treinamento",
    description: "Criado a partir de um módulo de treinamento",
  },
  journey: {
    icon: Map,
    label: "Jornada",
    description: "Parte de uma jornada de desenvolvimento",
  },
  pdi: {
    icon: Target,
    label: "PDI",
    description: "Vinculado a uma meta do PDI",
  },
  assessment: {
    icon: ClipboardCheck,
    label: "Avaliação",
    description: "Criado a partir de resultado de avaliação",
  },
  manager: {
    icon: UserCheck,
    label: "Gestor",
    description: "Atribuído pelo gestor",
  },
  system: {
    icon: Cpu,
    label: "Sistema",
    description: "Gerado automaticamente pelo sistema",
  },
};

// =====================================================
// TIPO DE COMPROVAÇÃO
// =====================================================

export type ProofType =
  | "checkin"  // Check-in simples
  | "text"     // Texto/reflexão
  | "file"     // Upload de arquivo
  | "link"     // Link externo
  | "metric";  // Métrica automática

export interface ProofTypeConfig {
  icon: string;  // emoji for easy rendering
  lucideIcon: LucideIcon;
  label: string;
  description: string;
  requiresInput: boolean;
}

export const PROOF_TYPE_CONFIG: Record<ProofType, ProofTypeConfig> = {
  checkin: {
    icon: "✅",
    lucideIcon: CheckCircle,
    label: "Check-in",
    description: "Confirmar que executou a ação",
    requiresInput: false,
  },
  text: {
    icon: "📝",
    lucideIcon: FileText,
    label: "Texto",
    description: "Escrever reflexão ou evidência",
    requiresInput: true,
  },
  file: {
    icon: "📎",
    lucideIcon: Upload,
    label: "Arquivo",
    description: "Enviar arquivo como evidência",
    requiresInput: true,
  },
  link: {
    icon: "🔗",
    lucideIcon: Link,
    label: "Link",
    description: "Compartilhar link como evidência",
    requiresInput: true,
  },
  metric: {
    icon: "📊",
    lucideIcon: Activity,
    label: "Métrica",
    description: "Progresso medido automaticamente",
    requiresInput: false,
  },
};

// =====================================================
// HELPERS DE COR
// =====================================================

export function getChallengeTypeColor(type: ChallengeType): string {
  return CHALLENGE_TYPE_CONFIG[type]?.color || "blue";
}

export function getChallengeTypeClasses(type: ChallengeType): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  const color = getChallengeTypeColor(type);
  
  const colorMap: Record<string, { bg: string; text: string; border: string; badge: string }> = {
    blue: {
      bg: "bg-blue-500/10",
      text: "text-blue-500",
      border: "border-blue-500/30",
      badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    },
    purple: {
      bg: "bg-purple-500/10",
      text: "text-purple-500",
      border: "border-purple-500/30",
      badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    amber: {
      bg: "bg-amber-500/10",
      text: "text-amber-500",
      border: "border-amber-500/30",
      badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    green: {
      bg: "bg-green-500/10",
      text: "text-green-500",
      border: "border-green-500/30",
      badge: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    indigo: {
      bg: "bg-indigo-500/10",
      text: "text-indigo-500",
      border: "border-indigo-500/30",
      badge: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    },
    rose: {
      bg: "bg-rose-500/10",
      text: "text-rose-500",
      border: "border-rose-500/30",
      badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    },
  };

  return colorMap[color] || colorMap.blue;
}

// =====================================================
// REGRAS DE ECONOMIA (MOEDAS vs DIAMANTES)
// =====================================================

export interface RewardRules {
  coins: "high" | "medium" | "low" | "none";
  diamonds: "very_high" | "high" | "medium" | "low" | "none";
}

export const CHALLENGE_REWARD_RULES: Record<ChallengeType, RewardRules> = {
  practical: { coins: "medium", diamonds: "low" },
  cognitive: { coins: "high", diamonds: "none" },
  performance: { coins: "low", diamonds: "high" },
  consistency: { coins: "high", diamonds: "low" },
  team: { coins: "medium", diamonds: "medium" },
  strategic: { coins: "low", diamonds: "very_high" },
};

// Multiplicadores base para recompensas
export const REWARD_MULTIPLIERS = {
  coins: {
    high: 1.5,
    medium: 1.0,
    low: 0.5,
    none: 0,
  },
  diamonds: {
    very_high: 2.0,
    high: 1.5,
    medium: 1.0,
    low: 0.5,
    none: 0,
  },
};

// =====================================================
// PRIORIDADE POR PRAZO
// =====================================================

export function getDeadlinePriority(endsAt: string | Date): "critical" | "high" | "medium" | "low" {
  const deadline = new Date(endsAt);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 0) return "critical"; // Atrasado
  if (diffDays < 1) return "high";     // Hoje
  if (diffDays < 3) return "medium";   // Próximos 3 dias
  return "low";                         // Mais de 3 dias
}

export function getDeadlineClasses(priority: "critical" | "high" | "medium" | "low"): {
  bg: string;
  text: string;
  border: string;
} {
  const classes = {
    critical: {
      bg: "bg-red-500/10",
      text: "text-red-500",
      border: "border-red-500/30",
    },
    high: {
      bg: "bg-orange-500/10",
      text: "text-orange-500",
      border: "border-orange-500/30",
    },
    medium: {
      bg: "bg-yellow-500/10",
      text: "text-yellow-500",
      border: "border-yellow-500/30",
    },
    low: {
      bg: "bg-muted",
      text: "text-muted-foreground",
      border: "border-border",
    },
  };

  return classes[priority];
}

export function formatDeadlineText(endsAt: string | Date, isOverdue: boolean): string {
  if (isOverdue) return "Atrasado";
  
  const deadline = new Date(endsAt);
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Vence hoje";
  if (diffDays === 1) return "Vence amanhã";
  if (diffDays < 0) return `${Math.abs(diffDays)} dias atrasado`;
  if (diffDays <= 7) return `${diffDays} dias restantes`;
  
  return deadline.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

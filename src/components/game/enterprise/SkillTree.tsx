/**
 * Componente visual da árvore de habilidades - Caminho de Habilidades
 * Design baseado em grid com cards, níveis LV e barras de progresso coloridas
 * 
 * Paleta: Honey & Charcoal - usando cores centralizadas
 */

import { motion } from "framer-motion";
import { Lock, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkillWithProgress } from "@/hooks/useSkillTree";
import { getSkillCategoryColors, SKILL_CATEGORY_COLORS } from "@/constants/colors";

interface SkillTreeProps {
  skills: SkillWithProgress[];
  onSkillClick: (skill: SkillWithProgress) => void;
}

export function SkillTree({ skills, onSkillClick }: SkillTreeProps) {
  // Separar skills raiz das filhas
  const rootSkills = skills.filter(s => !s.parent_skill_id);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
        Caminho de Habilidades
      </h2>

      {/* Grid Container */}
      <div className="relative rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6">
        {/* Skills Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {skills.map((skill, index) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              onClick={() => onSkillClick(skill)}
              delay={index * 0.05}
            />
          ))}
        </div>

        {/* Connection Lines - visual decoration */}
        <SkillConnections skills={skills} />
      </div>
    </div>
  );
}

interface SkillCardProps {
  skill: SkillWithProgress;
  onClick: () => void;
  delay?: number;
}

function SkillCard({ skill, onClick, delay = 0 }: SkillCardProps) {
  const colors = getSkillCategoryColors(skill.name);
  const isLocked = !skill.isUnlocked;
  const masteryLevel = skill.masteryLevel || 0;
  const maxMastery = 5;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: isLocked ? 1 : 1.02 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      className={cn(
        "relative flex flex-col items-center p-5 rounded-2xl border transition-all duration-300",
        "bg-card/80 backdrop-blur-sm",
        isLocked 
          ? "border-border/30 opacity-50 cursor-not-allowed" 
          : "border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      )}
    >
      {/* Icon */}
      <div className={cn(
        "text-4xl mb-3",
        isLocked && "grayscale opacity-50"
      )}>
        {isLocked ? <Lock className="w-10 h-10 text-muted-foreground" /> : skill.icon}
      </div>

      {/* Name */}
      <h3 className={cn(
        "font-semibold text-center mb-2",
        isLocked ? "text-muted-foreground" : "text-foreground"
      )}>
        {skill.name}
      </h3>

      {/* Level Badge */}
      <div className={cn(
        "px-3 py-1 rounded-full text-xs font-bold border mb-3",
        isLocked 
          ? "bg-muted/50 text-muted-foreground border-border/50"
          : cn(colors.bgSubtle, colors.text, colors.border)
      )}>
        LV. {masteryLevel}/{maxMastery}
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-muted/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${skill.progress}%` }}
          transition={{ delay: delay + 0.2, duration: 0.5, ease: "easeOut" }}
          className={cn("h-full rounded-full", colors.bg)}
        />
      </div>

      {/* Arrow indicator for children */}
      {skill.children.length > 0 && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      )}
    </motion.button>
  );
}

// Visual connection lines between skills
function SkillConnections({ skills }: { skills: SkillWithProgress[] }) {
  // This is a decorative SVG overlay for visual connections
  // In a real implementation, you'd calculate positions based on parent/child relationships
  return (
    <svg 
      className="absolute inset-0 pointer-events-none opacity-30"
      style={{ zIndex: 0 }}
    >
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

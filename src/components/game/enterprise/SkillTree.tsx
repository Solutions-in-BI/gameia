/**
 * Componente visual da árvore de habilidades
 */

import { motion } from "framer-motion";
import { Lock, Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SkillWithProgress } from "@/hooks/useSkillTree";
import { Progress } from "@/components/ui/progress";

interface SkillTreeProps {
  skills: SkillWithProgress[];
  onSkillClick: (skill: SkillWithProgress) => void;
}

export function SkillTree({ skills, onSkillClick }: SkillTreeProps) {
  return (
    <div className="space-y-6">
      {skills.map((skill, index) => (
        <SkillBranch
          key={skill.id}
          skill={skill}
          onSkillClick={onSkillClick}
          delay={index * 0.1}
        />
      ))}
    </div>
  );
}

interface SkillBranchProps {
  skill: SkillWithProgress;
  onSkillClick: (skill: SkillWithProgress) => void;
  delay?: number;
  depth?: number;
}

function SkillBranch({ skill, onSkillClick, delay = 0, depth = 0 }: SkillBranchProps) {
  const isMastered = skill.masteryLevel >= 5;
  const isInProgress = skill.isUnlocked && skill.progress > 0 && !isMastered;

  return (
    <div className={cn("relative", depth > 0 && "ml-8")}>
      {/* Connection line */}
      {depth > 0 && (
        <div className="absolute -left-4 top-1/2 w-4 h-px bg-border" />
      )}

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay }}
      >
        {/* Skill Node */}
        <button
          onClick={() => onSkillClick(skill)}
          className={cn(
            "w-full p-4 rounded-xl border-2 transition-all duration-300",
            "flex items-center gap-4 text-left",
            skill.isUnlocked
              ? isMastered
                ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/50 hover:border-yellow-500"
                : "bg-card/80 border-primary/30 hover:border-primary hover:shadow-[var(--shadow-glow-primary)]"
              : "bg-muted/50 border-border/50 opacity-60 cursor-not-allowed"
          )}
          disabled={!skill.isUnlocked && depth > 0}
        >
          {/* Icon */}
          <div
            className={cn(
              "w-14 h-14 rounded-xl flex items-center justify-center text-2xl",
              skill.isUnlocked
                ? isMastered
                  ? "bg-gradient-to-br from-yellow-500/30 to-orange-500/30"
                  : "bg-primary/20"
                : "bg-muted"
            )}
          >
            {skill.isUnlocked ? (
              skill.icon
            ) : (
              <Lock className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{skill.name}</h3>
              {isMastered && (
                <CheckCircle2 className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {skill.description}
            </p>

            {/* Progress */}
            {skill.isUnlocked && !isMastered && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {skill.xpEarned} / {skill.xp_required} XP
                  </span>
                  <span className="text-primary">{Math.floor(skill.progress)}%</span>
                </div>
                <Progress value={skill.progress} className="h-1.5" />
              </div>
            )}

            {/* Mastery Stars */}
            {skill.isUnlocked && (
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <Star
                    key={level}
                    className={cn(
                      "w-3.5 h-3.5",
                      level <= skill.masteryLevel
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-muted-foreground/30"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Level Badge */}
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-bold",
              skill.isUnlocked
                ? "bg-primary/20 text-primary"
                : "bg-muted text-muted-foreground"
            )}
          >
            Nv. {skill.level}
          </div>
        </button>

        {/* Children */}
        {skill.children.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-border/50 pl-4">
            {skill.children.map((child, idx) => (
              <SkillBranch
                key={child.id}
                skill={child}
                onSkillClick={onSkillClick}
                delay={delay + (idx + 1) * 0.1}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

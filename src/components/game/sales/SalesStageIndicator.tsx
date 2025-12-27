import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { SalesStage } from "@/hooks/useSalesGame";

interface SalesStageIndicatorProps {
  stages: SalesStage[];
  currentStageIndex: number;
}

export function SalesStageIndicator({ stages, currentStageIndex }: SalesStageIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {stages.map((stage, index) => {
        const isCompleted = index < currentStageIndex;
        const isCurrent = index === currentStageIndex;
        const isPending = index > currentStageIndex;

        return (
          <div key={stage.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-lg
                  transition-all duration-300
                  ${isCompleted 
                    ? 'bg-green-500/20 border-2 border-green-500 text-green-400' 
                    : isCurrent
                      ? 'bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 animate-pulse'
                      : 'bg-muted/30 border-2 border-muted-foreground/30 text-muted-foreground/50'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  stage.icon || '💬'
                )}
              </div>
              <span
                className={`
                  text-xs mt-1 font-medium transition-all
                  ${isCurrent ? 'text-cyan-400' : isCompleted ? 'text-green-400' : 'text-muted-foreground/50'}
                `}
              >
                {stage.stage_label}
              </span>
            </motion.div>
            
            {index < stages.length - 1 && (
              <div
                className={`
                  w-8 h-0.5 mx-1 transition-all duration-300
                  ${isCompleted ? 'bg-green-500' : 'bg-muted-foreground/20'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

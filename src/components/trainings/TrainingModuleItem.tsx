import { motion } from "framer-motion";
import { Check, Lock, Flag, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TrainingModuleItemProps {
  index: number;
  name: string;
  duration?: number;
  isCheckpoint?: boolean;
  isLocked: boolean;
  isCompleted: boolean;
  isCurrent: boolean;
  score?: number | null;
  icon: LucideIcon;
  onClick: () => void;
}

export function TrainingModuleItem({
  index,
  name,
  duration,
  isCheckpoint,
  isLocked,
  isCompleted,
  isCurrent,
  score,
  icon: Icon,
  onClick,
}: TrainingModuleItemProps) {
  const content = (
    <motion.button
      whileHover={!isLocked ? { scale: 1.01 } : undefined}
      whileTap={!isLocked ? { scale: 0.99 } : undefined}
      onClick={!isLocked ? onClick : undefined}
      disabled={isLocked}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
        "border border-transparent",
        isLocked && "opacity-50 cursor-not-allowed",
        !isLocked && !isCurrent && !isCompleted && "hover:bg-accent/50 cursor-pointer",
        isCurrent && "bg-primary/10 border-primary",
        isCompleted && !isCurrent && "bg-emerald-500/10 hover:bg-emerald-500/20",
      )}
    >
      {/* Index / Status Circle */}
      <div 
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium",
          isLocked && "bg-muted text-muted-foreground",
          !isLocked && !isCompleted && !isCurrent && "bg-muted text-foreground",
          isCurrent && "bg-primary text-primary-foreground",
          isCompleted && "bg-emerald-500 text-white",
        )}
      >
        {isLocked ? (
          <Lock className="h-3.5 w-3.5" />
        ) : isCompleted ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
          >
            <Check className="h-4 w-4" />
          </motion.div>
        ) : (
          index
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span 
            className={cn(
              "text-sm font-medium truncate",
              isLocked && "text-muted-foreground",
              isCurrent && "text-primary",
              isCompleted && !isCurrent && "text-foreground",
            )}
          >
            {name}
          </span>
          {isCheckpoint && (
            <Flag className="h-3 w-3 text-amber-500 flex-shrink-0" />
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-0.5">
          <Icon className="h-3 w-3 text-muted-foreground" />
          {duration && (
            <span className="text-xs text-muted-foreground">
              {duration} min
            </span>
          )}
          {isCompleted && score !== null && score !== undefined && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {score}%
            </span>
          )}
        </div>
      </div>

      {/* Current Indicator */}
      {isCurrent && (
        <motion.div
          layoutId="current-module-indicator"
          className="w-1 h-8 bg-primary rounded-full"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  );

  if (isLocked) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-sm">Complete o módulo anterior primeiro</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return content;
}

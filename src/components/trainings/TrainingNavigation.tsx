import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TrainingNavigationProps {
  currentIndex: number;
  totalModules: number;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isLastModule: boolean;
  isCurrentModuleCompleted: boolean;
  canComplete: boolean;
  isCompleting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
}

export function TrainingNavigation({
  currentIndex,
  totalModules,
  canGoPrevious,
  canGoNext,
  isLastModule,
  isCurrentModuleCompleted,
  canComplete,
  isCompleting,
  onPrevious,
  onNext,
  onComplete,
}: TrainingNavigationProps) {
  const progressPercent = totalModules > 0 
    ? Math.round(((currentIndex + 1) / totalModules) * 100) 
    : 0;

  return (
    <footer className="sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
      {/* Mini Progress Bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="p-4 flex items-center justify-between gap-4">
        {/* Previous Button */}
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        {/* Center - Module Counter */}
        <div className="flex-1 text-center">
          <span className="text-sm text-muted-foreground">
            Módulo {currentIndex + 1} de {totalModules}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Complete Button - shown when module not completed */}
          {!isCurrentModuleCompleted && (
            <Button
              onClick={onComplete}
              disabled={!canComplete || isCompleting}
              className={cn(
                "gap-2",
                canComplete && "bg-emerald-600 hover:bg-emerald-700"
              )}
            >
              {isCompleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">
                {isLastModule ? "Concluir Treinamento" : "Concluir Módulo"}
              </span>
              <span className="sm:hidden">
                {isLastModule ? "Concluir" : "Concluir"}
              </span>
            </Button>
          )}

          {/* Next Button - shown when completed or navigating */}
          {isCurrentModuleCompleted && !isLastModule && (
            <Button
              onClick={onNext}
              disabled={!canGoNext}
              className="gap-2"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Completed State for last module */}
          {isCurrentModuleCompleted && isLastModule && (
            <Button
              variant="outline"
              className="gap-2 text-emerald-600 border-emerald-600"
              disabled
            >
              <Check className="h-4 w-4" />
              <span>Concluído</span>
            </Button>
          )}
        </div>
      </div>
    </footer>
  );
}

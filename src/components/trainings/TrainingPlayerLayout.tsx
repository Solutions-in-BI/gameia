import { ReactNode, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { TrainingSidebar } from "./TrainingSidebar";
import { TrainingNavigation } from "./TrainingNavigation";
import { Link } from "react-router-dom";

export interface TrainingModule {
  id: string;
  name: string;
  description?: string | null;
  order_index: number;
  content_type: string;
  step_type?: string;
  time_minutes?: number;
  xp_reward?: number;
  coins_reward?: number;
  is_checkpoint?: boolean;
  min_score?: number | null;
  is_preview?: boolean;
}

export interface ModuleProgress {
  module_id: string;
  is_completed: boolean;
  score?: number | null;
  time_spent_seconds?: number;
}

export interface Training {
  id: string;
  name: string;
  description?: string | null;
  icon?: string;
  color?: string;
  thumbnail_url?: string | null;
  xp_reward?: number;
  coins_reward?: number;
  certificate_enabled?: boolean;
}

interface TrainingPlayerLayoutProps {
  training: Training;
  modules: TrainingModule[];
  currentModule: TrainingModule | null;
  moduleProgress: ModuleProgress[];
  children: ReactNode;
  onModuleSelect: (moduleId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  canComplete: boolean;
  isCompleting?: boolean;
}

export function TrainingPlayerLayout({
  training,
  modules,
  currentModule,
  moduleProgress,
  children,
  onModuleSelect,
  onPrevious,
  onNext,
  onComplete,
  canComplete,
  isCompleting = false,
}: TrainingPlayerLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const completedCount = moduleProgress.filter(p => p.is_completed).length;
  const progressPercent = modules.length > 0 
    ? Math.round((completedCount / modules.length) * 100) 
    : 0;

  const currentIndex = currentModule 
    ? modules.findIndex(m => m.id === currentModule.id) 
    : -1;

  const isModuleCompleted = (moduleId: string) => {
    return moduleProgress.some(p => p.module_id === moduleId && p.is_completed);
  };

  const isModuleLocked = (moduleId: string) => {
    const moduleIndex = modules.findIndex(m => m.id === moduleId);
    if (moduleIndex <= 0) return false;
    
    const module = modules[moduleIndex];
    if (module.is_preview) return false;

    // Check if previous module is completed
    const prevModule = modules[moduleIndex - 1];
    const prevProgress = moduleProgress.find(p => p.module_id === prevModule.id);
    
    if (!prevProgress?.is_completed) return true;

    // Check min_score requirement of previous module
    if (prevModule.min_score && prevProgress.score !== null && prevProgress.score !== undefined) {
      if (prevProgress.score < prevModule.min_score) return true;
    }

    return false;
  };

  const handleModuleClick = (moduleId: string) => {
    if (!isModuleLocked(moduleId)) {
      onModuleSelect(moduleId);
      setSidebarOpen(false);
    }
  };

  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < modules.length - 1 && !isModuleLocked(modules[currentIndex + 1]?.id);
  const isLastModule = currentIndex === modules.length - 1;
  const isCurrentModuleCompleted = currentModule ? isModuleCompleted(currentModule.id) : false;

  const sidebarContent = (
    <TrainingSidebar
      training={training}
      modules={modules}
      currentModuleId={currentModule?.id || null}
      moduleProgress={moduleProgress}
      progressPercent={progressPercent}
      completedCount={completedCount}
      onModuleSelect={handleModuleClick}
      isModuleLocked={isModuleLocked}
      isModuleCompleted={isModuleCompleted}
    />
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside className="w-80 border-r border-border bg-card flex-shrink-0 sticky top-0 h-screen overflow-hidden">
          {sidebarContent}
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile Header */}
        {isMobile && (
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between p-4">
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  {sidebarContent}
                </SheetContent>
              </Sheet>

              <div className="flex-1 text-center">
                <p className="text-sm font-medium truncate px-4">
                  {currentModule?.name || training.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  Módulo {currentIndex + 1} de {modules.length}
                </p>
              </div>

              <Link to={`/trainings/${training.id}`}>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Mobile Progress Bar */}
            <div className="h-1 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </header>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="flex items-center justify-between p-4">
              <Link to={`/trainings/${training.id}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Voltar ao treinamento</span>
              </Link>

              <div className="text-center">
                <p className="text-sm font-medium">
                  {currentModule?.name}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                Módulo {currentIndex + 1} de {modules.length}
              </div>
            </div>
          </header>
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentModule?.id || 'empty'}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Navigation Footer */}
        <TrainingNavigation
          currentIndex={currentIndex}
          totalModules={modules.length}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          isLastModule={isLastModule}
          isCurrentModuleCompleted={isCurrentModuleCompleted}
          canComplete={canComplete}
          isCompleting={isCompleting}
          onPrevious={onPrevious}
          onNext={onNext}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}

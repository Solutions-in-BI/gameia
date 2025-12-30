/**
 * AssessmentConsequencesCard - Mostra ações geradas por avaliações
 * O usuário pode aceitar ou dispensar cada sugestão
 */

import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Target,
  BookOpen,
  Zap,
  Users,
  Lightbulb,
  Rocket,
  Check,
  X,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useQuickAssessment, AssessmentConsequence } from "@/hooks/useQuickAssessment";
import { cn } from "@/lib/utils";

interface AssessmentConsequencesCardProps {
  className?: string;
  maxItems?: number;
  showHeader?: boolean;
}

const CONSEQUENCE_CONFIG: Record<string, {
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}> = {
  pdi_goal: {
    label: 'Meta PDI',
    icon: Target,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  training_suggestion: {
    label: 'Treinamento',
    icon: BookOpen,
    color: 'text-blue-600',
    bgColor: 'bg-blue-500/10',
  },
  challenge: {
    label: 'Desafio',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-500/10',
  },
  one_on_one: {
    label: '1:1',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-500/10',
  },
  insight: {
    label: 'Insight',
    icon: Lightbulb,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-500/10',
  },
  mission: {
    label: 'Missão',
    icon: Rocket,
    color: 'text-rose-600',
    bgColor: 'bg-rose-500/10',
  },
};

export function AssessmentConsequencesCard({
  className,
  maxItems = 5,
  showHeader = true,
}: AssessmentConsequencesCardProps) {
  const { pendingConsequences, consequencesLoading, acceptConsequence, dismissConsequence } = useQuickAssessment();

  const visibleConsequences = pendingConsequences?.slice(0, maxItems) || [];
  const hasMore = (pendingConsequences?.length || 0) > maxItems;

  if (consequencesLoading || !visibleConsequences.length) {
    return null;
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      {showHeader && (
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Ações Sugeridas
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {pendingConsequences?.length || 0} pendentes
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className={showHeader ? "pt-0" : "pt-4"}>
        <ScrollArea className="max-h-[300px]">
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {visibleConsequences.map((consequence, index) => (
                <ConsequenceItem
                  key={consequence.id}
                  consequence={consequence}
                  index={index}
                  onAccept={() => acceptConsequence.mutate(consequence.id)}
                  onDismiss={() => dismissConsequence.mutate(consequence.id)}
                />
              ))}
            </AnimatePresence>
          </div>
          
          {hasMore && (
            <Button
              variant="ghost"
              className="w-full mt-2 text-xs text-muted-foreground"
            >
              Ver mais {(pendingConsequences?.length || 0) - maxItems} ações
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface ConsequenceItemProps {
  consequence: AssessmentConsequence;
  index: number;
  onAccept: () => void;
  onDismiss: () => void;
}

function ConsequenceItem({ consequence, index, onAccept, onDismiss }: ConsequenceItemProps) {
  const config = CONSEQUENCE_CONFIG[consequence.consequence_type] || CONSEQUENCE_CONFIG.insight;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-lg border",
        "hover:border-primary/30 transition-colors"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        config.bgColor
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            {config.label}
          </Badge>
          {consequence.priority >= 7 && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              Importante
            </Badge>
          )}
        </div>
        <p className="text-sm font-medium text-foreground truncate">
          {consequence.title}
        </p>
        {consequence.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {consequence.description}
          </p>
        )}
      </div>

      <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-destructive"
          onClick={onDismiss}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          onClick={onAccept}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

// Compact inline version for embedding in other components
export function AssessmentConsequencesInline({ className }: { className?: string }) {
  const { pendingConsequences, consequencesLoading, acceptConsequence, dismissConsequence } = useQuickAssessment();

  if (consequencesLoading || !pendingConsequences?.length) {
    return null;
  }

  const consequence = pendingConsequences[0];
  const config = CONSEQUENCE_CONFIG[consequence.consequence_type] || CONSEQUENCE_CONFIG.insight;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg bg-muted/50 border",
        className
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        config.bgColor
      )}>
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{config.label}</p>
        <p className="text-sm font-medium truncate">{consequence.title}</p>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => dismissConsequence.mutate(consequence.id)}
        >
          Pular
        </Button>
        <Button
          size="sm"
          className="h-7 text-xs"
          onClick={() => acceptConsequence.mutate(consequence.id)}
        >
          Aceitar
        </Button>
      </div>

      {pendingConsequences.length > 1 && (
        <Badge variant="secondary" className="text-[10px]">
          +{pendingConsequences.length - 1}
        </Badge>
      )}
    </motion.div>
  );
}

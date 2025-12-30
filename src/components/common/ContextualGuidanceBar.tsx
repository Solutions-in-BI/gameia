/**
 * ContextualGuidanceBar - Barra de orientação contextual
 * Mostra onde o usuário está, o que está desenvolvendo e próximo passo sugerido
 */

import { ChevronRight, MapPin, Target, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ContextualGuidanceBarProps {
  /** Breadcrumb path - e.g. ["Arena", "Teste Cognitivo", "Raciocínio Lógico"] */
  breadcrumbs: string[];
  /** Skills being developed */
  skillsImpacted?: string[];
  /** Next suggested step */
  nextStep?: {
    label: string;
    href: string;
    type: "journey" | "training" | "game" | "test";
  };
  /** Show compact version */
  compact?: boolean;
  className?: string;
}

export function ContextualGuidanceBar({
  breadcrumbs,
  skillsImpacted,
  nextStep,
  compact = false,
  className
}: ContextualGuidanceBarProps) {
  const typeIcons = {
    journey: "🎯",
    training: "📚",
    game: "🎮",
    test: "🧠",
  };

  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg text-sm",
        className
      )}>
        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <div className="flex items-center gap-1 text-muted-foreground overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1 whitespace-nowrap">
              {index > 0 && <ChevronRight className="w-3 h-3" />}
              <span className={index === breadcrumbs.length - 1 ? "text-foreground font-medium" : ""}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-muted/80 via-muted/50 to-muted/30 border rounded-xl p-4 space-y-3",
      className
    )}>
      {/* Location */}
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary shrink-0" />
        <div className="flex items-center gap-1 text-sm overflow-x-auto">
          {breadcrumbs.map((crumb, index) => (
            <span key={index} className="flex items-center gap-1 whitespace-nowrap">
              {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
              <span className={cn(
                index === breadcrumbs.length - 1 
                  ? "text-foreground font-semibold" 
                  : "text-muted-foreground"
              )}>
                {crumb}
              </span>
            </span>
          ))}
        </div>
      </div>

      {/* Skills + Next Step Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Skills Being Developed */}
        {skillsImpacted && skillsImpacted.length > 0 && (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-sm text-muted-foreground">Desenvolvendo:</span>
            <div className="flex flex-wrap gap-1">
              {skillsImpacted.slice(0, 3).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                >
                  {skill}
                </Badge>
              ))}
              {skillsImpacted.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{skillsImpacted.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Next Step Suggestion */}
        {nextStep && (
          <Link 
            to={nextStep.href}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors group"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <span className="text-muted-foreground">Próximo:</span>{" "}
              <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                {typeIcons[nextStep.type]} {nextStep.label}
              </span>
            </span>
            <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Helper to build breadcrumbs from context
 */
export function buildContextBreadcrumbs(context: {
  section?: string;
  category?: string;
  item?: string;
}): string[] {
  const crumbs: string[] = [];
  if (context.section) crumbs.push(context.section);
  if (context.category) crumbs.push(context.category);
  if (context.item) crumbs.push(context.item);
  return crumbs;
}

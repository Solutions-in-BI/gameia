/**
 * GoalTypeSelector - Seletor de tipo de meta do PDI
 * Tipos: comportamental, técnica, cognitiva, performance
 */

import { Brain, Target, Gauge, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const GOAL_TYPES = [
  {
    value: "behavioral",
    label: "Comportamental",
    description: "Soft skills, comunicação, liderança",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    value: "technical",
    label: "Técnica",
    description: "Hard skills, conhecimentos específicos",
    icon: Target,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    value: "cognitive",
    label: "Cognitiva",
    description: "Raciocínio, memória, atenção",
    icon: Brain,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    value: "performance",
    label: "Performance",
    description: "Metas de resultado e entregas",
    icon: Gauge,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
] as const;

export type GoalType = typeof GOAL_TYPES[number]["value"];

interface GoalTypeSelectorProps {
  value: GoalType;
  onChange: (value: GoalType) => void;
  disabled?: boolean;
}

export function GoalTypeSelector({ value, onChange, disabled }: GoalTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {GOAL_TYPES.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.value;
        
        return (
          <button
            key={type.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(type.value)}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border-2 text-left transition-all",
              "hover:border-primary/50",
              isSelected 
                ? "border-primary bg-primary/5" 
                : "border-border bg-muted/30",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className={cn("p-2 rounded-lg", type.bgColor)}>
              <Icon className={cn("h-4 w-4", type.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{type.label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {type.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

export function getGoalTypeInfo(type: GoalType) {
  return GOAL_TYPES.find(t => t.value === type) || GOAL_TYPES[0];
}

export { GOAL_TYPES };

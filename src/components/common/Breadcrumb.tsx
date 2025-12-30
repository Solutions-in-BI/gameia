/**
 * Breadcrumb - Navegação hierárquica reutilizável
 * Suporta: Arena > Jornadas > [Jornada] > [Treinamento] > [Módulo]
 */

import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isCurrent?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center", className)}>
      <ol className="flex items-center gap-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
              )}
              
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-1 hover:text-primary transition-colors",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.icon}
                  <span className="max-w-[120px] truncate">{item.label}</span>
                </Link>
              ) : (
                <span className={cn(
                  "flex items-center gap-1",
                  isLast ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {item.icon}
                  <span className="max-w-[200px] truncate">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Helper function to build journey breadcrumbs
export function buildJourneyBreadcrumbs(
  journeyName?: string,
  journeyId?: string,
  trainingName?: string,
  trainingId?: string,
  moduleName?: string
): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Arena", href: "/app/arena" },
  ];

  if (journeyName && journeyId) {
    items.push({
      label: journeyName,
      href: `/app/journeys/${journeyId}`,
    });
  }

  if (trainingName && trainingId && journeyId) {
    items.push({
      label: trainingName,
      href: `/app/journeys/${journeyId}/training/${trainingId}`,
    });
  }

  if (moduleName) {
    items.push({
      label: moduleName,
      isCurrent: true,
    });
  }

  return items;
}

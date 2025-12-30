/**
 * ConsoleSidebar - Navegação lateral do console de configuração
 */

import { cn } from "@/lib/utils";
import {
  Building2,
  Shield,
  Gamepad2,
  GraduationCap,
  Brain,
  FileText,
  Plug,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Award,
  TrendingUp,
  Store,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export type ConsoleSection =
  | "organization"
  | "users"
  | "gamification"
  | "games"
  | "badges"
  | "levels"
  | "marketplace"
  | "trainings"
  | "trainings-catalog"
  | "trainings-evolution"
  | "cognitive"
  | "templates"
  | "integrations"
  | "audit";

interface ConsoleSidebarProps {
  activeSection: ConsoleSection;
  onSectionChange: (section: ConsoleSection) => void;
}

interface NavItem {
  id: ConsoleSection;
  label: string;
  icon: typeof Building2;
  description?: string;
  children?: { id: ConsoleSection; label: string; icon: typeof Building2 }[];
}

const NAV_ITEMS: NavItem[] = [
  { id: "organization", label: "Empresa & Billing", icon: Building2, description: "Dados e faturamento" },
  { id: "users", label: "Usuários & Permissões", icon: Shield, description: "Controle de acesso" },
  {
    id: "gamification",
    label: "Gamificação",
    icon: Gamepad2,
    description: "Regras do jogo",
    children: [
      { id: "games", label: "Jogos & XP", icon: Trophy },
      { id: "badges", label: "Badges", icon: Award },
      { id: "levels", label: "Níveis", icon: TrendingUp },
      { id: "marketplace", label: "Loja Virtual", icon: Store },
    ],
  },
  {
    id: "trainings",
    label: "Treinamentos",
    icon: GraduationCap,
    description: "Conteúdo e evolução",
    children: [
      { id: "trainings-catalog", label: "Catálogo", icon: GraduationCap },
      { id: "trainings-evolution", label: "Templates de Evolução", icon: TrendingUp },
    ],
  },
  { id: "cognitive", label: "Testes Cognitivos", icon: Brain, description: "Configuração de testes" },
  { id: "templates", label: "Templates", icon: FileText, description: "Modelos de compromissos" },
  { id: "integrations", label: "Integrações", icon: Plug, description: "Webhooks e APIs" },
  { id: "audit", label: "Logs & Auditoria", icon: ScrollText, description: "Histórico de ações" },
];

export function ConsoleSidebar({ activeSection, onSectionChange }: ConsoleSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>(["gamification"]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const isChildActive = (item: NavItem) => {
    return item.children?.some((child) => child.id === activeSection);
  };

  return (
    <aside
      className={cn(
        "h-[calc(100vh-4rem)] bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <div>
            <h2 className="font-semibold text-foreground">Console</h2>
            <p className="text-xs text-muted-foreground">Configurações</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;
          const isActive = activeSection === item.id || isChildActive(item);
          const isOpen = openGroups.includes(item.id);

          if (hasChildren && !collapsed) {
            return (
              <Collapsible key={item.id} open={isOpen} onOpenChange={() => toggleGroup(item.id)}>
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                      "hover:bg-accent/50",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-medium truncate", isActive && "text-primary")}>
                        {item.label}
                      </p>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = activeSection === child.id;

                    return (
                      <button
                        key={child.id}
                        onClick={() => onSectionChange(child.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                          "hover:bg-accent/50",
                          childActive
                            ? "bg-primary/10 text-primary border border-primary/20"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <ChildIcon className={cn("h-4 w-4 shrink-0", childActive && "text-primary")} />
                        <span className={cn("text-sm truncate", childActive && "font-medium text-primary")}>
                          {child.label}
                        </span>
                      </button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all",
                "hover:bg-accent/50",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium truncate", isActive && "text-primary")}>
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

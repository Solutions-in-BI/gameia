/**
 * ManageSidebar - Navegação lateral do painel de gestão
 */

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bell,
  UsersRound,
  Users,
  Target,
  ClipboardCheck,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type ManageSection =
  | "dashboard"
  | "alerts"
  | "teams"
  | "members"
  | "commitments"
  | "assessments"
  | "reports";

interface ManageSidebarProps {
  activeSection: ManageSection;
  onSectionChange: (section: ManageSection) => void;
}

const NAV_ITEMS: { id: ManageSection; label: string; icon: typeof LayoutDashboard; description?: string }[] = [
  { id: "dashboard", label: "Visão Executiva", icon: LayoutDashboard, description: "KPIs e métricas gerais" },
  { id: "alerts", label: "Alertas & Ações", icon: Bell, description: "Pendências e notificações" },
  { id: "teams", label: "Equipes", icon: UsersRound, description: "Gestão de times" },
  { id: "members", label: "Pessoas", icon: Users, description: "Gestão de colaboradores" },
  { id: "commitments", label: "Compromissos", icon: Target, description: "Metas e desafios" },
  { id: "assessments", label: "Avaliações", icon: ClipboardCheck, description: "360°, PDI e 1:1" },
  { id: "reports", label: "Relatórios", icon: FileText, description: "Análises e exportações" },
];

export function ManageSidebar({ activeSection, onSectionChange }: ManageSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

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
            <h2 className="font-semibold text-foreground">Gestão</h2>
            <p className="text-xs text-muted-foreground">Painel do Gestor</p>
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
          const isActive = activeSection === item.id;

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

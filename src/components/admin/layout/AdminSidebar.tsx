/**
 * AdminSidebar - Navegação hierárquica com grupos colapsáveis
 */

import { useState } from "react";
import {
  BarChart3,
  Users,
  UsersRound,
  UserPlus,
  Trophy,
  Gamepad2,
  FileText,
  TrendingUp,
  Settings,
  Building2,
  Award,
  Target,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Brain,
  BookOpen,
  Shield,
  Key,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export type AdminSection = 
  | "overview" 
  | "members" 
  | "teams" 
  | "invites" 
  | "challenges" 
  | "games-config"
  | "reports" 
  | "metrics"
  | "organization" 
  | "badges" 
  | "levels" 
  | "marketplace"
  | "skills"
  | "skill-mapping"
  | "quiz-content"
  | "scenario-content"
  | "trainings-config"
  | "sso"
  | "integrations";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  children: NavItem[];
}

type NavEntry = NavItem | NavGroup;

const ADMIN_NAV: NavEntry[] = [
  { id: "overview", label: "Dashboard", icon: BarChart3 },
  {
    id: "people",
    label: "Pessoas",
    icon: Users,
    children: [
      { id: "members", label: "Membros", icon: Users },
      { id: "teams", label: "Equipes", icon: UsersRound },
      { id: "invites", label: "Convites", icon: UserPlus },
    ],
  },
  {
    id: "content",
    label: "Conteúdo",
    icon: BookOpen,
    children: [
      { id: "trainings-config", label: "Treinamentos", icon: GraduationCap },
      { id: "quiz-content", label: "Perguntas Quiz", icon: HelpCircle },
      { id: "scenario-content", label: "Cenários", icon: Brain },
    ],
  },
  {
    id: "gamification",
    label: "Gamificação",
    icon: Gamepad2,
    children: [
      { id: "challenges", label: "Desafios", icon: Trophy },
      { id: "games-config", label: "Jogos", icon: Gamepad2 },
      { id: "marketplace", label: "Loja Virtual", icon: Award },
    ],
  },
  {
    id: "analytics",
    label: "Análise",
    icon: TrendingUp,
    children: [
      { id: "reports", label: "Relatórios", icon: FileText },
      { id: "metrics", label: "Métricas", icon: BarChart3 },
    ],
  },
  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    children: [
      { id: "organization", label: "Empresa", icon: Building2 },
      { id: "badges", label: "Badges", icon: Award },
      { id: "levels", label: "Níveis", icon: TrendingUp },
      { id: "skills", label: "Skills", icon: Target },
      { id: "sso", label: "SSO Corporativo", icon: Shield },
      { id: "integrations", label: "Integrações", icon: Key },
    ],
  },
];

function isGroup(entry: NavEntry): entry is NavGroup {
  return "children" in entry;
}

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  collapsed?: boolean;
}

export function AdminSidebar({ activeSection, onSectionChange, collapsed = false }: AdminSidebarProps) {
  // Determine which groups should be open based on active section
  const getInitialOpenGroups = () => {
    const openGroups: string[] = [];
    ADMIN_NAV.forEach((entry) => {
      if (isGroup(entry)) {
        if (entry.children.some((child) => child.id === activeSection)) {
          openGroups.push(entry.id);
        }
      }
    });
    return openGroups;
  };

  const [openGroups, setOpenGroups] = useState<string[]>(getInitialOpenGroups);

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const renderNavItem = (item: NavItem, isNested = false) => {
    const isActive = activeSection === item.id;
    const Icon = item.icon;

    return (
      <button
        key={item.id}
        onClick={() => onSectionChange(item.id)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
          isNested && "pl-10",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Icon className="w-4 h-4 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </button>
    );
  };

  const renderNavGroup = (group: NavGroup) => {
    const isOpen = openGroups.includes(group.id);
    const hasActiveChild = group.children.some((child) => child.id === activeSection);
    const Icon = group.icon;

    return (
      <Collapsible
        key={group.id}
        open={isOpen}
        onOpenChange={() => toggleGroup(group.id)}
      >
        <CollapsibleTrigger
          className={cn(
            "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
            hasActiveChild
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{group.label}</span>}
          </div>
          {!collapsed && (
            isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          )}
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          {group.children.map((child) => renderNavItem(child, true))}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <aside
      className={cn(
        "h-full border-r border-border bg-card flex-shrink-0 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <ScrollArea className="h-full py-4">
        <nav className="px-3 space-y-1">
          {ADMIN_NAV.map((entry) =>
            isGroup(entry) ? renderNavGroup(entry) : renderNavItem(entry)
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}

// Helper to get section labels for breadcrumbs
export function getSectionLabel(section: AdminSection): string {
  const labels: Record<AdminSection, string> = {
    overview: "Dashboard",
    members: "Membros",
    teams: "Equipes",
    invites: "Convites",
    challenges: "Desafios",
    "games-config": "Jogos",
    reports: "Relatórios",
    metrics: "Métricas",
    organization: "Empresa",
    badges: "Badges",
    levels: "Níveis",
    marketplace: "Loja Virtual",
    skills: "Skills",
    "skill-mapping": "Mapeamento de Skills",
    "quiz-content": "Perguntas Quiz",
    "scenario-content": "Cenários",
    "trainings-config": "Treinamentos",
    sso: "SSO Corporativo",
    integrations: "Integrações",
  };
  return labels[section];
}

// Helper to get parent group for breadcrumbs
export function getSectionParent(section: AdminSection): { id: string; label: string } | null {
  const parentMap: Record<AdminSection, { id: string; label: string } | null> = {
    overview: null,
    members: { id: "people", label: "Pessoas" },
    teams: { id: "people", label: "Pessoas" },
    invites: { id: "people", label: "Pessoas" },
    challenges: { id: "gamification", label: "Gamificação" },
    "games-config": { id: "gamification", label: "Gamificação" },
    reports: { id: "analytics", label: "Análise" },
    metrics: { id: "analytics", label: "Análise" },
    organization: { id: "settings", label: "Configurações" },
    badges: { id: "settings", label: "Configurações" },
    levels: { id: "settings", label: "Configurações" },
    marketplace: { id: "gamification", label: "Gamificação" },
    skills: { id: "settings", label: "Configurações" },
    "skill-mapping": { id: "settings", label: "Configurações" },
    "quiz-content": { id: "content", label: "Conteúdo" },
    "scenario-content": { id: "content", label: "Conteúdo" },
    "trainings-config": { id: "content", label: "Conteúdo" },
    sso: { id: "settings", label: "Configurações" },
    integrations: { id: "settings", label: "Configurações" },
  };
  return parentMap[section];
}

/**
 * Admin Center B2B - Painel Administrativo para Organizações
 * Acessado via rota /admin
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  BarChart3,
  Settings,
  Trophy,
  Mail,
  Link,
  Copy,
  Plus,
  UserPlus,
  Crown,
  Shield,
  ChevronRight,
  Loader2,
  Gamepad2,
  Award,
  TrendingUp,
  Target,
  ArrowLeft,
  RefreshCcw,
  UsersRound,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgMetrics, MetricPeriod } from "@/hooks/useOrgMetrics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GameConfigSettings } from "./settings/GameConfigSettings";
import { BadgeConfigSettings } from "./settings/BadgeConfigSettings";
import { LevelConfigSettings } from "./settings/LevelConfigSettings";
import { SkillConfigSettings } from "./settings/SkillConfigSettings";
import { OrganizationSettings } from "./settings/OrganizationSettings";
import { EngagementMetrics } from "./metrics/EngagementMetrics";
import { LearningMetrics } from "./metrics/LearningMetrics";
import { CompetencyMetrics } from "./metrics/CompetencyMetrics";
import { DecisionMetrics } from "./metrics/DecisionMetrics";
import { MembersMetricsTable } from "./metrics/MembersMetricsTable";
import { TeamManagement } from "./teams";
import { ExecutiveDashboard, ActivityFeed } from "./dashboard";
import { MembersManagement } from "./members";
import { ReportsPage } from "./reports";
import { useOrgTeams } from "@/hooks/useOrgTeams";

type AdminTab = "overview" | "teams" | "members" | "invites" | "challenges" | "reports" | "settings";

export function AdminCenter() {
  const { user, isAuthenticated } = useAuth();
  const { currentOrg: organization, members, challenges, isAdmin } = useOrganization();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [invites, setInvites] = useState<any[]>([]);
  const isOrgOwner = isAdmin;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const { teams, assignMemberToTeam } = useOrgTeams(organization?.id);
  const {
    engagement,
    learning,
    competency,
    decision,
    membersWithMetrics,
    isLoading: isLoadingMetrics,
    period,
    hasFetched,
    fetchAllMetrics,
  } = useOrgMetrics(organization?.id);

  useEffect(() => {
    if (organization) {
      fetchInvites();
      setIsLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    if (organization?.id && !hasFetched) {
      fetchAllMetrics();
    }
  }, [organization?.id, hasFetched, fetchAllMetrics]);

  const fetchInvites = async () => {
    if (!organization) return;
    
    try {
      const { data, error } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organization.id)
        .is('used_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvites(data || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
    }
  };

  const createInvite = async (email?: string) => {
    if (!organization || !user) return;
    
    setIsCreatingInvite(true);
    try {
      const { data, error } = await supabase
        .from('organization_invites')
        .insert({
          organization_id: organization.id,
          created_by: user.id,
          email: email || null,
          role: 'member',
        })
        .select()
        .single();

      if (error) throw error;
      
      setInvites((prev) => [data, ...prev]);
      toast.success('Convite criado com sucesso!');
      
      return data;
    } catch (error) {
      console.error('Error creating invite:', error);
      toast.error('Erro ao criar convite');
    } finally {
      setIsCreatingInvite(false);
    }
  };

  const copyInviteLink = (inviteCode: string) => {
    const link = `${window.location.origin}/?invite=${inviteCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Acesso Restrito</h2>
          <p className="text-muted-foreground">Faça login para acessar o Admin Center</p>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Sem Organização</h2>
          <p className="text-muted-foreground">Você não está vinculado a nenhuma organização</p>
        </div>
      </div>
    );
  }

  if (!isOrgOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-destructive" />
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-muted-foreground">Apenas administradores podem acessar esta área</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as const, label: "Visão Geral", icon: BarChart3 },
    { id: "teams" as const, label: "Equipes", icon: UsersRound },
    { id: "members" as const, label: "Membros", icon: Users },
    { id: "invites" as const, label: "Convites", icon: UserPlus },
    { id: "challenges" as const, label: "Desafios", icon: Trophy },
    { id: "reports" as const, label: "Relatórios", icon: FileText },
    { id: "settings" as const, label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-secondary shadow-lg flex items-center justify-center ring-2 ring-primary/20">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">
                  {organization.name}
                </h1>
                <p className="text-sm text-muted-foreground">Admin Center</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                Voltar
              </Button>
              <div className="px-4 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-full flex items-center gap-1.5 border border-primary/20">
                <Crown className="w-4 h-4" />
                Admin
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === "overview" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <ExecutiveDashboard
              engagement={engagement}
              learning={learning}
              competency={competency}
              decision={decision}
              members={membersWithMetrics}
              isLoading={isLoadingMetrics}
            />
            <ActivityFeed orgId={organization.id} />
          </motion.div>
        )}

        {activeTab === "teams" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <TeamManagement orgId={organization.id} />
          </motion.div>
        )}

        {activeTab === "members" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MembersManagement
              members={membersWithMetrics}
              teams={teams}
              isLoading={isLoadingMetrics}
              onMoveToTeam={(userId, teamId) => assignMemberToTeam(userId, teamId)}
            />
          </motion.div>
        )}

        {activeTab === "invites" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground">
                Convites Pendentes
              </h3>
              <button
                onClick={() => createInvite()}
                disabled={isCreatingInvite}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm"
              >
                {isCreatingInvite ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Novo Convite
              </button>
            </div>

            <div className="gameia-card p-6">
              {invites.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Nenhum convite pendente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                    >
                      <div>
                        <div className="font-medium text-foreground">
                          {invite.email || "Link genérico"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expira em {new Date(invite.expires_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <button
                        onClick={() => copyInviteLink(invite.invite_code)}
                        className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copiar Link
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "challenges" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="gameia-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-foreground">
                Desafios da Organização
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm">
                <Plus className="w-4 h-4" />
                Novo Desafio
              </button>
            </div>
            
            {challenges.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">Nenhum desafio criado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {challenges.map((challenge) => (
                  <div
                    key={challenge.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                  >
                    <div>
                      <div className="font-medium text-foreground">{challenge.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {challenge.xp_reward} XP • {challenge.coins_reward} moedas
                      </div>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      challenge.is_active ? "bg-green-500/20 text-green-500" : "bg-muted text-muted-foreground"
                    )}>
                      {challenge.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "settings" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Tabs defaultValue="organization" className="w-full">
              <div className="bg-card rounded-2xl border border-border shadow-sm p-1.5 mb-6">
                <TabsList className="grid w-full grid-cols-5 bg-transparent gap-1 h-auto p-0">
                  <TabsTrigger 
                    value="organization" 
                    className="gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-muted data-[state=active]:shadow-sm transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Empresa</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="games" 
                    className="gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-muted data-[state=active]:shadow-sm transition-all"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Jogos</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="badges" 
                    className="gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-muted data-[state=active]:shadow-sm transition-all"
                  >
                    <Award className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Badges</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="levels" 
                    className="gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-muted data-[state=active]:shadow-sm transition-all"
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Níveis</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="skills" 
                    className="gap-2 py-3 px-4 rounded-xl data-[state=active]:bg-muted data-[state=active]:shadow-sm transition-all"
                  >
                    <Target className="w-4 h-4" />
                    <span className="hidden sm:inline font-medium">Skills</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                <TabsContent value="organization" className="mt-0">
                  <OrganizationSettings />
                </TabsContent>
                <TabsContent value="games" className="mt-0">
                  <GameConfigSettings />
                </TabsContent>
                <TabsContent value="badges" className="mt-0">
                  <BadgeConfigSettings />
                </TabsContent>
                <TabsContent value="levels" className="mt-0">
                  <LevelConfigSettings />
                </TabsContent>
                <TabsContent value="skills" className="mt-0">
                  <SkillConfigSettings />
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>
        )}
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: "primary" | "secondary" | "accent" | "warning";
}

function StatCard({ icon: Icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    accent: "bg-accent/10 text-accent",
    warning: "bg-gameia-warning/10 text-gameia-warning",
  };

  return (
    <div className="gameia-card p-6">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
        colorClasses[color]
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="text-2xl font-display font-bold text-foreground">{value}</div>
    </div>
  );
}

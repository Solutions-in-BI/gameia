/**
 * Admin Center B2B - Painel Administrativo para Organizações
 * Acessado via rota /admin
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Shield,
  Trophy,
  Mail,
  Copy,
  Plus,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useOrgMetrics } from "@/hooks/useOrgMetrics";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { GameConfigSettings } from "./settings/GameConfigSettings";
import { BadgeConfigSettings } from "./settings/BadgeConfigSettings";
import { LevelConfigSettings } from "./settings/LevelConfigSettings";
import { SkillManagement, SkillMappingMatrix } from "./skills";
import { OrganizationSettings } from "./settings/OrganizationSettings";
import { EngagementMetrics } from "./metrics/EngagementMetrics";
import { LearningMetrics } from "./metrics/LearningMetrics";
import { CompetencyMetrics } from "./metrics/CompetencyMetrics";
import { DecisionMetrics } from "./metrics/DecisionMetrics";
import { TeamManagement } from "./teams";
import { ExecutiveDashboard, ActivityFeed } from "./dashboard";
import { MembersManagement } from "./members";
import { ReportsPage } from "./reports";
import { QuizManagement, ScenarioManagement } from "./content";
import { useOrgTeams } from "@/hooks/useOrgTeams";
import { AdminSidebar, AdminSection } from "./layout";
import { AdminHeader } from "./layout/AdminHeader";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export function AdminCenter() {
  const { user, isAuthenticated } = useAuth();
  const { currentOrg: organization, members, challenges, isAdmin } = useOrganization();
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [invites, setInvites] = useState<any[]>([]);
  const isOrgOwner = isAdmin;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { teams, assignMemberToTeam } = useOrgTeams(organization?.id);
  const {
    engagement,
    learning,
    competency,
    decision,
    membersWithMetrics,
    isLoading: isLoadingMetrics,
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

  const handleSectionChange = (section: AdminSection) => {
    setActiveSection(section);
    setIsMobileSidebarOpen(false);
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

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <div className="space-y-6">
            <ExecutiveDashboard
              engagement={engagement}
              learning={learning}
              competency={competency}
              decision={decision}
              members={membersWithMetrics}
              isLoading={isLoadingMetrics}
            />
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Atividades Recentes
              </h3>
              <ActivityFeed orgId={organization.id} limit={15} />
            </div>
          </div>
        );

      case "teams":
        return <TeamManagement orgId={organization.id} />;

      case "members":
        return (
          <MembersManagement
            members={membersWithMetrics}
            teams={teams}
            isLoading={isLoadingMetrics}
            onMoveToTeam={(userId, teamId) => assignMemberToTeam(userId, teamId)}
          />
        );

      case "invites":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground text-xl">
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
          </div>
        );

      case "challenges":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-foreground text-xl">
                Desafios da Organização
              </h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium text-sm">
                <Plus className="w-4 h-4" />
                Novo Desafio
              </button>
            </div>
            
            <div className="gameia-card p-6">
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
            </div>
          </div>
        );

      case "games-config":
        return (
          <div className="gameia-card p-6">
            <GameConfigSettings />
          </div>
        );

      case "reports":
        return <ReportsPage />;

      case "metrics":
        return (
          <div className="space-y-6">
            <h3 className="font-display font-bold text-foreground text-xl">
              Métricas Detalhadas
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementMetrics metrics={engagement} isLoading={isLoadingMetrics} />
              <LearningMetrics metrics={learning} isLoading={isLoadingMetrics} />
              <CompetencyMetrics metrics={competency} isLoading={isLoadingMetrics} />
              <DecisionMetrics metrics={decision} isLoading={isLoadingMetrics} />
            </div>
          </div>
        );

      case "organization":
        return (
          <div className="gameia-card p-6">
            <OrganizationSettings />
          </div>
        );

      case "badges":
        return (
          <div className="gameia-card p-6">
            <BadgeConfigSettings />
          </div>
        );

      case "levels":
        return (
          <div className="gameia-card p-6">
            <LevelConfigSettings />
          </div>
        );

      case "skills":
        return (
          <div className="space-y-6">
            <SkillManagement />
            <SkillMappingMatrix />
          </div>
        );

      case "quiz-content":
        return (
          <div className="gameia-card p-6">
            <QuizManagement />
          </div>
        );

      case "scenario-content":
        return (
          <div className="gameia-card p-6">
            <ScenarioManagement />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <AdminHeader
        organizationName={organization.name}
        currentSection={activeSection}
        onNavigate={handleSectionChange}
        onToggleSidebar={() => setIsMobileSidebarOpen(true)}
      />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
          />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <AdminSidebar
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
            />
          </SheetContent>
        </Sheet>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

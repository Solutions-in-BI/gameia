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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GameConfigSettings } from "./settings/GameConfigSettings";
import { BadgeConfigSettings } from "./settings/BadgeConfigSettings";
import { LevelConfigSettings } from "./settings/LevelConfigSettings";
import { SkillConfigSettings } from "./settings/SkillConfigSettings";
import { OrganizationSettings } from "./settings/OrganizationSettings";

type AdminTab = "overview" | "members" | "invites" | "challenges" | "settings";

export function AdminCenter() {
  const { user, isAuthenticated } = useAuth();
  const { currentOrg: organization, members, challenges, isAdmin } = useOrganization();
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [invites, setInvites] = useState<any[]>([]);
  const isOrgOwner = isAdmin;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingInvite, setIsCreatingInvite] = useState(false);

  useEffect(() => {
    if (organization) {
      fetchInvites();
      setIsLoading(false);
    }
  }, [organization]);

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
    { id: "members" as const, label: "Membros", icon: Users },
    { id: "invites" as const, label: "Convites", icon: UserPlus },
    { id: "challenges" as const, label: "Desafios", icon: Trophy },
    { id: "settings" as const, label: "Configurações", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">
                  {organization.name}
                </h1>
                <p className="text-sm text-muted-foreground">Admin Center</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar
              </Button>
              <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                <Crown className="w-4 h-4 inline mr-1" />
                Admin
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto py-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
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
            {/* Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={Users}
                label="Membros Ativos"
                value={members.length}
                color="primary"
              />
              <StatCard
                icon={Trophy}
                label="Desafios Ativos"
                value={challenges.filter(c => c.is_active).length}
                color="secondary"
              />
              <StatCard
                icon={UserPlus}
                label="Convites Pendentes"
                value={invites.length}
                color="accent"
              />
              <StatCard
                icon={BarChart3}
                label="Taxa de Engajamento"
                value="87%"
                color="warning"
              />
            </div>

            {/* Quick Actions */}
            <div className="gameia-card p-6">
              <h3 className="font-display font-bold text-foreground mb-4">
                Ações Rápidas
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <button
                  onClick={() => createInvite()}
                  disabled={isCreatingInvite}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <Link className="w-8 h-8 text-primary mb-2" />
                  <div className="font-medium text-foreground">Criar Link de Convite</div>
                  <div className="text-xs text-muted-foreground">Gerar link para novos membros</div>
                </button>
                <button
                  onClick={() => setActiveTab("challenges")}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <Plus className="w-8 h-8 text-secondary mb-2" />
                  <div className="font-medium text-foreground">Novo Desafio</div>
                  <div className="text-xs text-muted-foreground">Criar desafio para equipe</div>
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left"
                >
                  <Users className="w-8 h-8 text-accent mb-2" />
                  <div className="font-medium text-foreground">Gerenciar Membros</div>
                  <div className="text-xs text-muted-foreground">Ver e editar membros</div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "members" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="gameia-card p-6"
          >
            <h3 className="font-display font-bold text-foreground mb-4">
              Membros da Organização ({members.length})
            </h3>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-primary-foreground font-semibold">
                        {member.profile?.nickname?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {member.profile?.nickname || "Sem nome"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {member.job_title || member.role}
                      </div>
                    </div>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium",
                    member.role === 'owner' ? "bg-gameia-warning/20 text-gameia-warning" :
                    member.role === 'admin' ? "bg-primary/20 text-primary" :
                    "bg-muted text-muted-foreground"
                  )}>
                    {member.role === 'owner' ? 'Dono' :
                     member.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                </div>
              ))}
            </div>
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
            className="gameia-card p-6"
          >
            <Tabs defaultValue="organization" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="organization" className="gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Empresa</span>
                </TabsTrigger>
                <TabsTrigger value="games" className="gap-1.5">
                  <Gamepad2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Jogos</span>
                </TabsTrigger>
                <TabsTrigger value="badges" className="gap-1.5">
                  <Award className="w-4 h-4" />
                  <span className="hidden sm:inline">Badges</span>
                </TabsTrigger>
                <TabsTrigger value="levels" className="gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span className="hidden sm:inline">Níveis</span>
                </TabsTrigger>
                <TabsTrigger value="skills" className="gap-1.5">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Skills</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="organization">
                <OrganizationSettings />
              </TabsContent>
              <TabsContent value="games">
                <GameConfigSettings />
              </TabsContent>
              <TabsContent value="badges">
                <BadgeConfigSettings />
              </TabsContent>
              <TabsContent value="levels">
                <LevelConfigSettings />
              </TabsContent>
              <TabsContent value="skills">
                <SkillConfigSettings />
              </TabsContent>
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

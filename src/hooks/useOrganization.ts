/**
 * Hook para gerenciar organizações/empresas
 * Usa localStorage para cache e evitar flash de "Nenhuma organização"
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  industry: string | null;
  size: string;
  owner_id: string;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  department: string | null;
  job_title: string | null;
  joined_at: string;
  is_active: boolean;
  profile?: {
    nickname: string;
    avatar_url: string | null;
  };
}

export interface OrganizationChallenge {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  xp_reward: number;
  coins_reward: number;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
  progress?: {
    status: string;
    completed_at: string | null;
    score: number | null;
  };
}

interface UseOrganization {
  currentOrg: Organization | null;
  members: OrganizationMember[];
  challenges: OrganizationChallenge[];
  myOrganizations: Organization[];
  isLoading: boolean;
  isAdmin: boolean;
  createOrganization: (name: string, slug: string, industry?: string) => Promise<Organization | null>;
  joinOrganization: (slug: string) => Promise<boolean>;
  leaveOrganization: () => Promise<boolean>;
  switchOrganization: (orgId: string) => Promise<boolean>;
  createChallenge: (title: string, description?: string, xpReward?: number, coinsReward?: number) => Promise<boolean>;
  completeChallenge: (challengeId: string, score?: number) => Promise<boolean>;
  refresh: () => Promise<void>;
}

const ORG_CACHE_KEY = "gameia_org_cache";

function getCachedOrg(): Organization | null {
  try {
    const cached = localStorage.getItem(ORG_CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

function setCachedOrg(org: Organization | null) {
  try {
    if (org) {
      localStorage.setItem(ORG_CACHE_KEY, JSON.stringify(org));
    } else {
      localStorage.removeItem(ORG_CACHE_KEY);
    }
  } catch {
    // Ignore localStorage errors
  }
}

export function useOrganization(): UseOrganization {
  const { user, profile, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  // Initialize from cache to avoid flash
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(getCachedOrg);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [challenges, setChallenges] = useState<OrganizationChallenge[]>([]);
  const [myOrganizations, setMyOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica se é admin/owner da org atual
  const isAdmin = currentOrg ? (
    currentOrg.owner_id === user?.id ||
    members.some(m => m.user_id === user?.id && (m.role === "admin" || m.role === "owner"))
  ) : false;

  // Busca organização atual do usuário
  const fetchCurrentOrg = useCallback(async () => {
    if (!user || !profile) return;

    try {
      // Pega current_organization_id do profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("current_organization_id")
        .eq("id", user.id)
        .single();

      if (profileData?.current_organization_id) {
        const { data: org } = await supabase
          .from("organizations")
          .select("*")
          .eq("id", profileData.current_organization_id)
          .single();

        if (org) {
          const next = org as Organization;
          // Evita loop de render ao não atualizar estado quando nada mudou
          setCurrentOrg((prev) => {
            if (!prev) {
              setCachedOrg(next);
              return next;
            }

            const isSame =
              prev.id === next.id &&
              prev.name === next.name &&
              prev.slug === next.slug &&
              prev.logo_url === next.logo_url &&
              prev.description === next.description &&
              prev.industry === next.industry &&
              prev.size === next.size &&
              prev.owner_id === next.owner_id &&
              prev.created_at === next.created_at;

            if (!isSame) {
              setCachedOrg(next);
            }
            return isSame ? prev : next;
          });
        } else {
          setCurrentOrg(null);
          setCachedOrg(null);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar organização:", err);
    }
  }, [user, profile]);

  // Busca organizações que o usuário participa
  const fetchMyOrganizations = useCallback(async () => {
    if (!user) return;
    
    try {
      // Orgs que sou membro
      const { data: memberships } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .eq("is_active", true);
      
      // Orgs que sou owner
      const { data: ownedOrgs } = await supabase
        .from("organizations")
        .select("*")
        .eq("owner_id", user.id);
      
      const memberOrgIds = memberships?.map(m => m.organization_id) || [];
      const allOrgIds = [...new Set([...memberOrgIds, ...(ownedOrgs?.map(o => o.id) || [])])];
      
      if (allOrgIds.length > 0) {
        const { data: orgs } = await supabase
          .from("organizations")
          .select("*")
          .in("id", allOrgIds);
        
        setMyOrganizations((orgs || []) as Organization[]);
      } else {
        setMyOrganizations([]);
      }
    } catch (err) {
      console.error("Erro ao buscar organizações:", err);
    }
  }, [user]);

  // Busca membros da organização atual
  const fetchMembers = useCallback(async () => {
    if (!currentOrg) {
      setMembers([]);
      return;
    }
    
    try {
      const { data } = await supabase
        .from("organization_members")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .eq("is_active", true);
      
      if (data && data.length > 0) {
        // Busca profiles
        const userIds = data.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, nickname, avatar_url")
          .in("id", userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
        
        const membersWithProfiles: OrganizationMember[] = data.map(m => ({
          ...m,
          role: (m.org_role || m.role || "member") as "owner" | "admin" | "member",
          profile: profileMap.get(m.user_id) as any,
        }));
        
        setMembers(membersWithProfiles);
      } else {
        setMembers([]);
      }
    } catch (err) {
      console.error("Erro ao buscar membros:", err);
    }
  }, [currentOrg]);

  // Busca desafios da organização
  const fetchChallenges = useCallback(async () => {
    if (!currentOrg || !user) {
      setChallenges([]);
      return;
    }
    
    try {
      const { data } = await supabase
        .from("organization_challenges")
        .select("*")
        .eq("organization_id", currentOrg.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      
      if (data && data.length > 0) {
        // Busca progresso do usuário
        const challengeIds = data.map(c => c.id);
        const { data: progress } = await supabase
          .from("user_challenge_progress")
          .select("*")
          .eq("user_id", user.id)
          .in("challenge_id", challengeIds);
        
        const progressMap = new Map(progress?.map(p => [p.challenge_id, p]) || []);
        
        const challengesWithProgress: OrganizationChallenge[] = data.map(c => ({
          ...c,
          xp_reward: c.xp_reward || 50,
          coins_reward: c.coins_reward || 25,
          progress: progressMap.get(c.id) as any,
        }));
        
        setChallenges(challengesWithProgress);
      } else {
        setChallenges([]);
      }
    } catch (err) {
      console.error("Erro ao buscar desafios:", err);
    }
  }, [currentOrg, user]);

  // Refresh all
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchCurrentOrg();
    await fetchMyOrganizations();
    await fetchMembers();
    await fetchChallenges();
    setIsLoading(false);
  }, [fetchCurrentOrg, fetchMyOrganizations, fetchMembers, fetchChallenges]);

  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, refresh]);

  // Atualiza membros e desafios quando muda a org
  useEffect(() => {
    if (currentOrg) {
      fetchMembers();
      fetchChallenges();
    }
  }, [currentOrg, fetchMembers, fetchChallenges]);

  // Criar organização
  const createOrganization = useCallback(async (
    name: string, 
    slug: string, 
    industry?: string
  ): Promise<Organization | null> => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from("organizations")
        .insert({
          name,
          slug: slug.toLowerCase().replace(/\s+/g, "-"),
          industry,
          owner_id: user.id,
        })
        .select()
        .single();
      
      if (error) {
        if (error.code === "23505") {
          toast({ title: "Este slug já está em uso", variant: "destructive" });
        } else {
          throw error;
        }
        return null;
      }
      
      // Atualiza profile com a nova org
      await supabase
        .from("profiles")
        .update({ current_organization_id: data.id })
        .eq("id", user.id);
      
      toast({ title: "Organização criada! 🎉" });
      await refresh();
      return data as Organization;
    } catch (err) {
      console.error("Erro ao criar organização:", err);
      toast({ title: "Erro ao criar organização", variant: "destructive" });
      return null;
    }
  }, [user, toast, refresh]);

  // Entrar em organização
  const joinOrganization = useCallback(async (slug: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // Busca org pelo slug
      const { data: org } = await supabase
        .from("organizations")
        .select("id")
        .eq("slug", slug.toLowerCase())
        .single();
      
      if (!org) {
        toast({ title: "Organização não encontrada", variant: "destructive" });
        return false;
      }
      
      // Verifica se já é membro
      const { data: existing } = await supabase
        .from("organization_members")
        .select("id")
        .eq("organization_id", org.id)
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (existing) {
        toast({ title: "Você já é membro desta organização" });
        return false;
      }
      
      // Adiciona como membro
      const { error } = await supabase
        .from("organization_members")
        .insert({
          organization_id: org.id,
          user_id: user.id,
          role: "member",
        });
      
      if (error) throw error;
      
      // Define como org atual
      await supabase
        .from("profiles")
        .update({ current_organization_id: org.id })
        .eq("id", user.id);
      
      toast({ title: "Você entrou na organização! 🎉" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao entrar na organização:", err);
      return false;
    }
  }, [user, toast, refresh]);

  // Sair da organização
  const leaveOrganization = useCallback(async (): Promise<boolean> => {
    if (!user || !currentOrg) return false;
    
    try {
      // Remove membership
      await supabase
        .from("organization_members")
        .delete()
        .eq("organization_id", currentOrg.id)
        .eq("user_id", user.id);
      
      // Limpa current_organization_id
      await supabase
        .from("profiles")
        .update({ current_organization_id: null })
        .eq("id", user.id);
      
      setCurrentOrg(null);
      toast({ title: "Você saiu da organização" });
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao sair:", err);
      return false;
    }
  }, [user, currentOrg, toast, refresh]);

  // Trocar de organização
  const switchOrganization = useCallback(async (orgId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      await supabase
        .from("profiles")
        .update({ current_organization_id: orgId })
        .eq("id", user.id);
      
      await refresh();
      return true;
    } catch (err) {
      console.error("Erro ao trocar organização:", err);
      return false;
    }
  }, [user, refresh]);

  // Criar desafio
  const createChallenge = useCallback(async (
    title: string,
    description?: string,
    xpReward = 50,
    coinsReward = 25
  ): Promise<boolean> => {
    if (!user || !currentOrg || !isAdmin) return false;
    
    try {
      const { error } = await supabase
        .from("organization_challenges")
        .insert({
          organization_id: currentOrg.id,
          title,
          description,
          xp_reward: xpReward,
          coins_reward: coinsReward,
          created_by: user.id,
        });
      
      if (error) throw error;
      
      toast({ title: "Desafio criado! 🎯" });
      await fetchChallenges();
      return true;
    } catch (err) {
      console.error("Erro ao criar desafio:", err);
      return false;
    }
  }, [user, currentOrg, isAdmin, toast, fetchChallenges]);

  // Completar desafio
  const completeChallenge = useCallback(async (
    challengeId: string,
    score?: number
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("user_challenge_progress")
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          status: "completed",
          completed_at: new Date().toISOString(),
          score,
        });
      
      if (error) throw error;
      
      // Dá recompensas
      const challenge = challenges.find(c => c.id === challengeId);
      if (challenge) {
        const { data: stats } = await supabase
          .from("user_stats")
          .select("xp, coins")
          .eq("user_id", user.id)
          .single();
        
        if (stats) {
          await supabase
            .from("user_stats")
            .update({
              xp: stats.xp + challenge.xp_reward,
              coins: stats.coins + challenge.coins_reward,
            })
            .eq("user_id", user.id);
        }
        
        toast({ 
          title: "Desafio completo! 🎉",
          description: `+${challenge.xp_reward} XP e +${challenge.coins_reward} moedas`
        });
      }
      
      await fetchChallenges();
      return true;
    } catch (err) {
      console.error("Erro ao completar desafio:", err);
      return false;
    }
  }, [user, challenges, toast, fetchChallenges]);

  return {
    currentOrg,
    members,
    challenges,
    myOrganizations,
    isLoading,
    isAdmin,
    createOrganization,
    joinOrganization,
    leaveOrganization,
    switchOrganization,
    createChallenge,
    completeChallenge,
    refresh,
  };
}

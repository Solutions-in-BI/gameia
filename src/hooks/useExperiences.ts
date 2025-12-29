import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useOrganization } from "./useOrganization";
import { useToast } from "./use-toast";

export interface ExperienceRequest {
  id: string;
  user_id: string;
  inventory_id: string;
  organization_id: string;
  requested_at: string;
  preferred_date: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  completed_at: string | null;
  completion_notes: string | null;
  // Joined data
  user?: {
    nickname: string;
    avatar_url: string | null;
  };
  item?: {
    name: string;
    icon: string;
    usage_instructions: string | null;
  };
}

export interface ExperienceInventoryItem {
  id: string;
  item_id: string;
  status: string;
  approval_status: string | null;
  item: {
    name: string;
    icon: string;
    description: string | null;
    usage_instructions: string | null;
    requires_approval: boolean;
  };
  pending_request?: ExperienceRequest;
}

export function useExperiences() {
  const [myRequests, setMyRequests] = useState<ExperienceRequest[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<ExperienceRequest[]>([]);
  const [availableExperiences, setAvailableExperiences] = useState<ExperienceInventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user, isAuthenticated } = useAuth();
  const { currentOrg } = useOrganization();
  const { toast } = useToast();

  // Fetch user's own experience requests
  const fetchMyRequests = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("experience_requests")
      .select(`
        *,
        item:user_inventory(
          item:marketplace_items(name, icon, usage_instructions)
        )
      `)
      .eq("user_id", user.id)
      .order("requested_at", { ascending: false });
    
    if (data) {
      const requests: ExperienceRequest[] = data.map((req: any) => ({
        ...req,
        item: req.item?.item
      }));
      setMyRequests(requests);
    }
  }, [user]);

  // Fetch pending approvals (for managers)
  const fetchPendingApprovals = useCallback(async () => {
    if (!user || !currentOrg) return;
    
    const { data } = await supabase
      .from("experience_requests")
      .select(`
        *,
        user:profiles!experience_requests_user_id_fkey(nickname, avatar_url),
        item:user_inventory(
          item:marketplace_items(name, icon, usage_instructions)
        )
      `)
      .eq("organization_id", currentOrg.id)
      .eq("status", "pending")
      .order("requested_at", { ascending: true });
    
    if (data) {
      const requests: ExperienceRequest[] = data.map((req: any) => ({
        ...req,
        user: req.user,
        item: req.item?.item
      }));
      setPendingApprovals(requests);
    }
  }, [user, currentOrg]);

  // Fetch available experience items in inventory
  const fetchAvailableExperiences = useCallback(async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_inventory")
      .select(`
        id,
        item_id,
        status,
        approval_status,
        item:marketplace_items!inner(
          name,
          icon,
          description,
          usage_instructions,
          requires_approval,
          item_type
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "active")
      .eq("item.item_type", "experience");
    
    if (data) {
      // Filter items that don't have pending requests
      const { data: pendingRequests } = await supabase
        .from("experience_requests")
        .select("inventory_id")
        .eq("user_id", user.id)
        .in("status", ["pending", "approved"]);
      
      const pendingInventoryIds = new Set(pendingRequests?.map(r => r.inventory_id) || []);
      
      const available = data.filter((inv: any) => !pendingInventoryIds.has(inv.id));
      setAvailableExperiences(available as ExperienceInventoryItem[]);
    }
  }, [user]);

  // Request an experience
  const requestExperience = async (inventoryId: string, preferredDate?: Date, notes?: string) => {
    if (!user || !currentOrg) {
      toast({ title: "Erro", description: "Faça login para solicitar", variant: "destructive" });
      return { success: false };
    }

    const { data, error } = await supabase
      .from("experience_requests")
      .insert({
        user_id: user.id,
        inventory_id: inventoryId,
        organization_id: currentOrg.id,
        preferred_date: preferredDate?.toISOString().split("T")[0],
        notes: notes || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Erro ao solicitar", description: error.message, variant: "destructive" });
      return { success: false };
    }

    // Update inventory status
    await supabase
      .from("user_inventory")
      .update({ approval_status: "pending" })
      .eq("id", inventoryId);

    // Log usage
    await supabase.from("item_usage_log").insert({
      user_id: user.id,
      inventory_id: inventoryId,
      action: "experience_requested",
      details: { preferred_date: preferredDate?.toISOString(), notes },
    });

    await Promise.all([fetchMyRequests(), fetchAvailableExperiences()]);
    
    toast({ 
      title: "Solicitação enviada! 📨", 
      description: "Aguarde a aprovação do gestor" 
    });
    
    return { success: true, request: data };
  };

  // Cancel a pending request
  const cancelRequest = async (requestId: string) => {
    if (!user) return { success: false };

    const { data: request } = await supabase
      .from("experience_requests")
      .select("inventory_id")
      .eq("id", requestId)
      .single();

    const { error } = await supabase
      .from("experience_requests")
      .update({ status: "cancelled" })
      .eq("id", requestId);

    if (error) {
      toast({ title: "Erro ao cancelar", description: error.message, variant: "destructive" });
      return { success: false };
    }

    // Reset inventory status
    if (request) {
      await supabase
        .from("user_inventory")
        .update({ approval_status: null })
        .eq("id", request.inventory_id);
    }

    await Promise.all([fetchMyRequests(), fetchAvailableExperiences()]);
    
    toast({ title: "Solicitação cancelada" });
    return { success: true };
  };

  // Approve a request (manager action)
  const approveRequest = async (requestId: string, notes?: string) => {
    if (!user) return { success: false };

    const { data: request, error } = await supabase
      .from("experience_requests")
      .update({ 
        status: "approved",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
      })
      .eq("id", requestId)
      .select("inventory_id, user_id")
      .single();

    if (error) {
      toast({ title: "Erro ao aprovar", description: error.message, variant: "destructive" });
      return { success: false };
    }

    // Update inventory status
    if (request) {
      await supabase
        .from("user_inventory")
        .update({ approval_status: "approved", approved_by: user.id, approved_at: new Date().toISOString() })
        .eq("id", request.inventory_id);

      // Log
      await supabase.from("item_usage_log").insert({
        user_id: request.user_id,
        inventory_id: request.inventory_id,
        action: "experience_approved",
        details: { approved_by: user.id, notes },
      });
    }

    await fetchPendingApprovals();
    
    toast({ title: "Solicitação aprovada! ✅" });
    return { success: true };
  };

  // Reject a request (manager action)
  const rejectRequest = async (requestId: string, reason: string) => {
    if (!user) return { success: false };

    const { data: request, error } = await supabase
      .from("experience_requests")
      .update({ 
        status: "rejected",
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: reason,
      })
      .eq("id", requestId)
      .select("inventory_id, user_id")
      .single();

    if (error) {
      toast({ title: "Erro ao rejeitar", description: error.message, variant: "destructive" });
      return { success: false };
    }

    // Reset inventory for reuse
    if (request) {
      await supabase
        .from("user_inventory")
        .update({ approval_status: "rejected", rejection_reason: reason })
        .eq("id", request.inventory_id);

      // Log
      await supabase.from("item_usage_log").insert({
        user_id: request.user_id,
        inventory_id: request.inventory_id,
        action: "experience_rejected",
        details: { rejected_by: user.id, reason },
      });
    }

    await fetchPendingApprovals();
    
    toast({ title: "Solicitação recusada" });
    return { success: true };
  };

  // Mark experience as completed (manager action)
  const completeRequest = async (requestId: string, notes?: string) => {
    if (!user) return { success: false };

    const { data: request, error } = await supabase
      .from("experience_requests")
      .update({ 
        status: "completed",
        completed_at: new Date().toISOString(),
        completion_notes: notes || null,
      })
      .eq("id", requestId)
      .select("inventory_id, user_id")
      .single();

    if (error) {
      toast({ title: "Erro ao concluir", description: error.message, variant: "destructive" });
      return { success: false };
    }

    // Mark inventory as used
    if (request) {
      await supabase
        .from("user_inventory")
        .update({ status: "used", used_at: new Date().toISOString() })
        .eq("id", request.inventory_id);

      // Log
      await supabase.from("item_usage_log").insert({
        user_id: request.user_id,
        inventory_id: request.inventory_id,
        action: "experience_completed",
        details: { completed_by: user.id, notes },
      });
    }

    await fetchPendingApprovals();
    
    toast({ title: "Experiência concluída! 🎉" });
    return { success: true };
  };

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      await Promise.all([
        fetchMyRequests(), 
        fetchPendingApprovals(), 
        fetchAvailableExperiences()
      ]);
      setIsLoading(false);
    };
    
    loadData();
  }, [fetchMyRequests, fetchPendingApprovals, fetchAvailableExperiences, isAuthenticated]);

  return {
    myRequests,
    pendingApprovals,
    availableExperiences,
    isLoading,
    requestExperience,
    cancelRequest,
    approveRequest,
    rejectRequest,
    completeRequest,
    refresh: () => Promise.all([fetchMyRequests(), fetchPendingApprovals(), fetchAvailableExperiences()]),
  };
}

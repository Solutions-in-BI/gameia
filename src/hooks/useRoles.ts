/**
 * Hook para gerenciar roles de usuário (sistema de permissões robusto)
 * Usa a tabela user_roles separada por segurança
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type AppRole = "super_admin" | "admin" | "manager" | "user";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  organization_id: string | null;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
}

interface UseRoles {
  roles: UserRole[];
  highestRole: AppRole | null;
  isLoading: boolean;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isManager: boolean;
  hasRole: (role: AppRole, orgId?: string) => boolean;
  hasAnyAdminRole: (orgId?: string) => boolean;
  grantRole: (userId: string, role: AppRole, orgId?: string) => Promise<boolean>;
  revokeRole: (roleId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useRoles(): UseRoles {
  const { user, isAuthenticated } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user roles
  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (error) {
        console.error("Error fetching roles:", error);
        setRoles([]);
      } else {
        // Filter out expired roles
        const activeRoles = (data || []).filter(
          (r) => !r.expires_at || new Date(r.expires_at) > new Date()
        );
        setRoles(activeRoles as UserRole[]);
      }
    } catch (err) {
      console.error("Error:", err);
      setRoles([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchRoles();
    } else {
      setRoles([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, fetchRoles]);

  // Get highest role (super_admin > admin > manager > user)
  const highestRole: AppRole | null = roles.length > 0
    ? roles.reduce((highest, current) => {
        const order: AppRole[] = ["super_admin", "admin", "manager", "user"];
        const currentIndex = order.indexOf(current.role);
        const highestIndex = order.indexOf(highest);
        return currentIndex < highestIndex ? current.role : highest;
      }, roles[0].role as AppRole)
    : null;

  // Check if user has specific role
  const hasRole = useCallback((role: AppRole, orgId?: string): boolean => {
    return roles.some(
      (r) =>
        r.role === role &&
        (orgId === undefined || r.organization_id === orgId || r.organization_id === null)
    );
  }, [roles]);

  // Check if user has any admin-level role
  const hasAnyAdminRole = useCallback((orgId?: string): boolean => {
    return roles.some(
      (r) =>
        (r.role === "super_admin" || r.role === "admin") &&
        (orgId === undefined || r.organization_id === orgId || r.organization_id === null)
    );
  }, [roles]);

  // Grant role to user (requires admin permission)
  const grantRole = useCallback(async (
    userId: string,
    role: AppRole,
    orgId?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role,
          organization_id: orgId || null,
          granted_by: user.id,
        });

      if (error) {
        console.error("Error granting role:", error);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  }, [user]);

  // Revoke role
  const revokeRole = useCallback(async (roleId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ is_active: false })
        .eq("id", roleId);

      if (error) {
        console.error("Error revoking role:", error);
        return false;
      }

      await fetchRoles();
      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  }, [fetchRoles]);

  return {
    roles,
    highestRole,
    isLoading,
    isSuperAdmin: hasRole("super_admin"),
    isAdmin: hasAnyAdminRole(),
    isManager: hasRole("manager") || hasAnyAdminRole(),
    hasRole,
    hasAnyAdminRole,
    grantRole,
    revokeRole,
    refresh: fetchRoles,
  };
}

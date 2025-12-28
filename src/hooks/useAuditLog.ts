/**
 * Hook para gerenciar audit logs
 * Registra ações sensíveis para compliance B2B
 */

import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "login"
  | "logout"
  | "role_granted"
  | "role_revoked"
  | "member_invited"
  | "member_removed"
  | "settings_changed"
  | "export_data"
  | "view_sensitive";

export interface AuditLogEntry {
  id: string;
  created_at: string;
  user_id: string;
  organization_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
}

interface UseAuditLog {
  logEvent: (
    action: AuditAction,
    resourceType: string,
    resourceId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    orgId?: string,
    metadata?: Record<string, unknown>
  ) => Promise<string | null>;
  fetchLogs: (
    orgId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) => Promise<AuditLogEntry[]>;
}

export function useAuditLog(): UseAuditLog {
  // Log an audit event
  const logEvent = useCallback(async (
    action: AuditAction,
    resourceType: string,
    resourceId?: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>,
    orgId?: string,
    metadata?: Record<string, unknown>
  ): Promise<string | null> => {
    try {
      const { data, error } = await supabase.rpc("log_audit_event", {
        _action: action,
        _resource_type: resourceType,
        _resource_id: resourceId || null,
        _old_values: oldValues ? JSON.stringify(oldValues) : null,
        _new_values: newValues ? JSON.stringify(newValues) : null,
        _org_id: orgId || null,
        _metadata: metadata ? JSON.stringify(metadata) : null,
      });

      if (error) {
        console.error("Error logging audit event:", error);
        return null;
      }

      return data as string;
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  }, []);

  // Fetch audit logs (admin only)
  const fetchLogs = useCallback(async (
    orgId: string,
    options?: {
      limit?: number;
      offset?: number;
      action?: string;
      resourceType?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<AuditLogEntry[]> => {
    try {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .eq("organization_id", orgId)
        .order("created_at", { ascending: false });

      if (options?.action) {
        query = query.eq("action", options.action);
      }

      if (options?.resourceType) {
        query = query.eq("resource_type", options.resourceType);
      }

      if (options?.startDate) {
        query = query.gte("created_at", options.startDate.toISOString());
      }

      if (options?.endDate) {
        query = query.lte("created_at", options.endDate.toISOString());
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching audit logs:", error);
        return [];
      }

      return (data || []) as AuditLogEntry[];
    } catch (err) {
      console.error("Error:", err);
      return [];
    }
  }, []);

  return {
    logEvent,
    fetchLogs,
  };
}

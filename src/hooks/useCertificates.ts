/**
 * Hook para gerenciar certificados do usuário
 */

import { useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Certificate {
  id: string;
  user_id: string;
  training_id: string;
  organization_id: string;
  certificate_number: string;
  issued_at: string;
  expires_at: string | null;
  status: 'active' | 'expired' | 'revoked';
  skills_validated: string[] | null;
  final_score: number | null;
  verification_code: string | null;
  metadata: {
    certificate_name?: string;
    certificate_type?: string;
    training_name?: string;
  } | null;
  pdf_url: string | null;
  insignia_id: string | null;
}

export interface CertificateWithDetails extends Certificate {
  training: {
    id: string;
    name: string;
    icon: string;
    color: string;
    category: string;
    difficulty: string;
  } | null;
  skills: {
    id: string;
    name: string;
    icon: string;
  }[];
  organization_name: string | null;
}

interface CertificateStats {
  total: number;
  active: number;
  expired: number;
  byCategory: Record<string, number>;
}

interface UseCertificates {
  certificates: CertificateWithDetails[];
  stats: CertificateStats;
  isLoading: boolean;
  getCertificateByVerificationCode: (code: string) => Promise<CertificateWithDetails | null>;
  issueCertificate: (trainingId: string) => Promise<{ success: boolean; verification_code?: string; error?: string }>;
  downloadCertificate: (certificateId: string) => Promise<string | null>;
  refetch: () => Promise<void>;
}

export function useCertificates(userId?: string): UseCertificates {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const targetUserId = userId || user?.id;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['certificates', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return { certificates: [], stats: { total: 0, active: 0, expired: 0, byCategory: {} } };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { data: certificatesRaw, error } = await db
        .from("training_certificates")
        .select(`*, training:trainings(id, name, icon, color, category, difficulty)`)
        .eq("user_id", targetUserId)
        .order("issued_at", { ascending: false });

      if (error) throw error;

      // Enrich with skills
      const certificates: CertificateWithDetails[] = await Promise.all(
        (certificatesRaw || []).map(async (cert: any) => {
          let skills: { id: string; name: string; icon: string }[] = [];

          if (cert.skills_validated && cert.skills_validated.length > 0) {
            const { data: skillsData } = await supabase
              .from("skill_configurations")
              .select("id, name, icon")
              .in("id", cert.skills_validated);
            
            skills = (skillsData || []) as { id: string; name: string; icon: string }[];
          }

          return {
            id: cert.id,
            user_id: cert.user_id,
            training_id: cert.training_id,
            organization_id: cert.organization_id,
            certificate_number: cert.certificate_number,
            issued_at: cert.issued_at,
            expires_at: cert.expires_at,
            status: cert.status || 'active',
            skills_validated: cert.skills_validated,
            final_score: cert.final_score,
            verification_code: cert.verification_code,
            metadata: cert.metadata,
            pdf_url: cert.pdf_url,
            insignia_id: cert.insignia_id,
            training: cert.training as CertificateWithDetails['training'],
            organization_name: null,
            skills,
          } as CertificateWithDetails;
        })
      );

      // Calculate stats
      const stats: CertificateStats = {
        total: certificates.length,
        active: certificates.filter(c => c.status === 'active').length,
        expired: certificates.filter(c => c.status === 'expired').length,
        byCategory: {},
      };

      certificates.forEach(cert => {
        const category = cert.training?.category || 'Outros';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });

      return { certificates, stats };
    },
    enabled: !!targetUserId,
    staleTime: 60000,
    gcTime: 300000,
  });

  const certificates = data?.certificates || [];
  const stats = data?.stats || { total: 0, active: 0, expired: 0, byCategory: {} };

  const getCertificateByVerificationCode = useCallback(async (code: string): Promise<CertificateWithDetails | null> => {
    try {
      const { data, error } = await supabase.rpc('validate_certificate', {
        p_verification_code: code
      });

      const result = data as { valid?: boolean } | null;
      if (error || !result?.valid) {
        return null;
      }

      // Transform RPC result to CertificateWithDetails format
      const rpcResult = result as {
        valid: boolean;
        certificate: {
          id: string;
          verification_code: string;
          certificate_name: string;
          issued_at: string;
          expires_at: string | null;
          final_score: number;
        };
        holder: { name: string; avatar_url: string };
        training: { name: string; description: string };
        organization: string;
        skills_validated: { id: string; name: string; icon: string }[];
      };

      return {
        id: rpcResult.certificate.id,
        user_id: '',
        training_id: '',
        organization_id: '',
        certificate_number: rpcResult.certificate.verification_code,
        issued_at: rpcResult.certificate.issued_at,
        expires_at: rpcResult.certificate.expires_at,
        status: 'active',
        skills_validated: rpcResult.skills_validated?.map(s => s.id) || [],
        final_score: rpcResult.certificate.final_score,
        verification_code: rpcResult.certificate.verification_code,
        metadata: {
          certificate_name: rpcResult.certificate.certificate_name,
          training_name: rpcResult.training.name,
        },
        pdf_url: null,
        insignia_id: null,
        training: {
          id: '',
          name: rpcResult.training.name,
          icon: '📜',
          color: '#3b82f6',
          category: 'Geral',
          difficulty: 'intermediate',
        },
        skills: rpcResult.skills_validated || [],
        organization_name: rpcResult.organization,
      };
    } catch (err) {
      console.error('Erro ao validar certificado:', err);
      return null;
    }
  }, []);

  const issueCertificateMutation = useMutation({
    mutationFn: async (trainingId: string) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase.rpc('issue_certificate', {
        p_user_id: user.id,
        p_training_id: trainingId
      });

      if (error) throw error;

      const result = data as { success: boolean; verification_code?: string; error?: string; details?: unknown };
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao emitir certificado');
      }

      return result;
    },
    onSuccess: (data) => {
      toast.success("🏆 Certificado Emitido!", {
        description: `Código: ${data.verification_code}`,
      });
      queryClient.invalidateQueries({ queryKey: ['certificates', user?.id] });
    },
    onError: (error: Error) => {
      toast.error("Erro ao emitir certificado", {
        description: error.message,
      });
    },
  });

  const issueCertificate = useCallback(async (trainingId: string) => {
    try {
      const result = await issueCertificateMutation.mutateAsync(trainingId);
      return { success: true, verification_code: result.verification_code };
    } catch (err) {
      return { success: false, error: (err as Error).message };
    }
  }, [issueCertificateMutation]);

  const downloadCertificate = useCallback(async (certificateId: string): Promise<string | null> => {
    try {
      const cert = certificates.find(c => c.id === certificateId);
      if (!cert) return null;

      // If PDF already exists, return URL
      if (cert.pdf_url) {
        return cert.pdf_url;
      }

      // TODO: Call edge function to generate PDF
      toast.info("Gerando PDF do certificado...");
      
      return null;
    } catch (err) {
      console.error('Erro ao baixar certificado:', err);
      toast.error("Erro ao gerar PDF");
      return null;
    }
  }, [certificates]);

  return {
    certificates,
    stats,
    isLoading,
    getCertificateByVerificationCode,
    issueCertificate,
    downloadCertificate,
    refetch: async () => { await refetch(); },
  };
}

/**
 * Hook para buscar certificados de uma organização (visão gerencial)
 */
export function useOrgCertificates(orgId?: string) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['org-certificates', orgId],
    queryFn: async () => {
      if (!orgId) return { certificates: [], stats: null };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = supabase as any;
      const { data: certificatesRaw, error } = await db
        .from("training_certificates")
        .select(`*, training:trainings(id, name, icon, color, category), profile:profiles(id, nickname, avatar_url)`)
        .eq("organization_id", orgId)
        .order("issued_at", { ascending: false });

      if (error) throw error;

      // Calculate org stats
      const total = certificatesRaw?.length || 0;
      const active = certificatesRaw?.filter(c => c.status === 'active').length || 0;
      const thisMonth = certificatesRaw?.filter(c => {
        const issued = new Date(c.issued_at);
        const now = new Date();
        return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear();
      }).length || 0;

      return {
        certificates: certificatesRaw || [],
        stats: { total, active, thisMonth },
      };
    },
    enabled: !!orgId,
    staleTime: 60000,
  });

  return {
    certificates: data?.certificates || [],
    stats: data?.stats,
    isLoading,
    refetch,
  };
}

/**
 * useSalesSkills - Hook para buscar skills relacionadas a vendas
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

export interface SkillOption {
  id: string;
  name: string;
  skill_key: string;
  category: string | null;
  icon: string | null;
  color: string | null;
}

export function useSalesSkills() {
  const { currentOrg } = useOrganization();
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetched = useRef(false);
  const lastOrgId = useRef<string | null>(null);

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      // Buscar skills de vendas ou da organização
      const orgId = currentOrg?.id || '00000000-0000-0000-0000-000000000000';
      const { data, error } = await supabase
        .from("skill_configurations")
        .select("id, name, skill_key, category, icon, color")
        .or(`category.eq.vendas,organization_id.eq.${orgId}`)
        .order("name");

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrg?.id]);

  useEffect(() => {
    const orgId = currentOrg?.id || null;
    // Só busca novamente se a org mudou ou se nunca buscou
    if (!hasFetched.current || lastOrgId.current !== orgId) {
      hasFetched.current = true;
      lastOrgId.current = orgId;
      fetchSkills();
    }
  }, [currentOrg?.id, fetchSkills]);

  return { skills, isLoading, refetch: fetchSkills };
}

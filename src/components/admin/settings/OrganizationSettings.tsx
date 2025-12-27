/**
 * OrganizationSettings - Configurações gerais da organização
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Building2, 
  Save, 
  Loader2,
  Upload,
  Globe,
  Users,
  Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDUSTRIES = [
  "Tecnologia",
  "Financeiro",
  "Saúde",
  "Educação",
  "Varejo",
  "Indústria",
  "Serviços",
  "Governo",
  "Outro",
];

const COMPANY_SIZES = [
  { value: "1-10", label: "1-10 funcionários" },
  { value: "11-50", label: "11-50 funcionários" },
  { value: "51-200", label: "51-200 funcionários" },
  { value: "201-500", label: "201-500 funcionários" },
  { value: "501-1000", label: "501-1000 funcionários" },
  { value: "1000+", label: "1000+ funcionários" },
];

export function OrganizationSettings() {
  const { currentOrg, refresh } = useOrganization();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    industry: "",
    size: "",
    logo_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentOrg) {
      setFormData({
        name: currentOrg.name || "",
        slug: currentOrg.slug || "",
        description: currentOrg.description || "",
        industry: currentOrg.industry || "",
        size: currentOrg.size || "",
        logo_url: currentOrg.logo_url || "",
      });
    }
  }, [currentOrg]);

  const handleSave = async () => {
    if (!currentOrg) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: formData.name,
          description: formData.description,
          industry: formData.industry,
          size: formData.size,
          logo_url: formData.logo_url,
        })
        .eq("id", currentOrg.id);

      if (error) throw error;
      
      toast.success("Configurações salvas!");
      refresh();
    } catch (error) {
      console.error("Error saving org settings:", error);
      toast.error("Erro ao salvar");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentOrg) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhuma organização selecionada
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-bold text-foreground">Configurações da Organização</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie as informações e preferências da sua empresa
        </p>
      </div>

      <div className="grid gap-6">
        {/* Logo preview */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center overflow-hidden">
            {formData.logo_url ? (
              <img 
                src={formData.logo_url} 
                alt={formData.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-10 h-10 text-primary-foreground" />
            )}
          </div>
          <div className="space-y-2">
            <Label>Logo da Empresa</Label>
            <Input
              placeholder="URL da imagem"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            />
          </div>
        </div>

        {/* Basic info */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Nome da Empresa
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Slug (URL)
            </Label>
            <Input
              value={formData.slug}
              disabled
              className="bg-muted"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            rows={3}
            placeholder="Descreva sua empresa..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Setor
            </Label>
            <Select 
              value={formData.industry}
              onValueChange={(value) => setFormData({ ...formData, industry: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {INDUSTRIES.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Tamanho da Empresa
            </Label>
            <Select 
              value={formData.size}
              onValueChange={(value) => setFormData({ ...formData, size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tamanho" />
              </SelectTrigger>
              <SelectContent>
                {COMPANY_SIZES.map(size => (
                  <SelectItem key={size.value} value={size.value}>{size.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}

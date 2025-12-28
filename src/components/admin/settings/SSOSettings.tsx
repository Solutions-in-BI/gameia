import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Globe,
  Plus,
  X,
  Building2,
  Users,
  Mail,
  Info,
  Crown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSSOConfig } from "@/hooks/useSSOConfig";
import { usePlanLimits } from "@/hooks/usePlanLimits";
import { UpgradePrompt } from "@/components/common/UpgradePrompt";

export function SSOSettings() {
  const { config, isLoading, addDomain, removeDomain, toggleSSO, toggleAutoJoin } = useSSOConfig();
  const { hasMinimumPlan, currentPlan } = usePlanLimits();
  const [newDomain, setNewDomain] = useState("");
  const planName = currentPlan?.slug || "free";

  const canAccessSSO = hasMinimumPlan("enterprise");

  if (!canAccessSSO) {
    return (
      <UpgradePrompt
        feature="SSO por Domínio Corporativo"
        requiredPlan="Enterprise"
        currentPlan={planName}
        variant="card"
      />
    );
  }

  const handleAddDomain = () => {
    if (!newDomain.trim()) return;

    // Validar formato do domínio
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(newDomain.trim())) {
      return;
    }

    addDomain(newDomain.trim());
    setNewDomain("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">SSO por Domínio Corporativo</h2>
          <p className="text-muted-foreground">
            Restrinja o acesso apenas a emails do domínio da sua empresa
          </p>
        </div>
        <Badge variant="secondary" className="ml-auto">
          <Crown className="h-3 w-3 mr-1" />
          Enterprise
        </Badge>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Configuração SSO
          </CardTitle>
          <CardDescription>
            Quando habilitado, apenas usuários com email de domínios autorizados poderão acessar
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable SSO Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <Shield className={`h-5 w-5 ${config?.is_enabled ? "text-green-500" : "text-muted-foreground"}`} />
              <div>
                <Label className="text-base font-medium">Habilitar SSO por Domínio</Label>
                <p className="text-sm text-muted-foreground">
                  Restringir acesso a domínios corporativos autorizados
                </p>
              </div>
            </div>
            <Switch
              checked={config?.is_enabled ?? false}
              onCheckedChange={toggleSSO}
            />
          </div>

          {/* Auto-join Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-3">
              <Users className={`h-5 w-5 ${config?.auto_join_enabled ? "text-blue-500" : "text-muted-foreground"}`} />
              <div>
                <Label className="text-base font-medium">Auto-adicionar à Organização</Label>
                <p className="text-sm text-muted-foreground">
                  Usuários com email válido entram automaticamente na organização
                </p>
              </div>
            </div>
            <Switch
              checked={config?.auto_join_enabled ?? false}
              onCheckedChange={toggleAutoJoin}
              disabled={!config?.is_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Domains Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Domínios Autorizados
          </CardTitle>
          <CardDescription>
            Lista de domínios de email permitidos para acesso à organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Domain */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="exemplo.com.br"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddDomain()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleAddDomain} disabled={!newDomain.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>

          {/* Domain List */}
          <div className="space-y-2">
            {(config?.allowed_domains || []).length === 0 ? (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Nenhum domínio configurado. Adicione domínios corporativos para restringir o acesso.
                </AlertDescription>
              </Alert>
            ) : (
              config?.allowed_domains.map((domain) => (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="font-mono">@{domain}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDomain(domain)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Como funciona:</strong> Quando o SSO está habilitado, apenas usuários com email de domínios
          autorizados poderão aceitar convites ou se juntar à organização. Usuários existentes não serão afetados.
        </AlertDescription>
      </Alert>
    </div>
  );
}

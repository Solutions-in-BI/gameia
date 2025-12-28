/**
 * Onboarding Wizard - Fluxo guiado para novos usuários
 * Configura perfil e organização de forma amigável
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import {
  User,
  Building2,
  Upload,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Users,
  Target,
  Gamepad2,
  Check,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/common/Logo";

type OnboardingStep = "welcome" | "profile" | "organization" | "complete";

const profileSchema = z.object({
  nickname: z.string().min(2, "Mínimo 2 caracteres").max(20, "Máximo 20 caracteres"),
  jobTitle: z.string().max(50).optional(),
  department: z.string().max(50).optional(),
});

const orgSchema = z.object({
  name: z.string().min(2, "Nome da empresa é obrigatório").max(100),
  slug: z.string().min(2, "Identificador é obrigatório").max(50)
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
  industry: z.string().optional(),
  size: z.string().optional(),
  description: z.string().max(500).optional(),
});

interface OnboardingWizardProps {
  onComplete: () => void;
  skipOrganization?: boolean;
}

export function OnboardingWizard({ onComplete, skipOrganization = false }: OnboardingWizardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile, updateProfile } = useAuth();
  const { createOrganization, myOrganizations } = useOrganization();

  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Profile form
  const [nickname, setNickname] = useState(profile?.nickname || "");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");

  // Organization form
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgSize, setOrgSize] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [hasOrg, setHasOrg] = useState<boolean | null>(null);

  // Update nickname from profile
  useEffect(() => {
    if (profile?.nickname) {
      setNickname(profile.nickname);
    }
  }, [profile]);

  // Auto-generate slug from name
  useEffect(() => {
    if (orgName && !orgSlug) {
      setOrgSlug(
        orgName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 50)
      );
    }
  }, [orgName, orgSlug]);

  const handleProfileSubmit = async () => {
    setErrors({});
    const result = profileSchema.safeParse({ nickname, jobTitle, department });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({ nickname });
      
      if (skipOrganization || myOrganizations.length > 0) {
        setStep("complete");
      } else {
        setStep("organization");
      }
    } catch (err) {
      toast({ title: "Erro ao salvar perfil", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrgSubmit = async () => {
    if (hasOrg === false) {
      // User doesn't want to create org now
      setStep("complete");
      return;
    }

    setErrors({});
    const result = orgSchema.safeParse({
      name: orgName,
      slug: orgSlug,
      industry: orgIndustry,
      size: orgSize,
      description: orgDescription,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const org = await createOrganization(orgName, orgSlug, orgIndustry);
      if (org) {
        toast({ title: "Organização criada!" });
        setStep("complete");
      }
    } catch (err) {
      toast({ title: "Erro ao criar organização", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    navigate("/");
  };

  const steps: { id: OnboardingStep; label: string; icon: typeof User }[] = [
    { id: "welcome", label: "Bem-vindo", icon: Sparkles },
    { id: "profile", label: "Perfil", icon: User },
    { id: "organization", label: "Empresa", icon: Building2 },
    { id: "complete", label: "Pronto", icon: Check },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress */}
      <div className="border-b border-border bg-card/50">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-colors",
                    i <= currentStepIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <s.icon className="w-5 h-5" />
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-12 sm:w-24 h-1 mx-2",
                      i < currentStepIndex ? "bg-primary" : "bg-muted"
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {/* Welcome Step */}
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg w-full text-center space-y-8"
            >
              <div className="flex justify-center">
                <Logo variant="icon" size="xl" />
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">
                  Bem-vindo à Gameia! 🎮
                </h1>
                <p className="text-lg text-muted-foreground">
                  A plataforma de gamificação que transforma o aprendizado 
                  corporativo em uma experiência envolvente.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4">
                {[
                  { icon: Gamepad2, label: "Jogos Educativos" },
                  { icon: Target, label: "Desenvolvimento" },
                  { icon: Users, label: "Competição Saudável" },
                ].map((item) => (
                  <div key={item.label} className="p-4 rounded-xl bg-card border border-border">
                    <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>

              <Button size="lg" onClick={() => setStep("profile")} className="w-full">
                Começar Configuração
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Profile Step */}
          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Seu Perfil</h2>
                <p className="text-muted-foreground">
                  Como você quer ser chamado na plataforma?
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nickname">Apelido *</Label>
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Seu nome no ranking"
                    maxLength={20}
                  />
                  {errors.nickname && (
                    <p className="text-sm text-destructive">{errors.nickname}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Cargo (opcional)</Label>
                  <Input
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="Ex: Analista de Vendas"
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Departamento (opcional)</Label>
                  <Input
                    id="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Ex: Comercial"
                    maxLength={50}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep("welcome")}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleProfileSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Salvando..." : "Continuar"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Organization Step */}
          {step === "organization" && (
            <motion.div
              key="organization"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Sua Empresa</h2>
                <p className="text-muted-foreground">
                  Crie uma organização ou entre com um convite
                </p>
              </div>

              {hasOrg === null && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setHasOrg(true)}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary transition-colors text-center"
                  >
                    <Building2 className="w-10 h-10 mx-auto mb-3 text-primary" />
                    <p className="font-medium">Criar Organização</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sou responsável pela empresa
                    </p>
                  </button>
                  <button
                    onClick={() => setHasOrg(false)}
                    className="p-6 rounded-xl border-2 border-border hover:border-primary transition-colors text-center"
                  >
                    <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">Tenho Convite</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Já recebi um link de convite
                    </p>
                  </button>
                </div>
              )}

              {hasOrg === true && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Nome da Empresa *</Label>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Minha Empresa LTDA"
                      maxLength={100}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgSlug">Identificador único *</Label>
                    <Input
                      id="orgSlug"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value.toLowerCase())}
                      placeholder="minha-empresa"
                      maxLength={50}
                    />
                    <p className="text-xs text-muted-foreground">
                      gameia.app/{orgSlug || "sua-empresa"}
                    </p>
                    {errors.slug && (
                      <p className="text-sm text-destructive">{errors.slug}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Setor</Label>
                      <Select value={orgIndustry} onValueChange={setOrgIndustry}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Tecnologia</SelectItem>
                          <SelectItem value="finance">Finanças</SelectItem>
                          <SelectItem value="healthcare">Saúde</SelectItem>
                          <SelectItem value="retail">Varejo</SelectItem>
                          <SelectItem value="education">Educação</SelectItem>
                          <SelectItem value="manufacturing">Indústria</SelectItem>
                          <SelectItem value="services">Serviços</SelectItem>
                          <SelectItem value="other">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tamanho</Label>
                      <Select value={orgSize} onValueChange={setOrgSize}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 pessoas</SelectItem>
                          <SelectItem value="11-50">11-50 pessoas</SelectItem>
                          <SelectItem value="51-200">51-200 pessoas</SelectItem>
                          <SelectItem value="201-500">201-500 pessoas</SelectItem>
                          <SelectItem value="500+">500+ pessoas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orgDesc">Descrição (opcional)</Label>
                    <Textarea
                      id="orgDesc"
                      value={orgDescription}
                      onChange={(e) => setOrgDescription(e.target.value)}
                      placeholder="Breve descrição da empresa..."
                      maxLength={500}
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {hasOrg === false && (
                <div className="p-6 rounded-xl bg-muted/50 text-center space-y-3">
                  <p className="text-muted-foreground">
                    Use o link de convite que você recebeu para entrar em uma organização existente.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Você pode criar sua própria organização depois nas configurações.
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => (hasOrg === null ? setStep("profile") : setHasOrg(null))}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleOrgSubmit}
                  disabled={isLoading || (hasOrg === true && (!orgName || !orgSlug))}
                >
                  {isLoading ? "Criando..." : hasOrg === false ? "Pular por Agora" : "Criar Organização"}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Complete Step */}
          {step === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/10"
              >
                <Check className="w-12 h-12 text-green-500" />
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">
                  Tudo pronto, {nickname}! 🎉
                </h2>
                <p className="text-muted-foreground">
                  Sua conta está configurada. Agora você pode explorar a plataforma
                  e começar sua jornada de gamificação.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-primary">
                  💡 Dica: Complete desafios diários para ganhar XP e subir no ranking!
                </p>
              </div>

              <Button size="lg" onClick={handleComplete} className="w-full">
                Começar a Jogar
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-4">
        <div className="text-center text-xs text-muted-foreground">
          <a href="/terms" className="hover:underline">Termos</a>
          {" • "}
          <a href="/privacy" className="hover:underline">Privacidade</a>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { GameButton } from "@/components/game/common/GameButton";
import { ThemeToggle } from "@/components/game/common/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowLeft, KeyRound } from "lucide-react";
import { Logo } from "@/components/common/Logo";

/**
 * ===========================================
 * PÁGINA: Auth
 * ===========================================
 * 
 * Login, cadastro e recuperação de senha.
 */

type AuthMode = "login" | "signup" | "forgot" | "reset";

// Validação com zod
const signUpSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  nickname: z.string().trim().min(2, "Apelido deve ter pelo menos 2 caracteres").max(20, "Apelido deve ter no máximo 20 caracteres")
});

const signInSchema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(1, "Senha obrigatória").max(100)
});

const resetSchema = z.object({
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  confirmPassword: z.string().min(6, "Confirme a senha").max(100)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signUp, signIn, resetPassword, updatePassword, profile, isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Detecta se é reset de senha pela URL
  useEffect(() => {
    if (searchParams.get("reset") === "true") {
      setMode("reset");
    }
  }, [searchParams]);

  // Redireciona se já logado (exceto no reset)
  useEffect(() => {
    if (!authLoading && isAuthenticated && profile && mode !== "reset") {
      navigate("/");
    }
  }, [isAuthenticated, profile, authLoading, navigate, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      if (mode === "login") {
        const result = signInSchema.safeParse({ email, password });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro no login",
            description: error.message === "Invalid login credentials" 
              ? "Email ou senha incorretos" 
              : error.message,
            variant: "destructive"
          });
        } else {
          navigate("/");
        }
      } else if (mode === "signup") {
        const result = signUpSchema.safeParse({ email, password, nickname });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, nickname);
        if (error) {
          toast({
            title: "Erro no cadastro",
            description: error.message.includes("already registered")
              ? "Este email já está cadastrado"
              : error.message,
            variant: "destructive"
          });
        } else {
           toast({
             title: "Conta criada!",
             description: "Bem-vindo à Gameia!"
           });
          navigate("/");
        }
      } else if (mode === "forgot") {
        if (!email.trim() || !z.string().email().safeParse(email).success) {
          setErrors({ email: "Email inválido" });
          setIsLoading(false);
          return;
        }

        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Email enviado!",
            description: "Verifique sua caixa de entrada para redefinir a senha"
          });
          setMode("login");
        }
      } else if (mode === "reset") {
        const result = resetSchema.safeParse({ password, confirmPassword });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach(err => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsLoading(false);
          return;
        }

        const { error } = await updatePassword(password);
        if (error) {
          toast({
            title: "Erro",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Senha atualizada!",
            description: "Sua nova senha foi salva"
          });
          navigate("/");
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  const getTitle = () => {
    switch (mode) {
      case "login": return "Entrar";
      case "signup": return "Criar Conta";
      case "forgot": return "Recuperar Senha";
      case "reset": return "Nova Senha";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login": return "Acesse sua conta para acompanhar sua evolução";
      case "signup": return "Crie sua conta (gratuita para pessoas físicas)";
      case "forgot": return "Digite seu email para receber o link de recuperação";
      case "reset": return "Digite sua nova senha";
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Voltar</span>
        </button>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            {mode === "forgot" || mode === "reset" ? (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
                <KeyRound size={32} className="text-primary" />
              </div>
            ) : (
              <div className="flex justify-center mb-4">
                <Logo variant="icon" size="xl" />
              </div>
            )}
            <h1 className="text-2xl font-bold text-foreground">{getTitle()}</h1>
            <p className="text-muted-foreground mt-1">{getSubtitle()}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Apelido (nome no ranking)
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Seu apelido"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    maxLength={20}
                  />
                </div>
                {errors.nickname && (
                  <p className="text-sm text-destructive mt-1">{errors.nickname}</p>
                )}
              </div>
            )}

            {(mode === "login" || mode === "signup" || mode === "forgot") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    maxLength={255}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email}</p>
                )}
              </div>
            )}

            {(mode === "login" || mode === "signup" || mode === "reset") && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  {mode === "reset" ? "Nova Senha" : "Senha"}
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "login" ? "Sua senha" : "Mínimo 6 caracteres"}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    maxLength={100}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password}</p>
                )}
              </div>
            )}

            {mode === "reset" && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    maxLength={100}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            <GameButton
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Aguarde..." : getTitle()}
            </GameButton>
          </form>

          {/* Links */}
          <div className="text-center mt-6 space-y-2">
            {mode === "login" && (
              <>
                <button
                  onClick={() => setMode("forgot")}
                  className="block w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Esqueceu a senha?
                </button>
                <button
                  onClick={() => {
                    setMode("signup");
                    setErrors({});
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Não tem conta? <span className="text-primary font-medium">Criar conta</span>
                </button>
              </>
            )}
            
            {mode === "signup" && (
              <button
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Já tem conta? <span className="text-primary font-medium">Entrar</span>
              </button>
            )}

            {mode === "forgot" && (
              <button
                onClick={() => {
                  setMode("login");
                  setErrors({});
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span className="text-primary font-medium">Voltar ao login</span>
              </button>
            )}
          </div>

          {/* Legal Links */}
          <div className="text-center mt-8 pt-6 border-t border-border">
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <a href="/terms" className="hover:text-foreground transition-colors">
                Termos de Uso
              </a>
              <span>•</span>
              <a href="/privacy" className="hover:text-foreground transition-colors">
                Política de Privacidade
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Send, Calendar, Users, Building2, Phone } from "lucide-react";
import { Logo } from "@/components/common/Logo";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  company: z.string().min(2, "Empresa deve ter pelo menos 2 caracteres").max(100).optional(),
  company_size: z.string().optional(),
  phone: z.string().max(20).optional(),
  message: z.string().max(1000).optional()
});

const benefits = [
  "Demo personalizada para seu segmento",
  "Entenda como a gamificação pode ajudar sua equipe",
  "Conheça cases de empresas similares",
  "Tire todas suas dúvidas com especialistas",
  "Sem compromisso ou pressão de vendas"
];

const companySizes = [
  { value: "1-10", label: "1-10 funcionários" },
  { value: "11-50", label: "11-50 funcionários" },
  { value: "51-200", label: "51-200 funcionários" },
  { value: "201-500", label: "201-500 funcionários" },
  { value: "500+", label: "500+ funcionários" }
];

export default function Demo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    company_size: "",
    phone: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form data
    const result = leadSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("demo_leads")
        .insert({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company?.trim() || null,
          company_size: formData.company_size || null,
          phone: formData.phone?.trim() || null,
          message: formData.message?.trim() || null,
          source: "demo_page"
        });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Solicitação enviada com sucesso!");
    } catch (error) {
      console.error("Error submitting demo request:", error);
      toast.error("Erro ao enviar solicitação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/landing" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link to="/pricing">
              <Button variant="outline">Ver Preços</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Agende uma{" "}
                <span className="text-gradient">demonstração</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Descubra como o GAMEIA pode transformar o treinamento da sua equipe 
                em uma experiência engajadora e mensurável.
              </p>

              <div className="space-y-4 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-gameia-success shrink-0" />
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="gameia-card p-4 text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">30 min</p>
                </Card>
                <Card className="gameia-card p-4 text-center">
                  <Users className="h-8 w-8 text-secondary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">1:1</p>
                </Card>
                <Card className="gameia-card p-4 text-center">
                  <Building2 className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Personalizado</p>
                </Card>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="gameia-card p-8">
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-gameia-success/20 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-gameia-success" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Solicitação Enviada!</h2>
                    <p className="text-muted-foreground mb-6">
                      Nossa equipe entrará em contato em até 24 horas para agendar sua demonstração.
                    </p>
                    <Link to="/landing">
                      <Button variant="outline">Voltar para Home</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-2">Solicitar Demonstração</h2>
                    <p className="text-muted-foreground mb-6">
                      Preencha o formulário e entraremos em contato
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome *</Label>
                          <Input
                            id="name"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className={errors.name ? "border-destructive" : ""}
                          />
                          {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email corporativo *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@empresa.com"
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            className={errors.email ? "border-destructive" : ""}
                          />
                          {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="company">Empresa</Label>
                          <Input
                            id="company"
                            placeholder="Nome da empresa"
                            value={formData.company}
                            onChange={(e) => handleChange("company", e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company_size">Tamanho da empresa</Label>
                          <Select
                            value={formData.company_size}
                            onValueChange={(value) => handleChange("company_size", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {companySizes.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            placeholder="(11) 99999-9999"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Mensagem (opcional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Conte-nos sobre seus desafios de treinamento..."
                          value={formData.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          rows={4}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full btn-primary-gameia"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Enviando..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Solicitar Demonstração
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        Ao enviar, você concorda com nossa{" "}
                        <Link to="/privacy" className="underline hover:text-foreground">
                          Política de Privacidade
                        </Link>
                      </p>
                    </form>
                  </>
                )}
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} GAMEIA. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}

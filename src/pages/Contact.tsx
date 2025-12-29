import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight,
  Send,
  CheckCircle2,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEOHead, SEO_CONFIG } from "@/components/marketing";
import { useTracking } from "@/hooks/useTracking";
import { Header, Footer } from "@/components/layout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TEAM_SIZES = [
  { value: "1-10", label: "1-10 colaboradores" },
  { value: "11-50", label: "11-50 colaboradores" },
  { value: "51-200", label: "51-200 colaboradores" },
  { value: "201-500", label: "201-500 colaboradores" },
  { value: "500+", label: "500+ colaboradores" },
];

const AREAS = [
  { value: "rh", label: "RH / Pessoas" },
  { value: "td", label: "T&D / Treinamento" },
  { value: "vendas", label: "Vendas / Comercial" },
  { value: "operacoes", label: "Operações" },
  { value: "ti", label: "TI / Tecnologia" },
  { value: "outro", label: "Outro" },
];

const CONTACT_INFO = [
  {
    icon: Mail,
    title: "Email",
    value: "contato@gameia.com.br",
    description: "Respondemos em até 24h úteis",
  },
  {
    icon: Phone,
    title: "Telefone",
    value: "+55 (11) 99999-9999",
    description: "Seg-Sex, 9h às 18h",
  },
  {
    icon: MapPin,
    title: "Endereço",
    value: "São Paulo, SP",
    description: "Brasil",
  },
];

interface FormData {
  name: string;
  email: string;
  company: string;
  teamSize: string;
  area: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    teamSize: "",
    area: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const navigate = useNavigate();
  const { trackPageView, trackLeadSubmit, trackCTAClick } = useTracking();

  useEffect(() => {
    trackPageView("contact");
  }, [trackPageView]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error("Por favor, preencha nome e email");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("demo_leads").insert({
        name: formData.name,
        email: formData.email,
        company: formData.company || null,
        company_size: formData.teamSize || null,
        message: formData.message || null,
        source: "contact_form",
      });

      if (error) throw error;

      trackLeadSubmit("contact", {
        area: formData.area,
        teamSize: formData.teamSize,
      });

      setIsSuccess(true);
      toast.success("Mensagem enviada com sucesso!");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleClick = () => {
    trackCTAClick("schedule_meeting", "contact_success");
    // Open Calendly or other scheduling tool
    window.open("https://calendly.com/gameia/demo", "_blank");
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <SEOHead {...SEO_CONFIG.contact} />
        <Header />

        <section className="pt-32 pb-20 px-4">
          <div className="container mx-auto max-w-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Mensagem enviada!
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8">
                Obrigado pelo contato, {formData.name.split(" ")[0]}! 
                <br />
                Nossa equipe responderá em até 24 horas úteis.
              </p>

              <Card className="p-6 mb-8 text-left">
                <div className="flex items-start gap-4">
                  <Calendar className="w-6 h-6 text-primary shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Quer agilizar? Agende agora!
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Se preferir, você pode agendar uma conversa diretamente 
                      com nosso time de especialistas.
                    </p>
                    <Button onClick={handleScheduleClick} className="gap-2">
                      <Calendar className="w-4 h-4" />
                      Agendar horário
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={() => navigate("/")}>
                  Voltar para home
                </Button>
                <Button variant="outline" onClick={() => navigate("/produto")}>
                  Conhecer o produto
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.contact} />
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <MessageSquare className="w-3 h-3 mr-1" />
              Fale conosco
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Vamos transformar seus{" "}
              <span className="text-primary">treinamentos?</span>
            </h1>
            
            <p className="text-lg text-muted-foreground">
              Preencha o formulário e nossa equipe entrará em contato 
              em até 24 horas úteis para entender suas necessidades.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email corporativo *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@empresa.com.br"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        name="company"
                        placeholder="Nome da empresa"
                        value={formData.company}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="teamSize">Tamanho do time</Label>
                      <Select
                        value={formData.teamSize}
                        onValueChange={(value) => handleSelectChange("teamSize", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEAM_SIZES.map((size) => (
                            <SelectItem key={size.value} value={size.value}>
                              {size.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Área de atuação</Label>
                    <Select
                      value={formData.area}
                      onValueChange={(value) => handleSelectChange("area", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione sua área" />
                      </SelectTrigger>
                      <SelectContent>
                        {AREAS.map((area) => (
                          <SelectItem key={area.value} value={area.value}>
                            {area.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Conte-nos sobre seu desafio ou objetivo..."
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full gap-2"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Enviando..."
                    ) : (
                      <>
                        Enviar mensagem
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Ao enviar, você concorda com nossa{" "}
                    <a href="/privacidade" className="text-primary hover:underline">
                      Política de Privacidade
                    </a>
                  </p>
                </form>
              </Card>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Outras formas de contato
                </h2>
                <div className="space-y-4">
                  {CONTACT_INFO.map((info) => (
                    <Card key={info.title} className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                          <info.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{info.title}</div>
                          <div className="text-sm text-foreground">{info.value}</div>
                          <div className="text-xs text-muted-foreground">{info.description}</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Card className="p-6 bg-primary/5 border-primary/20">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Tempo de resposta
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Respondemos todas as mensagens em até 24 horas úteis. 
                      Para urgências, ligue diretamente.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <Building2 className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Para grandes empresas
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Oferecemos condições especiais para enterprise com 
                      +500 colaboradores.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/planos")}>
                      Ver planos Enterprise
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  ArrowRight,
  Shield,
  Lock,
  Server,
  Eye,
  FileCheck,
  Users,
  Key,
  Database,
  CheckCircle2,
  Globe,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SEOHead, SEO_CONFIG, CommercialFAQ } from "@/components/marketing";
import { useTracking } from "@/hooks/useTracking";
import { Header, Footer } from "@/components/layout";

const SECURITY_FEATURES = [
  {
    icon: Lock,
    title: "Criptografia de Ponta",
    description: "Dados criptografados em repouso (AES-256) e em trânsito (TLS 1.3). Suas informações protegidas com padrões bancários.",
  },
  {
    icon: Server,
    title: "Infraestrutura Segura",
    description: "Servidores em datacenters certificados ISO 27001 e SOC 2. Redundância geográfica e backups automáticos diários.",
  },
  {
    icon: Fingerprint,
    title: "Autenticação Robusta",
    description: "SSO com SAML 2.0 e OAuth 2.0, MFA, integração com Azure AD, Google Workspace, Okta e mais.",
  },
  {
    icon: Eye,
    title: "Auditoria Completa",
    description: "Logs de acesso e ações para conformidade. Relatórios de auditoria disponíveis a qualquer momento.",
  },
  {
    icon: Users,
    title: "Controle de Permissões",
    description: "Papéis granulares (admin, gestor, colaborador) com permissões configuráveis por módulo e funcionalidade.",
  },
  {
    icon: Database,
    title: "Isolamento de Dados",
    description: "Seus dados são completamente isolados de outros clientes. Opção de ambiente dedicado para enterprise.",
  },
];

const LGPD_FEATURES = [
  {
    title: "Consentimento Explícito",
    description: "Coleta de dados apenas com consentimento claro do usuário, com registro de quando e como foi dado.",
  },
  {
    title: "Direito ao Esquecimento",
    description: "Exclusão completa de dados pessoais em até 72 horas, com certificado de exclusão.",
  },
  {
    title: "Portabilidade de Dados",
    description: "Exportação de dados em formatos abertos (JSON, CSV) a qualquer momento.",
  },
  {
    title: "Minimização de Dados",
    description: "Coletamos apenas dados estritamente necessários para o funcionamento da plataforma.",
  },
  {
    title: "Transparência Total",
    description: "Política de privacidade clara e acessível, sem juridiquês.",
  },
  {
    title: "DPO Dedicado",
    description: "Encarregado de Proteção de Dados disponível para dúvidas e solicitações.",
  },
];

const CERTIFICATIONS = [
  { name: "ISO 27001", status: "Infraestrutura certificada" },
  { name: "SOC 2 Type II", status: "Datacenter certificado" },
  { name: "LGPD", status: "100% Compliant" },
  { name: "GDPR Ready", status: "Preparado para operação EU" },
];

export default function Security() {
  const navigate = useNavigate();
  const { trackPageView, trackCTAClick } = useTracking();

  useEffect(() => {
    trackPageView("security");
  }, [trackPageView]);

  const handleContactClick = () => {
    trackCTAClick("security_contact", "security");
    navigate("/contato");
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.security} />
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Segurança Enterprise-Grade
            </Badge>
            
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Seus dados protegidos com os{" "}
              <span className="text-primary">mais altos padrões</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-8">
              Infraestrutura de segurança empresarial, conformidade total com LGPD 
              e controles granulares de acesso. Sua empresa protegida.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleContactClick} className="gap-2">
                Falar com especialista
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/demo")}>
                Ver demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Segurança</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Proteção em todas as camadas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Segurança não é opcional. Está embutida em cada aspecto da plataforma.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECURITY_FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* LGPD Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">LGPD</Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
                100% Compatível com LGPD
              </h2>
              <p className="text-muted-foreground mb-8">
                A GAMEIA foi desenvolvida com privacidade como prioridade (Privacy by Design). 
                Todos os direitos dos titulares de dados são respeitados e facilmente exercíveis.
              </p>

              <div className="space-y-4">
                {LGPD_FEATURES.slice(0, 3).map((feature, index) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <div className="font-medium text-foreground">{feature.title}</div>
                      <div className="text-sm text-muted-foreground">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-6">
                <h3 className="font-semibold text-foreground mb-6">
                  Todos os direitos LGPD garantidos
                </h3>
                <div className="space-y-4">
                  {LGPD_FEATURES.slice(3).map((feature, index) => (
                    <div key={feature.title} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-foreground">{feature.title}</div>
                        <div className="text-sm text-muted-foreground">{feature.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Badge variant="outline" className="mb-4">Certificações</Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Certificações e Conformidade
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {CERTIFICATIONS.map((cert, index) => (
              <motion.div
                key={cert.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 text-center">
                  <FileCheck className="w-8 h-8 text-primary mx-auto mb-4" />
                  <div className="font-semibold text-foreground mb-1">{cert.name}</div>
                  <div className="text-sm text-muted-foreground">{cert.status}</div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <CommercialFAQ 
            variant="security" 
            title="Perguntas sobre segurança"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center p-8 md:p-12 rounded-2xl bg-card border border-border"
          >
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Tem perguntas sobre segurança?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Nossa equipe de segurança está disponível para responder suas dúvidas 
              e fornecer documentação adicional para sua análise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleContactClick} className="gap-2">
                Falar com especialista
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/planos")}>
                Ver planos
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

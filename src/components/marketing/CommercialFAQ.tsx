import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

const GENERAL_FAQS: FAQItem[] = [
  {
    question: "Meus dados estão seguros? A plataforma é compatível com LGPD?",
    answer: "Sim, absolutamente. A GAMEIA foi desenvolvida com segurança como prioridade. Todos os dados são criptografados em repouso e em trânsito. Somos 100% compatíveis com LGPD, com controles de consentimento, direito ao esquecimento e portabilidade de dados. Nossos servidores estão em datacenters certificados ISO 27001.",
  },
  {
    question: "O ranking não vai desmotivar minha equipe?",
    answer: "Entendemos essa preocupação, e é por isso que desenvolvemos rankings inteligentes. Você pode configurar rankings por equipes (não individuais), usar rankings relativos (progresso pessoal), ou desativar rankings completamente. Nossos dados mostram que 94% dos usuários reportam maior motivação com nosso sistema de gamificação configurado corretamente.",
  },
  {
    question: "Quanto tempo leva a implantação?",
    answer: "A maioria das empresas está operacional em menos de 1 semana. O setup básico leva 1 dia, configuração de conteúdo 2-3 dias, e treinamento da equipe de RH mais 1-2 dias. Oferecemos suporte dedicado durante toda a implantação, sem custos adicionais.",
  },
  {
    question: "Preciso de TI para configurar e manter?",
    answer: "Não. A GAMEIA é 100% SaaS, sem instalação. A interface de administração foi desenhada para profissionais de RH e T&D, não técnicos. Você configura trilhas, quizzes e simuladores com arrastar-e-soltar. Para integrações avançadas (SSO, API), oferecemos suporte técnico incluso.",
  },
  {
    question: "Posso cancelar a qualquer momento?",
    answer: "Sim, sem multas ou fidelidade. Acreditamos que você vai ficar porque vê resultados, não por contrato. Oferecemos também garantia de 30 dias: se não ver melhoria nos indicadores de engajamento, devolvemos 100% do valor.",
  },
  {
    question: "Como meço o ROI da plataforma?",
    answer: "Fornecemos dashboards de ROI automáticos que medem: redução de tempo de onboarding, aumento de engajamento em treinamentos, melhoria em indicadores de vendas (para módulo comercial), e redução de turnover. A maioria dos clientes vê ROI positivo nos primeiros 90 dias.",
  },
];

const SECURITY_FAQS: FAQItem[] = [
  {
    question: "Onde os dados são armazenados?",
    answer: "Todos os dados são armazenados em servidores seguros na nuvem, com opção de região Brasil para conformidade com legislação local. Utilizamos infraestrutura enterprise-grade com redundância geográfica e backups automáticos diários.",
  },
  {
    question: "Vocês acessam os dados dos meus colaboradores?",
    answer: "Não. Seus dados são seus. Nosso acesso é limitado ao suporte técnico quando solicitado por você, com logs de auditoria completos. Não vendemos, compartilhamos ou usamos seus dados para qualquer finalidade além do funcionamento da plataforma.",
  },
  {
    question: "Qual o processo para exclusão de dados (LGPD)?",
    answer: "Oferecemos exclusão completa em até 72 horas úteis. Você pode solicitar via painel administrativo ou email. Fornecemos certificado de exclusão e logs de auditoria para sua conformidade interna.",
  },
  {
    question: "A plataforma suporta SSO empresarial?",
    answer: "Sim, suportamos SAML 2.0, OAuth 2.0, Azure AD, Google Workspace e outros provedores de identidade. A configuração é simples e nosso time técnico oferece suporte durante a integração.",
  },
];

const PRICING_FAQS: FAQItem[] = [
  {
    question: "Existe período de teste gratuito?",
    answer: "Sim! Oferecemos 14 dias gratuitos com acesso completo a todas as funcionalidades. Não pedimos cartão de crédito para começar. Ao final do período, você escolhe o plano ideal ou simplesmente para de usar.",
  },
  {
    question: "Os preços são por usuário?",
    answer: "Sim, cobramos por usuário ativo por mês. Usuários inativos não são cobrados. Oferecemos descontos progressivos para equipes maiores e pagamento anual (até 20% de desconto).",
  },
  {
    question: "Posso mudar de plano depois?",
    answer: "Sim, a qualquer momento. Upgrade é imediato. Downgrade acontece no próximo ciclo de cobrança. Não há multas ou taxas para mudança de plano.",
  },
  {
    question: "Vocês oferecem planos para ONGs ou educação?",
    answer: "Sim! Oferecemos até 50% de desconto para organizações sem fins lucrativos, instituições de ensino e programas sociais. Entre em contato para saber mais.",
  },
];

interface CommercialFAQProps {
  variant?: "general" | "security" | "pricing" | "all";
  className?: string;
  title?: string;
}

export function CommercialFAQ({ 
  variant = "general", 
  className = "",
  title = "Perguntas Frequentes"
}: CommercialFAQProps) {
  let faqs: FAQItem[] = [];
  
  switch (variant) {
    case "security":
      faqs = SECURITY_FAQS;
      break;
    case "pricing":
      faqs = [...PRICING_FAQS, ...GENERAL_FAQS.slice(0, 2)];
      break;
    case "all":
      faqs = [...GENERAL_FAQS, ...SECURITY_FAQS, ...PRICING_FAQS];
      break;
    default:
      faqs = GENERAL_FAQS;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={className}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
        {title}
      </h2>
      <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-foreground hover:text-primary">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  );
}

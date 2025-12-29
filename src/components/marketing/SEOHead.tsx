import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: "website" | "article" | "product";
  canonical?: string;
}

const BASE_URL = "https://gameia.com.br";
const DEFAULT_OG_IMAGE = "/logo.png";

export function SEOHead({
  title,
  description,
  keywords,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonical,
}: SEOHeadProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Helper to set meta tag
    const setMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    setMeta("description", description);
    if (keywords) {
      setMeta("keywords", keywords);
    }

    // Open Graph tags
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("og:image", ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`, true);
    setMeta("og:site_name", "GAMEIA", true);
    
    if (canonical) {
      setMeta("og:url", canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical}`, true);
      
      // Set canonical link
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical}`;
    }

    // Twitter Card tags
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`);

    // Cleanup function
    return () => {
      // Don't remove meta tags on cleanup as they should persist
    };
  }, [title, description, keywords, ogImage, ogType, canonical]);

  return null;
}

// SEO configurations for each page
export const SEO_CONFIG = {
  home: {
    title: "GAMEIA | Gamificação Empresarial - Transforme Treinamentos em Resultados",
    description: "Plataforma de gamificação corporativa que aumenta engajamento em 300% e reduz turnover em 45%. Treinamentos que geram resultados mensuráveis.",
    keywords: "gamificação empresarial, treinamento corporativo, engajamento de equipes, RH digital",
    canonical: "/",
  },
  product: {
    title: "Produto | GAMEIA - Plataforma de Gamificação Corporativa",
    description: "Conheça a plataforma completa de gamificação: simuladores de vendas, quizzes, cenários de decisão e trilhas personalizadas. Resultados em 30 dias.",
    keywords: "plataforma gamificação, simulador vendas, quiz corporativo, treinamento gamificado",
    canonical: "/produto",
  },
  useCases: {
    title: "Casos de Uso | GAMEIA - Vendas, Onboarding e Liderança",
    description: "Descubra como empresas usam GAMEIA para treinar vendas, acelerar onboarding, desenvolver líderes e engajar operações. Cases reais de sucesso.",
    keywords: "cases gamificação, treinamento vendas, onboarding gamificado, desenvolvimento liderança",
    canonical: "/casos-de-uso",
  },
  pricing: {
    title: "Preços e Planos | GAMEIA - Comece Gratuitamente",
    description: "Planos flexíveis para equipes de todos os tamanhos. Comece grátis e escale conforme sua empresa cresce. ROI garantido em 90 dias.",
    keywords: "preços gamificação, planos corporativos, gamificação empresas",
    canonical: "/planos",
  },
  security: {
    title: "Segurança e LGPD | GAMEIA - Seus Dados Protegidos",
    description: "Infraestrutura enterprise-grade, conformidade LGPD, criptografia de ponta. Seus dados corporativos protegidos com os mais altos padrões de segurança.",
    keywords: "segurança dados, LGPD, compliance, proteção dados corporativos",
    canonical: "/seguranca",
  },
  contact: {
    title: "Contato | GAMEIA - Fale com Nossos Especialistas",
    description: "Entre em contato com nossa equipe de especialistas em gamificação corporativa. Resposta em até 24 horas úteis.",
    keywords: "contato gameia, falar com especialista, demo gamificação",
    canonical: "/contato",
  },
  demo: {
    title: "Agendar Demo | GAMEIA - Veja a Plataforma em Ação",
    description: "Agende uma demonstração personalizada da plataforma GAMEIA. Descubra como transformar seus treinamentos em experiências engajantes.",
    keywords: "demo gamificação, demonstração plataforma, agendar apresentação",
    canonical: "/demo",
  },
} as const;

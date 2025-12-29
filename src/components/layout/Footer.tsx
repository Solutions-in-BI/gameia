/**
 * Footer institucional completo (Atualizado)
 * Links, redes sociais, copyright
 */

import { Link } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { 
  Linkedin, 
  Instagram, 
  Youtube,
  Mail,
  MapPin,
  Phone
} from "lucide-react";

const footerLinks = {
  produto: [
    { label: "Visão Geral", href: "/produto" },
    { label: "Módulos", href: "/servicos" },
    { label: "Preços", href: "/planos" },
    { label: "Agendar Demo", href: "/demo" },
  ],
  solucoes: [
    { label: "Vendas", href: "/casos-de-uso?tab=vendas" },
    { label: "Operações", href: "/casos-de-uso?tab=operacoes" },
    { label: "Liderança", href: "/casos-de-uso?tab=lideranca" },
    { label: "Onboarding", href: "/casos-de-uso?tab=onboarding" },
  ],
  empresa: [
    { label: "Sobre Nós", href: "/sobre" },
    { label: "Segurança", href: "/seguranca" },
    { label: "Contato", href: "/contato" },
    { label: "Blog", href: "#" },
  ],
  legal: [
    { label: "Termos de Uso", href: "/terms" },
    { label: "Privacidade", href: "/privacy" },
    { label: "Cookies", href: "/privacy" },
    { label: "LGPD", href: "/seguranca" },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
];

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-8" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                GAMEIA
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              Transforme treinamentos corporativos em experiências gamificadas 
              que engajam, desenvolvem e retêm talentos.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-muted-foreground">
              <a 
                href="mailto:contato@gameia.com.br" 
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Mail className="h-4 w-4" />
                contato@gameia.com.br
              </a>
              <a 
                href="tel:+5511999999999" 
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <Phone className="h-4 w-4" />
                +55 (11) 99999-9999
              </a>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                São Paulo, Brasil
              </p>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Produto */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Soluções */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Soluções</h4>
            <ul className="space-y-3">
              {footerLinks.solucoes.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} GAMEIA. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              Feito com <span className="text-red-500">♥</span> no Brasil
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

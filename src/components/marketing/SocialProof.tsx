import { motion } from "framer-motion";
import { Building2, Users, Trophy, Star } from "lucide-react";

interface SocialProofProps {
  variant?: "logos" | "stats" | "compact";
  className?: string;
}

const COMPANY_LOGOS = [
  { name: "TechCorp", initials: "TC" },
  { name: "Vendas Plus", initials: "VP" },
  { name: "RH Digital", initials: "RD" },
  { name: "Indústria SA", initials: "IS" },
  { name: "Banco Next", initials: "BN" },
  { name: "Varejo Max", initials: "VM" },
];

const STATS = [
  { icon: Building2, value: "150+", label: "Empresas confiam" },
  { icon: Users, value: "25.000+", label: "Colaboradores treinados" },
  { icon: Trophy, value: "98%", label: "Taxa de engajamento" },
  { icon: Star, value: "4.9", label: "Avaliação média" },
];

export function SocialProof({ variant = "logos", className = "" }: SocialProofProps) {
  if (variant === "stats") {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${className}`}>
        {STATS.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-3">
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
        <span className="text-muted-foreground text-sm">Usado por:</span>
        <div className="flex -space-x-2">
          {COMPANY_LOGOS.slice(0, 4).map((company, index) => (
            <div
              key={company.name}
              className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold text-muted-foreground"
              title={company.name}
            >
              {company.initials}
            </div>
          ))}
        </div>
        <span className="text-muted-foreground text-sm">+150 empresas</span>
      </div>
    );
  }

  // Default: logos variant
  return (
    <div className={className}>
      <p className="text-center text-muted-foreground text-sm mb-6">
        Empresas que confiam na GAMEIA
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {COMPANY_LOGOS.map((company, index) => (
          <motion.div
            key={company.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-center w-24 h-12 rounded-lg bg-muted/50 border border-border/50"
          >
            <span className="text-lg font-semibold text-muted-foreground">
              {company.initials}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Testimonial component for social proof
interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
}

export function TestimonialCard({ quote, author, role, company, avatar }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-primary text-primary" />
        ))}
      </div>
      <p className="text-foreground mb-4 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
          {avatar || author.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-foreground">{author}</div>
          <div className="text-sm text-muted-foreground">{role} • {company}</div>
        </div>
      </div>
    </motion.div>
  );
}

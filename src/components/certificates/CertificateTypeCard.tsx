/**
 * CertificateTypeCard - Card visual diferenciado por tipo de certificado
 */

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Award, BookOpen, Route, Star, Medal, Users, CheckCircle2, Clock, XCircle, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CertificateWithDetails } from "@/hooks/useCertificates";
import { CONTENT_TYPE_COLORS, getCertificateStatusColors } from "@/constants/colors";

interface CertificateTypeCardProps {
  certificate: CertificateWithDetails;
  onClick: () => void;
}

const TYPE_CONFIG = {
  training: {
    label: "Treinamento",
    icon: BookOpen,
  },
  journey: {
    label: "Jornada",
    icon: Route,
  },
  skill: {
    label: "Skill",
    icon: Star,
  },
  level: {
    label: "Nível",
    icon: Medal,
  },
  behavioral: {
    label: "Comportamental",
    icon: Users,
  },
};

const STATUS_CONFIG = {
  active: {
    label: "Ativo",
    icon: CheckCircle2,
  },
  pending_approval: {
    label: "Aguardando",
    icon: Clock,
  },
  expired: {
    label: "Expirado",
    icon: Clock,
  },
  revoked: {
    label: "Revogado",
    icon: XCircle,
  },
  rejected: {
    label: "Rejeitado",
    icon: XCircle,
  },
};

// Status colors now come from getCertificateStatusColors helper

export function CertificateTypeCard({ certificate, onClick }: CertificateTypeCardProps) {
  const certType = (certificate as any).certificate_type || "training";
  const typeConfig = TYPE_CONFIG[certType as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.training;
  const typeColors = CONTENT_TYPE_COLORS[certType as keyof typeof CONTENT_TYPE_COLORS] || CONTENT_TYPE_COLORS.training;
  
  const statusKey = certificate.status as keyof typeof STATUS_CONFIG;
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.active;
  const statusColors = getCertificateStatusColors(statusKey);
  
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;
  const certificateName = certificate.metadata?.certificate_name || certificate.training?.name || "Certificado";

  return (
    <Card 
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5 border-border/50 hover:border-primary/30"
      onClick={onClick}
    >
      <CardContent className="p-0">
        {/* Header with type-specific gradient */}
        <div className={`h-20 relative flex items-center justify-center bg-gradient-to-br ${typeColors.gradientSubtle}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent" />
          
          {/* Type icon */}
          <div className={`relative z-10 p-3 rounded-full bg-background/50`}>
            <TypeIcon className={`w-6 h-6 ${typeColors.icon}`} />
          </div>
          
          {/* Status badge */}
          <Badge className={`absolute top-2 right-2 ${statusColors.bg} ${statusColors.text} ${statusColors.border} text-xs`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
          
          {/* Type label */}
          <Badge 
            variant="outline" 
            className={`absolute top-2 left-2 ${typeColors.icon} border-current/30 bg-background/80 text-xs`}
          >
            {typeConfig.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {certificateName}
            </h3>
            {certificate.training?.category && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {certificate.training.category}
              </p>
            )}
          </div>

          {/* Skills */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {certificate.skills.slice(0, 2).map((skill) => (
                <Badge 
                  key={skill.id} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5"
                >
                  <span className="mr-1">{skill.icon}</span>
                  {skill.name}
                </Badge>
              ))}
              {certificate.skills.length > 2 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{certificate.skills.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(certificate.issued_at), "dd MMM yyyy", { locale: ptBR })}
            </div>
            {certificate.final_score && (
              <div className="flex items-center gap-1">
                <Award className="w-3 h-3" />
                {certificate.final_score}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

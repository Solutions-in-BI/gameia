/**
 * CertificateCard - Card visual para certificado
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Award, Download, ExternalLink, Calendar, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CertificateWithDetails } from "@/hooks/useCertificates";

interface CertificateCardProps {
  certificate: CertificateWithDetails;
  onView: () => void;
  onDownload: () => void;
  onShare: () => void;
}

const STATUS_CONFIG = {
  active: {
    label: "Ativo",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: CheckCircle2,
  },
  expired: {
    label: "Expirado",
    color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    icon: Clock,
  },
  revoked: {
    label: "Revogado",
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: XCircle,
  },
};

export function CertificateCard({ certificate, onView, onDownload, onShare }: CertificateCardProps) {
  const status = STATUS_CONFIG[certificate.status] || STATUS_CONFIG.active;
  const StatusIcon = status.icon;
  const certificateName = certificate.metadata?.certificate_name || certificate.training?.name || "Certificado";

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:shadow-primary/5 border-border/50 hover:border-primary/30">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div 
          className="h-24 relative flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${certificate.training?.color || '#3b82f6'}20, ${certificate.training?.color || '#3b82f6'}40)`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/20 to-transparent" />
          <span className="text-4xl relative z-10">
            {certificate.training?.icon || "🏆"}
          </span>
          
          {/* Status badge */}
          <Badge className={`absolute top-3 right-3 ${status.color} text-xs`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <div>
            <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {certificateName}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {certificate.training?.category}
            </p>
          </div>

          {/* Skills */}
          {certificate.skills.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {certificate.skills.slice(0, 3).map((skill) => (
                <Badge 
                  key={skill.id} 
                  variant="secondary" 
                  className="text-xs px-2 py-0.5"
                >
                  <span className="mr-1">{skill.icon}</span>
                  {skill.name}
                </Badge>
              ))}
              {certificate.skills.length > 3 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  +{certificate.skills.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Meta info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
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

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex-1 h-8 text-xs"
              onClick={onView}
            >
              Visualizar
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={onDownload}
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={onShare}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

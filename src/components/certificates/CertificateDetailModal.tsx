/**
 * CertificateDetailModal - Modal com detalhes completos do certificado
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Award, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Copy, 
  Download, 
  ExternalLink, 
  Shield,
  Sparkles,
  XCircle 
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { CertificateWithDetails } from "@/hooks/useCertificates";

interface CertificateDetailModalProps {
  certificate: CertificateWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

const STATUS_CONFIG = {
  active: {
    label: "Certificado Ativo",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    icon: CheckCircle2,
  },
  expired: {
    label: "Certificado Expirado",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    icon: Clock,
  },
  revoked: {
    label: "Certificado Revogado",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    icon: XCircle,
  },
};

export function CertificateDetailModal({ 
  certificate, 
  isOpen, 
  onClose,
  onDownload 
}: CertificateDetailModalProps) {
  if (!certificate) return null;

  const status = STATUS_CONFIG[certificate.status] || STATUS_CONFIG.active;
  const StatusIcon = status.icon;
  const certificateName = certificate.metadata?.certificate_name || certificate.training?.name || "Certificado";
  const verificationUrl = certificate.verification_code 
    ? `${window.location.origin}/certificates/${certificate.verification_code}`
    : null;

  const handleCopyCode = () => {
    if (certificate.verification_code) {
      navigator.clipboard.writeText(certificate.verification_code);
      toast.success("Código copiado!");
    }
  };

  const handleCopyLink = () => {
    if (verificationUrl) {
      navigator.clipboard.writeText(verificationUrl);
      toast.success("Link copiado!");
    }
  };

  const handleShare = () => {
    if (verificationUrl) {
      if (navigator.share) {
        navigator.share({
          title: certificateName,
          text: `Confira meu certificado: ${certificateName}`,
          url: verificationUrl,
        });
      } else {
        handleCopyLink();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Detalhes do Certificado
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Certificate visual */}
          <div 
            className="relative rounded-xl p-6 text-center overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${certificate.training?.color || '#3b82f6'}15, ${certificate.training?.color || '#3b82f6'}30)`,
            }}
          >
            <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
            <div className="relative z-10">
              <span className="text-5xl mb-4 block">{certificate.training?.icon || "🏆"}</span>
              <h2 className="text-xl font-bold text-foreground mb-1">
                {certificateName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {certificate.organization_name}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className={`flex items-center justify-center gap-2 p-3 rounded-lg ${status.bgColor}`}>
            <StatusIcon className={`w-5 h-5 ${status.color}`} />
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Emitido em</p>
                <p className="text-sm font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                  {format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
              {certificate.expires_at && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Válido até</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    {format(new Date(certificate.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              )}
            </div>

            {/* Score */}
            {certificate.final_score && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Score Final</p>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-lg font-bold">{certificate.final_score}%</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Skills validated */}
            {certificate.skills.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Competências Validadas</p>
                <div className="flex flex-wrap gap-2">
                  {certificate.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary" className="px-3 py-1">
                      <span className="mr-1.5">{skill.icon}</span>
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Verification code */}
            {certificate.verification_code && (
              <div>
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Código de Verificação
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md font-mono text-sm">
                    {certificate.verification_code}
                  </code>
                  <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={handleShare}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button 
              className="flex-1"
              onClick={onDownload}
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

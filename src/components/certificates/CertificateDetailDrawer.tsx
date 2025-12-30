/**
 * CertificateDetailDrawer - Drawer com detalhes completos do certificado
 */

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Award, Download, Share2, ExternalLink, Calendar, CheckCircle2, 
  Clock, XCircle, Copy, BookOpen, Route, Star, Medal, Users,
  Target, TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import type { CertificateWithDetails } from "@/hooks/useCertificates";

interface CertificateDetailDrawerProps {
  certificate: CertificateWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_CONFIG = {
  training: { label: "Treinamento", icon: BookOpen, color: "text-blue-500" },
  journey: { label: "Jornada", icon: Route, color: "text-purple-500" },
  skill: { label: "Skill", icon: Star, color: "text-amber-500" },
  level: { label: "Nível", icon: Medal, color: "text-emerald-500" },
  behavioral: { label: "Comportamental", icon: Users, color: "text-rose-500" },
};

const STATUS_CONFIG = {
  active: { label: "Ativo", color: "bg-green-500/10 text-green-500", icon: CheckCircle2 },
  pending_approval: { label: "Aguardando Aprovação", color: "bg-amber-500/10 text-amber-500", icon: Clock },
  expired: { label: "Expirado", color: "bg-gray-500/10 text-gray-500", icon: Clock },
  revoked: { label: "Revogado", color: "bg-red-500/10 text-red-500", icon: XCircle },
  rejected: { label: "Rejeitado", color: "bg-red-500/10 text-red-500", icon: XCircle },
};

export function CertificateDetailDrawer({ certificate, isOpen, onClose }: CertificateDetailDrawerProps) {
  if (!certificate) return null;

  const certType = (certificate as any).certificate_type || "training";
  const typeConfig = TYPE_CONFIG[certType as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.training;
  const statusConfig = STATUS_CONFIG[certificate.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active;
  
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConfig.icon;
  const certificateName = certificate.metadata?.certificate_name || certificate.training?.name || "Certificado";
  const verificationUrl = `${window.location.origin}/certificates/${certificate.verification_code}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(certificate.verification_code);
    toast.success("Código copiado!");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast.success("Link copiado!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: certificateName,
          text: `Confira meu certificado: ${certificateName}`,
          url: verificationUrl,
        });
      } catch (err) {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = () => {
    toast.info("Gerando PDF do certificado...");
    // TODO: Implement PDF generation
  };

  // Criteria met from certificate
  const criteriaMet = (certificate as any).criteria_met || {};

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          {/* Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`${typeConfig.color} border-current/30`}>
              <TypeIcon className="w-3 h-3 mr-1" />
              {typeConfig.label}
            </Badge>
            <Badge className={statusConfig.color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Title */}
          <SheetTitle className="text-xl font-bold text-left">
            {certificateName}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Certificate Visual Preview */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-lg p-6 border border-primary/20 text-center">
            <Award className="w-16 h-16 mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Certificado emitido por</p>
            <p className="font-semibold text-foreground">Gameia</p>
            <p className="text-xs text-muted-foreground mt-2">
              Código: {certificate.verification_code?.slice(0, 8)}...
            </p>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Data de Emissão</span>
              <span className="text-sm font-medium flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>

            {certificate.expires_at && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Validade</span>
                <span className="text-sm font-medium">
                  {format(new Date(certificate.expires_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}

            {certificate.final_score && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Nota Final</span>
                <Badge variant="secondary" className="font-mono">
                  {certificate.final_score}%
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* Skills Validated */}
          {certificate.skills && certificate.skills.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Star className="w-4 h-4 text-primary" />
                Skills Validadas
              </h4>
              <div className="flex flex-wrap gap-2">
                {certificate.skills.map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="px-3 py-1">
                    <span className="mr-1">{skill.icon}</span>
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Criteria Met */}
          {Object.keys(criteriaMet).length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Critérios Cumpridos
              </h4>
              <div className="space-y-2">
                {criteriaMet.completion_rate && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Conclusão: {criteriaMet.completion_rate}%</span>
                  </div>
                )}
                {criteriaMet.score && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Nota mínima atingida: {criteriaMet.score}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Verification */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Verificação
            </h4>
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Código</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCopyCode}>
                  <Copy className="w-3 h-3 mr-1" />
                  {certificate.verification_code?.slice(0, 12)}...
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Link público</span>
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleCopyLink}>
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Copiar link
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

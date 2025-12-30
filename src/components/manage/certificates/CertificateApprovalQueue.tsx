/**
 * CertificateApprovalQueue - Fila de aprovação de certificados
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Clock, Award, BookOpen, Route, Star, Medal } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { OrgCertificate } from "@/hooks/useCertificates";

interface CertificateApprovalQueueProps {
  certificates: OrgCertificate[];
}

const TYPE_CONFIG = {
  training: { label: "Treinamento", icon: BookOpen, color: "text-blue-500" },
  journey: { label: "Jornada", icon: Route, color: "text-purple-500" },
  skill: { label: "Skill", icon: Star, color: "text-amber-500" },
  level: { label: "Nível", icon: Medal, color: "text-emerald-500" },
};

export function CertificateApprovalQueue({ certificates }: CertificateApprovalQueueProps) {
  const [selectedCert, setSelectedCert] = useState<OrgCertificate | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [notes, setNotes] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleApprove = async (cert: OrgCertificate) => {
    setIsApproving(true);
    try {
      const { data, error } = await supabase.rpc('approve_certificate', {
        p_certificate_id: cert.id,
        p_approved: true,
        p_notes: null,
      });

      if (error) throw error;

      toast.success("Certificado aprovado com sucesso!");
      // Refresh would happen via query invalidation
    } catch (error) {
      console.error('Error approving certificate:', error);
      toast.error("Erro ao aprovar certificado");
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCert) return;
    
    setIsRejecting(true);
    try {
      const { data, error } = await supabase.rpc('approve_certificate', {
        p_certificate_id: selectedCert.id,
        p_approved: false,
        p_notes: notes || null,
      });

      if (error) throw error;

      toast.success("Certificado rejeitado");
      setShowRejectDialog(false);
      setSelectedCert(null);
      setNotes("");
    } catch (error) {
      console.error('Error rejecting certificate:', error);
      toast.error("Erro ao rejeitar certificado");
    } finally {
      setIsRejecting(false);
    }
  };

  const openRejectDialog = (cert: OrgCertificate) => {
    setSelectedCert(cert);
    setShowRejectDialog(true);
  };

  if (certificates.length === 0) {
    return (
      <Card className="p-12 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto text-green-500/50 mb-4" />
        <h3 className="font-semibold text-foreground mb-2">
          Nenhuma aprovação pendente
        </h3>
        <p className="text-sm text-muted-foreground">
          Todos os certificados foram revisados
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Aguardando Aprovação
              <Badge className="ml-auto bg-amber-500">{certificates.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {certificates.map(cert => {
              const certType = (cert as any).certificate_type || "training";
              const typeConfig = TYPE_CONFIG[certType as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.training;
              const TypeIcon = typeConfig.icon;
              const certName = cert.metadata?.certificate_name || cert.training?.name || "Certificado";

              return (
                <div 
                  key={cert.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:border-primary/30 transition-colors"
                >
                  {/* User */}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={cert.user?.avatar_url} />
                    <AvatarFallback>
                      {cert.user?.nickname?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-foreground">
                        {cert.user?.nickname || "Usuário"}
                      </span>
                      <Badge variant="outline" className={`text-xs ${typeConfig.color}`}>
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {typeConfig.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {certName}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>
                        Solicitado em {format(new Date(cert.issued_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {cert.final_score && (
                        <span className="flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          {cert.final_score}%
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => openRejectDialog(cert)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rejeitar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                      onClick={() => handleApprove(cert)}
                      disabled={isApproving}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Aprovar
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Certificado</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição. O colaborador será notificado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              placeholder="Motivo da rejeição (opcional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

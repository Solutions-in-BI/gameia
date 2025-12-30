/**
 * ApplicationEvidenceReview - Drawer/Modal para gestor revisar evidência
 */

import { useState } from "react";
import { 
  FileText, Link2, CheckCircle2, Calendar, MessageSquare, Send, ExternalLink
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { BookApplication, useBookApplications } from "@/hooks/useBookApplications";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ApplicationEvidenceReviewProps {
  application: BookApplication | null;
  open: boolean;
  onClose: () => void;
}

export function ApplicationEvidenceReview({ 
  application, 
  open, 
  onClose 
}: ApplicationEvidenceReviewProps) {
  const [feedback, setFeedback] = useState(application?.managerFeedback || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { provideFeedback, markAsViewed } = useBookApplications();

  // Mark as viewed when opened
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && application && !application.managerViewedAt) {
      markAsViewed(application.applicationId);
    }
    if (!isOpen) {
      onClose();
    }
  };

  const handleSubmitFeedback = async () => {
    if (!application || !feedback.trim()) return;
    
    setIsSubmitting(true);
    try {
      await provideFeedback(application.applicationId, feedback);
      toast.success('Feedback enviado com sucesso!');
      onClose();
    } catch (error) {
      toast.error('Erro ao enviar feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) return null;

  const isLate = application.isLate;
  const wasOnTime = application.completedAt && application.deadlineAt && 
    application.completedAt <= application.deadlineAt;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={application.userAvatar || undefined} />
              <AvatarFallback>
                {(application.userName || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{application.userName}</SheetTitle>
              <SheetDescription>Aplicação Prática</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <Badge 
              variant={application.status === 'completed' ? 'default' : 'secondary'}
              className={application.status === 'completed' ? 'bg-green-500' : ''}
            >
              {application.status === 'completed' ? 'Concluído' : 
               application.status === 'in_progress' ? 'Em Progresso' : 'Pendente'}
            </Badge>
            
            {application.status === 'completed' && (
              <Badge variant="outline" className={wasOnTime ? 'border-green-500 text-green-500' : 'border-red-500 text-red-500'}>
                {wasOnTime ? 'No prazo' : 'Atrasado'}
              </Badge>
            )}

            {isLate && application.status !== 'completed' && (
              <Badge variant="destructive">Atrasado</Badge>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            {application.deadlineAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Prazo</p>
                  <p className="font-medium">
                    {format(application.deadlineAt, "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
            
            {application.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <div>
                  <p className="text-muted-foreground">Enviado</p>
                  <p className="font-medium">
                    {format(application.completedAt, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Evidence */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Evidência Submetida
            </Label>
            
            {application.evidenceType && (
              <Badge variant="secondary" className="mb-2">
                Tipo: {application.evidenceType === 'text' ? 'Texto' :
                       application.evidenceType === 'link' ? 'Link' :
                       application.evidenceType === 'file' ? 'Arquivo' : 'Check-in'}
              </Badge>
            )}

            {application.evidenceContent && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border">
                <p className="text-sm whitespace-pre-wrap">{application.evidenceContent}</p>
              </div>
            )}

            {application.evidenceUrl && (
              <a 
                href={application.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors"
              >
                <Link2 className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary flex-1 truncate">
                  {application.evidenceUrl}
                </span>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </a>
            )}

            {!application.evidenceContent && !application.evidenceUrl && (
              <div className="p-4 rounded-lg bg-muted/50 border border-border text-center text-muted-foreground">
                <p className="text-sm">Nenhuma evidência detalhada fornecida</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Feedback */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback do Gestor
            </Label>

            {application.managerFeedback ? (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm whitespace-pre-wrap">{application.managerFeedback}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Enviado em {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            ) : (
              <>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Escreva um feedback para o colaborador sobre esta aplicação prática..."
                  rows={4}
                />
                <Button 
                  onClick={handleSubmitFeedback}
                  disabled={!feedback.trim() || isSubmitting}
                  className="w-full gap-2"
                >
                  <Send className="w-4 h-4" />
                  Enviar Feedback
                </Button>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

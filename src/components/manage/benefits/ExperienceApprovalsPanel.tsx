/**
 * ExperienceApprovalsPanel - Painel para gestores aprovarem benefícios
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gift, Check, X, Clock, Calendar, User, MessageSquare,
  CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";
import { useExperiences, ExperienceRequest } from "@/hooks/useExperiences";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ExperienceApprovalsPanel() {
  const { pendingApprovals, approveRequest, rejectRequest, completeRequest, isLoading } = useExperiences();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    await approveRequest(requestId);
    setProcessingId(null);
  };

  const handleReject = async (requestId: string) => {
    setProcessingId(requestId);
    await rejectRequest(requestId, rejectReason[requestId] || "Solicitação não aprovada");
    setProcessingId(null);
    setExpandedId(null);
  };

  const handleComplete = async (requestId: string) => {
    setProcessingId(requestId);
    await completeRequest(requestId);
    setProcessingId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (pendingApprovals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Gift className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Nenhuma solicitação pendente</p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            As solicitações de benefícios da sua equipe aparecerão aqui
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-amber-500/10 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-amber-500 mb-2" />
            <p className="text-2xl font-bold text-amber-600">
              {pendingApprovals.filter(r => r.status === "pending").length}
            </p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle className="w-6 h-6 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold text-green-600">
              {pendingApprovals.filter(r => r.status === "approved").length}
            </p>
            <p className="text-xs text-muted-foreground">Aprovados</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Gift className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold text-blue-600">
              {pendingApprovals.filter(r => r.status === "completed").length}
            </p>
            <p className="text-xs text-muted-foreground">Concluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Requests list */}
      <div className="space-y-3">
        {pendingApprovals.map((request) => (
          <RequestCard
            key={request.id}
            request={request}
            isExpanded={expandedId === request.id}
            isProcessing={processingId === request.id}
            rejectReason={rejectReason[request.id] || ""}
            onToggleExpand={() => setExpandedId(expandedId === request.id ? null : request.id)}
            onRejectReasonChange={(reason) => setRejectReason(prev => ({ ...prev, [request.id]: reason }))}
            onApprove={() => handleApprove(request.id)}
            onReject={() => handleReject(request.id)}
            onComplete={() => handleComplete(request.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface RequestCardProps {
  request: ExperienceRequest;
  isExpanded: boolean;
  isProcessing: boolean;
  rejectReason: string;
  onToggleExpand: () => void;
  onRejectReasonChange: (reason: string) => void;
  onApprove: () => void;
  onReject: () => void;
  onComplete: () => void;
}

function RequestCard({
  request,
  isExpanded,
  isProcessing,
  rejectReason,
  onToggleExpand,
  onRejectReasonChange,
  onApprove,
  onReject,
  onComplete,
}: RequestCardProps) {
  const statusConfig = {
    pending: { label: "Pendente", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
    approved: { label: "Aprovado", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle },
    rejected: { label: "Recusado", color: "bg-red-500/10 text-red-600 border-red-500/20", icon: XCircle },
    completed: { label: "Concluído", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: Gift },
  };

  const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div layout>
      <Card className={cn(
        "overflow-hidden transition-all",
        request.status === "pending" && "border-amber-500/30",
        request.status === "approved" && "border-green-500/30"
      )}>
        {/* Main content - always visible */}
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {/* Item icon */}
            <div className="text-3xl shrink-0">{request.item?.icon || "🎁"}</div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">{request.item?.name || "Benefício"}</h4>
                <Badge variant="outline" className={cn("text-[10px]", status.color)}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {request.user?.nickname || "Usuário"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Solicitado em {format(new Date(request.requested_at), "dd/MM/yyyy", { locale: ptBR })}
                </span>
                {request.preferred_date && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Prefere: {format(new Date(request.preferred_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                )}
              </div>

              {request.notes && (
                <p className="mt-2 text-xs text-muted-foreground italic">
                  "{request.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {request.status === "pending" && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="bg-green-500/10 text-green-600 hover:bg-green-500/20"
                    onClick={onApprove}
                    disabled={isProcessing}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-red-500"
                    onClick={onToggleExpand}
                    disabled={isProcessing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}

              {request.status === "approved" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                  onClick={onComplete}
                  disabled={isProcessing}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Marcar como concluído
                </Button>
              )}

              {request.status === "rejected" && request.review_notes && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={onToggleExpand}
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>

          {/* Expanded rejection form */}
          <AnimatePresence>
            {isExpanded && request.status === "pending" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span>Recusar solicitação</span>
                  </div>
                  <Textarea
                    placeholder="Motivo da recusa (opcional)"
                    value={rejectReason}
                    onChange={(e) => onRejectReasonChange(e.target.value)}
                    className="text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={onToggleExpand}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={onReject}
                      disabled={isProcessing}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Confirmar recusa
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {isExpanded && request.status === "rejected" && request.review_notes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border"
              >
                <div className="flex items-start gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Motivo da recusa:</p>
                    <p className="text-sm">{request.review_notes}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

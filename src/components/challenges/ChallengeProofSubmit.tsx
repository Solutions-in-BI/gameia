/**
 * ChallengeProofSubmit - Componente para envio de comprovação de desafio
 * Suporta: checkin, text, file, link, metric
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Upload,
  Link as LinkIcon,
  TrendingUp,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { PROOF_TYPE_CONFIG, type ProofType } from "@/constants/challengeTypes";

interface ChallengeProofSubmitProps {
  proofType: ProofType;
  onSubmit: (data: { content?: string; file_url?: string }) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

const PROOF_ICONS = {
  checkin: CheckCircle2,
  text: FileText,
  file: Upload,
  link: LinkIcon,
  metric: TrendingUp,
};

export function ChallengeProofSubmit({
  proofType,
  onSubmit,
  isLoading = false,
  className,
}: ChallengeProofSubmitProps) {
  const [content, setContent] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const config = PROOF_TYPE_CONFIG[proofType];
  const Icon = PROOF_ICONS[proofType];

  const handleSubmit = async () => {
    try {
      await onSubmit({
        content: proofType === "checkin" ? "Check-in realizado" : content,
        file_url: proofType === "file" ? fileUrl : undefined,
      });
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting proof:", error);
    }
  };

  const canSubmit = () => {
    if (isLoading) return false;
    switch (proofType) {
      case "checkin":
        return true;
      case "text":
        return content.trim().length >= 10;
      case "file":
        return fileUrl.trim().length > 0;
      case "link":
        return content.trim().startsWith("http");
      case "metric":
        return content.trim().length > 0 && !isNaN(Number(content));
      default:
        return false;
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "p-6 rounded-xl border border-green-500/30 bg-green-500/10 text-center",
          className
        )}
      >
        <CheckCircle2 className="w-12 h-12 mx-auto text-green-400 mb-3" />
        <h4 className="font-semibold text-green-400 mb-1">Comprovação Enviada!</h4>
        <p className="text-sm text-muted-foreground">
          Sua evidência foi registrada com sucesso.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Checkin - Simple button */}
      {proofType === "checkin" && (
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full h-16 text-lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Check className="w-5 h-5 mr-2" />
          )}
          Fazer Check-in
        </Button>
      )}

      {/* Text - Textarea */}
      {proofType === "text" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Descreva como você aplicou o aprendizado</Label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Conte em detalhes como você colocou em prática..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {content.length} caracteres (mínimo 10)
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-2" />
            )}
            Enviar Comprovação
          </Button>
        </div>
      )}

      {/* File - URL input (simplified, can be enhanced with upload) */}
      {proofType === "file" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>URL do arquivo</Label>
            <Input
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Cole o link do arquivo (Google Drive, Dropbox, etc.)
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Enviar Arquivo
          </Button>
        </div>
      )}

      {/* Link - URL input */}
      {proofType === "link" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Link de evidência</Label>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Insira o link que comprova a realização
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <LinkIcon className="w-4 h-4 mr-2" />
            )}
            Enviar Link
          </Button>
        </div>
      )}

      {/* Metric - Number input */}
      {proofType === "metric" && (
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Valor alcançado</Label>
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Ex: 150"
              type="number"
              min={0}
            />
            <p className="text-xs text-muted-foreground">
              Insira o valor numérico que você atingiu
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit()}
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            Registrar Valor
          </Button>
        </div>
      )}
    </div>
  );
}

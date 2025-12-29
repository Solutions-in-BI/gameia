/**
 * CertificateVerify - Página pública de verificação de certificado
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  Shield, 
  Sparkles,
  ArrowLeft,
  Loader2,
  Building,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useCertificates, CertificateWithDetails } from "@/hooks/useCertificates";

export default function CertificateVerify() {
  const { code } = useParams<{ code: string }>();
  const { getCertificateByVerificationCode } = useCertificates();
  const [certificate, setCertificate] = useState<CertificateWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyCertificate() {
      if (!code) {
        setError("Código de verificação não fornecido");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getCertificateByVerificationCode(code);
        if (result) {
          setCertificate(result);
          setIsValid(result.status === 'active');
        } else {
          setError("Certificado não encontrado ou inválido");
        }
      } catch (err) {
        setError("Erro ao verificar certificado");
      } finally {
        setIsLoading(false);
      }
    }

    verifyCertificate();
  }, [code, getCertificateByVerificationCode]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando certificado...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-xl font-bold mb-2">Certificado Não Encontrado</h1>
            <p className="text-muted-foreground mb-6">
              {error || "O código de verificação informado não corresponde a nenhum certificado válido."}
            </p>
            <Link to="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Início
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
            <Award className="w-6 h-6" />
            Gameia
          </Link>
          <Badge variant="outline" className="gap-1">
            <Shield className="w-3 h-3" />
            Verificação Oficial
          </Badge>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Status Banner */}
          <div className={`p-4 rounded-xl flex items-center gap-4 ${
            isValid 
              ? "bg-green-500/10 border border-green-500/20" 
              : "bg-amber-500/10 border border-amber-500/20"
          }`}>
            {isValid ? (
              <>
                <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-green-600 dark:text-green-400">
                    Certificado Válido
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Este certificado é autêntico e foi emitido pela plataforma Gameia.
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircle className="w-8 h-8 text-amber-500 flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-amber-600 dark:text-amber-400">
                    Certificado Expirado
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Este certificado não está mais válido.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Certificate Card */}
          <Card className="overflow-hidden">
            <div 
              className="h-32 relative"
              style={{
                background: `linear-gradient(135deg, ${certificate.training?.color || '#3b82f6'}30, ${certificate.training?.color || '#3b82f6'}60)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">{certificate.training?.icon || "🏆"}</span>
              </div>
              <div className="absolute top-4 right-4">
                <Badge className="bg-background/80 text-foreground">
                  <Shield className="w-3 h-3 mr-1" />
                  Verificado
                </Badge>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* Certificate Title */}
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-1">
                  {certificate.metadata?.certificate_name || certificate.training?.name}
                </h1>
                <p className="text-muted-foreground">
                  Certificado de Conclusão
                </p>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Holder */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                    Certificado para
                  </p>
                  <p className="font-medium text-lg">
                    Titular do Certificado
                  </p>
                </div>

                {/* Organization */}
                {certificate.organization_name && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide flex items-center gap-1">
                      <Building className="w-3 h-3" />
                      Organização
                    </p>
                    <p className="font-medium">{certificate.organization_name}</p>
                  </div>
                )}

                {/* Training */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Treinamento
                  </p>
                  <p className="font-medium">{certificate.training?.name}</p>
                </div>

                {/* Score */}
                {certificate.final_score && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Score Final
                    </p>
                    <p className="font-medium text-lg">{certificate.final_score}%</p>
                  </div>
                )}

                {/* Issue Date */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Data de Emissão
                  </p>
                  <p className="font-medium">
                    {format(new Date(certificate.issued_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>

                {/* Expiry Date */}
                {certificate.expires_at && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                      Válido até
                    </p>
                    <p className="font-medium">
                      {format(new Date(certificate.expires_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {certificate.skills.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">
                      Competências Validadas
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {certificate.skills.map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="px-3 py-1.5">
                          <span className="mr-1.5">{skill.icon}</span>
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Verification Code */}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">
                  Código de Verificação
                </p>
                <code className="text-lg font-mono font-bold tracking-wider">
                  {certificate.verification_code}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Este certificado foi emitido pela plataforma <strong>Gameia</strong> e pode ser verificado a qualquer momento através deste link.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

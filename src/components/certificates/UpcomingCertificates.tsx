/**
 * UpcomingCertificates - Seção "Próximos Certificados"
 * Mostra certificados que o usuário está próximo de conquistar
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, ArrowRight, BookOpen, Route, Star, Medal, Target, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCertificateProgress, type UpcomingCertificate } from "@/hooks/useCertificateProgress";
import { Skeleton } from "@/components/ui/skeleton";

const TYPE_ICONS = {
  training: BookOpen,
  journey: Route,
  skill: Star,
  level: Medal,
  behavioral: Users,
};

// Fallback mock data when no real data exists
const FALLBACK_UPCOMING: UpcomingCertificate[] = [
  {
    id: "mock-1",
    name: "Mestre em Comunicação",
    type: "skill",
    progress: 75,
    remainingCriteria: ["Completar 1 treinamento", "Nota mínima 80%"],
    actionLabel: "Ver treinamentos",
    actionPath: "/app/development?tab=trainings",
  },
  {
    id: "mock-2", 
    name: "Jornada Vendas Iniciante",
    type: "journey",
    progress: 60,
    remainingCriteria: ["Completar módulo 3", "Passar no quiz final"],
    actionLabel: "Continuar jornada",
    actionPath: "/app/development?tab=journeys",
  },
];

export function UpcomingCertificates() {
  const navigate = useNavigate();
  const { upcomingCertificates, isLoading } = useCertificateProgress();

  // Use real data or fallback
  const certificates = upcomingCertificates.length > 0 ? upcomingCertificates : FALLBACK_UPCOMING;

  if (isLoading) {
    return (
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    );
  }

  if (certificates.length === 0) {
    return null;
  }

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Próximos Certificados
          <Badge variant="secondary" className="ml-auto">
            {certificates.length} disponíveis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {certificates.map((cert) => {
          const TypeIcon = TYPE_ICONS[cert.type as keyof typeof TYPE_ICONS] || Award;
          
          return (
            <div 
              key={cert.id}
              className="bg-background rounded-lg p-4 border border-border/50 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <TypeIcon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-foreground">{cert.name}</h4>
                    <p className="text-xs text-muted-foreground capitalize">{cert.type}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {cert.progress}%
                </Badge>
              </div>

              <Progress value={cert.progress} className="h-2" />

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Falta: {cert.remainingCriteria[0]}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => navigate(cert.actionPath)}
                >
                  {cert.actionLabel}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

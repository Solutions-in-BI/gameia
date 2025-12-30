/**
 * UpcomingCertificates - Seção "Próximos Certificados"
 * Mostra certificados que o usuário está próximo de conquistar
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Award, ArrowRight, BookOpen, Route, Star, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock data - será substituído por dados reais do hook
const UPCOMING_CERTIFICATES = [
  {
    id: "1",
    name: "Mestre em Comunicação",
    type: "skill",
    progress: 75,
    remainingCriteria: ["Completar 1 treinamento", "Nota mínima 80%"],
    actionLabel: "Ver treinamentos",
    actionPath: "/app/trainings",
  },
  {
    id: "2", 
    name: "Jornada Vendas Iniciante",
    type: "journey",
    progress: 60,
    remainingCriteria: ["Completar módulo 3", "Passar no quiz final"],
    actionLabel: "Continuar jornada",
    actionPath: "/app/caminho",
  },
];

const TYPE_ICONS = {
  training: BookOpen,
  journey: Route,
  skill: Star,
  level: Award,
  behavioral: Target,
};

export function UpcomingCertificates() {
  const navigate = useNavigate();

  if (UPCOMING_CERTIFICATES.length === 0) {
    return null;
  }

  return (
    <Card className="border-dashed border-primary/30 bg-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          Próximos Certificados
          <Badge variant="secondary" className="ml-auto">
            {UPCOMING_CERTIFICATES.length} disponíveis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {UPCOMING_CERTIFICATES.map((cert) => {
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

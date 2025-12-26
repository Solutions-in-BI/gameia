/**
 * Seção: Orientação de Caminho
 * GPS profissional inteligente
 */

import { motion } from "framer-motion";
import { 
  Compass, 
  Map, 
  Flag, 
  ArrowRight,
  CheckCircle2,
  Circle,
  Lock,
  Sparkles,
  TrendingUp,
  Target
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSkillTree, SkillWithProgress } from "@/hooks/useSkillTree";
import { cn } from "@/lib/utils";

export function GuidanceSection() {
  const { isAuthenticated } = useAuth();
  const { skills, unlockSkill } = useSkillTree();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
          <Compass className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">
          Seu GPS Profissional
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Faça login para descobrir seu caminho personalizado de desenvolvimento profissional.
        </p>
        <button className="btn-primary-gameia">
          Começar agora
        </button>
      </div>
    );
  }

  // Próximas skills recomendadas (não desbloqueadas mas com pai desbloqueado)
  const recommendedSkills = skills
    .flatMap(s => [s, ...s.children])
    .filter(s => !s.isUnlocked && (!s.parent_skill_id || 
      skills.some(parent => parent.id === s.parent_skill_id && parent.isUnlocked)))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-1">
          Orientação de Carreira
        </h1>
        <p className="text-muted-foreground">
          Descubra seu caminho e os próximos passos para evoluir
        </p>
      </div>

      {/* Caminho Atual */}
      <div className="gameia-card p-6 bg-gradient-to-r from-accent/5 to-transparent border-accent/20">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Map className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="font-display font-bold text-foreground text-lg">
              Seu Caminho Atual
            </h2>
            <p className="text-sm text-muted-foreground">
              Baseado nas suas competências demonstradas
            </p>
          </div>
        </div>

        {/* Path Visualization */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
          
          <div className="space-y-6">
            <PathStep 
              status="completed"
              title="Fundamentos"
              description="Conceitos básicos de gestão e negócios"
              skills={["Comunicação", "Organização"]}
            />
            <PathStep 
              status="current"
              title="Especialização"
              description="Aprofundamento em áreas específicas"
              skills={["Marketing Digital", "Gestão de Projetos"]}
            />
            <PathStep 
              status="locked"
              title="Liderança"
              description="Habilidades avançadas de gestão de equipes"
              skills={["Tomada de Decisão", "Negociação"]}
            />
            <PathStep 
              status="locked"
              title="Maestria"
              description="Domínio completo das competências"
              skills={["Estratégia", "Inovação"]}
            />
          </div>
        </div>
      </div>

      {/* Próximos Passos Recomendados */}
      <div className="gameia-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-foreground">
            Próximos Passos Recomendados
          </h2>
        </div>

        {recommendedSkills.length > 0 ? (
          <div className="grid gap-4">
            {recommendedSkills.map((skill, index) => (
              <RecommendedSkillCard 
                key={skill.id}
                skill={skill}
                index={index}
                onUnlock={() => unlockSkill(skill.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Complete mais atividades para desbloquear novas recomendações
            </p>
          </div>
        )}
      </div>

      {/* Árvore de Habilidades Resumida */}
      <div className="gameia-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-secondary" />
            <h2 className="font-display font-bold text-foreground">
              Mapa de Habilidades
            </h2>
          </div>
          <span className="text-sm text-muted-foreground">
            {skills.filter(s => s.isUnlocked).length} de {skills.length} ativas
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {skills.map(skill => (
            <SkillMiniCard key={skill.id} skill={skill} />
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="grid sm:grid-cols-2 gap-4">
        <InsightCard 
          icon={TrendingUp}
          title="Seu Ponto Forte"
          description="Marketing Digital"
          detail="85% de acurácia nas questões"
          color="secondary"
        />
        <InsightCard 
          icon={Target}
          title="Área de Foco"
          description="Gestão de Projetos"
          detail="Recomendamos mais prática"
          color="accent"
        />
      </div>
    </div>
  );
}

interface PathStepProps {
  status: "completed" | "current" | "locked";
  title: string;
  description: string;
  skills: string[];
}

function PathStep({ status, title, description, skills }: PathStepProps) {
  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      iconColor: "text-secondary",
      bgColor: "bg-secondary/10",
      borderColor: "border-secondary/30",
    },
    current: {
      icon: Circle,
      iconColor: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30",
    },
    locked: {
      icon: Lock,
      iconColor: "text-muted-foreground",
      bgColor: "bg-muted",
      borderColor: "border-border",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="relative pl-12">
      <div className={cn(
        "absolute left-4 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center z-10",
        config.bgColor
      )}>
        <Icon className={cn("w-3 h-3", config.iconColor)} />
      </div>

      <div className={cn(
        "p-4 rounded-xl border transition-all",
        config.borderColor,
        status === "current" && "bg-primary/5"
      )}>
        <div className="flex items-center gap-2 mb-1">
          <h3 className={cn(
            "font-semibold",
            status === "locked" ? "text-muted-foreground" : "text-foreground"
          )}>
            {title}
          </h3>
          {status === "current" && (
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
              Atual
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-2">{description}</p>
        <div className="flex flex-wrap gap-1">
          {skills.map(skill => (
            <span 
              key={skill}
              className="px-2 py-0.5 bg-muted text-xs text-muted-foreground rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

interface RecommendedSkillCardProps {
  skill: SkillWithProgress;
  index: number;
  onUnlock: () => void;
}

function RecommendedSkillCard({ skill, index, onUnlock }: RecommendedSkillCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
    >
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
        {skill.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-foreground">{skill.name}</h4>
        <p className="text-sm text-muted-foreground truncate">
          {skill.description || `${skill.xp_required} XP necessários`}
        </p>
      </div>
      <button
        onClick={onUnlock}
        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
      >
        Desbloquear
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

interface SkillMiniCardProps {
  skill: SkillWithProgress;
}

function SkillMiniCard({ skill }: SkillMiniCardProps) {
  return (
    <div className={cn(
      "p-3 rounded-xl border text-center transition-all",
      skill.isUnlocked
        ? "bg-card border-primary/20"
        : "bg-muted/30 border-border opacity-50"
    )}>
      <div className="text-2xl mb-1">{skill.icon}</div>
      <div className="text-xs font-medium text-foreground truncate">{skill.name}</div>
      {skill.isUnlocked && (
        <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full"
            style={{ width: `${skill.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface InsightCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  detail: string;
  color: "primary" | "secondary" | "accent";
}

function InsightCard({ icon: Icon, title, description, detail, color }: InsightCardProps) {
  const colorClasses = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    accent: "text-accent bg-accent/10",
  };

  return (
    <div className="stat-card-gameia">
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
        colorClasses[color]
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-sm text-muted-foreground mb-1">{title}</div>
      <div className="text-lg font-display font-bold text-foreground mb-1">{description}</div>
      <div className="text-xs text-muted-foreground">{detail}</div>
    </div>
  );
}
/**
 * Modal de detalhes de uma skill
 * Com CTAs para ação direta (jogos, treinamentos)
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, TrendingUp, Clock, Gamepad2, Star, 
  CheckCircle2, XCircle, ChevronRight, Play,
  GraduationCap, ArrowRight, Route
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SkillWithProgress } from "@/hooks/useSkillProgress";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SkillEvent {
  id: string;
  event_type: string;
  old_value: any;
  new_value: any;
  source_type: string;
  created_at: string;
}

interface SkillDetailModalProps {
  skill: SkillWithProgress | null;
  isOpen: boolean;
  onClose: () => void;
}

const GAME_LABELS: Record<string, string> = {
  quiz: "Quiz",
  sales: "Simulador de Vendas",
  cold_outreach: "Cold Outreach",
  decisions: "Decisões",
  memory: "Memória",
  snake: "Snake",
  dino: "Dino",
  tetris: "Tetris",
};

export function SkillDetailModal({ skill, isOpen, onClose }: SkillDetailModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [history, setHistory] = useState<SkillEvent[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (isOpen && skill && user) {
      fetchHistory();
    }
  }, [isOpen, skill, user]);

  const fetchHistory = async () => {
    if (!skill || !user) return;
    setLoadingHistory(true);
    try {
      const { data } = await supabase
        .from("skill_events_log")
        .select("*")
        .eq("user_id", user.id)
        .eq("skill_id", skill.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setHistory((data || []) as SkillEvent[]);
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  if (!skill) return null;

  const level = skill.userProgress?.current_level || 1;
  const currentXp = skill.userProgress?.current_xp || 0;
  const totalXp = skill.userProgress?.total_xp || 0;
  const mastery = skill.userProgress?.mastery_level || 0;
  const isUnlocked = skill.userProgress?.is_unlocked || skill.is_unlocked_by_default;
  const xpToNext = skill.xp_per_level - currentXp;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        {/* Header with gradient */}
        <div 
          className="p-6 pb-4"
          style={{
            background: `linear-gradient(135deg, ${skill.color || 'hsl(var(--primary))'} 0%, transparent 100%)`,
          }}
        >
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl">{skill.icon || "🎯"}</div>
                <div>
                  <DialogTitle className="text-xl">{skill.name}</DialogTitle>
                  {skill.category && (
                    <Badge variant="secondary" className="mt-1">
                      {skill.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <ScrollArea className="max-h-[60vh]">
          <div className="p-6 pt-2 space-y-6">
            {/* Description */}
            {skill.description && (
              <p className="text-sm text-muted-foreground">{skill.description}</p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold">{level}</p>
                <p className="text-xs text-muted-foreground">Nível</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-4 h-4",
                        i < mastery ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Maestria</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold">{totalXp.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">XP Total</p>
              </div>
            </div>

            {/* Progress to next level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso para nível {level + 1}</span>
                <span className="font-medium">{currentXp}/{skill.xp_per_level} XP</span>
              </div>
              <Progress value={skill.progressPercent} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">
                Faltam {xpToNext} XP
              </p>
            </div>

            {/* ACTION CTAs - Para evoluir esta skill */}
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Para evoluir esta skill
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {/* Go to Arena for related games */}
                {skill.related_games && skill.related_games.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="justify-start gap-2 h-auto py-2"
                    onClick={() => {
                      onClose();
                      navigate("/app?tab=arena");
                    }}
                  >
                    <Gamepad2 className="w-4 h-4 text-purple-500" />
                    <div className="text-left">
                      <p className="font-medium">Jogar na Arena</p>
                      <p className="text-xs text-muted-foreground">
                        {skill.related_games.map(g => GAME_LABELS[g] || g).slice(0, 2).join(", ")}
                        {skill.related_games.length > 2 && ` +${skill.related_games.length - 2}`}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                )}
                
                {/* Go to Development for trainings */}
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start gap-2 h-auto py-2"
                  onClick={() => {
                    onClose();
                    navigate("/app?tab=development");
                  }}
                >
                  <GraduationCap className="w-4 h-4 text-blue-500" />
                  <div className="text-left">
                    <p className="font-medium">Fazer Treinamento</p>
                    <p className="text-xs text-muted-foreground">Jornadas e cursos estruturados</p>
                  </div>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </Button>
              </div>
            </div>

            {/* Related Games (collapsed view) */}
            {skill.related_games && skill.related_games.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Gamepad2 className="w-4 h-4" />
                  Jogos que desenvolvem esta skill
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skill.related_games.map((game) => (
                    <Badge key={game} variant="outline">
                      {GAME_LABELS[game] || game}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Histórico Recente
              </h4>
              {loadingHistory ? (
                <div className="text-sm text-muted-foreground">Carregando...</div>
              ) : history.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Nenhuma atividade registrada ainda.
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((event) => (
                    <HistoryItem key={event.id} event={event} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function HistoryItem({ event }: { event: SkillEvent }) {
  const getEventIcon = () => {
    switch (event.event_type) {
      case "level_up":
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case "xp_earned":
        return <Star className="w-4 h-4 text-amber-400" />;
      case "skill_unlocked":
        return <CheckCircle2 className="w-4 h-4 text-cyan-400" />;
      default:
        return <ChevronRight className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getEventText = () => {
    switch (event.event_type) {
      case "level_up":
        return `Subiu para nível ${event.new_value?.level}`;
      case "xp_earned":
        return `Ganhou ${event.new_value?.xp_earned} XP`;
      case "skill_unlocked":
        return "Skill desbloqueada";
      default:
        return event.event_type;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/20 text-sm">
      {getEventIcon()}
      <span className="flex-1">{getEventText()}</span>
      <span className="text-xs text-muted-foreground">{formatDate(event.created_at)}</span>
    </div>
  );
}

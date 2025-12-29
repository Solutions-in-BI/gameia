import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  History, Filter, Gamepad2, BookOpen, Brain, 
  Target, Award, MessageSquare, Star 
} from "lucide-react";
import { useActivities, Activity } from "@/hooks/useActivities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ACTIVITY_TYPES = [
  { value: "all", label: "Todos" },
  { value: "game", label: "Jogos" },
  { value: "training", label: "Treinamentos" },
  { value: "test", label: "Testes" },
  { value: "achievement", label: "Conquistas" },
  { value: "commitment", label: "Compromissos" },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "game_completed":
    case "game_started":
      return <Gamepad2 className="h-4 w-4" />;
    case "training_completed":
    case "training_started":
      return <BookOpen className="h-4 w-4" />;
    case "test_completed":
    case "cognitive_test":
      return <Brain className="h-4 w-4" />;
    case "achievement_unlocked":
    case "badge_earned":
      return <Award className="h-4 w-4" />;
    case "commitment_joined":
    case "commitment_completed":
      return <Target className="h-4 w-4" />;
    case "feedback_received":
    case "assessment_completed":
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <Star className="h-4 w-4" />;
  }
};

const getActivityColor = (type: string) => {
  if (type.includes("game")) return "text-primary bg-primary/10";
  if (type.includes("training")) return "text-secondary bg-secondary/10";
  if (type.includes("test") || type.includes("cognitive")) return "text-accent bg-accent/10";
  if (type.includes("achievement") || type.includes("badge")) return "text-yellow-500 bg-yellow-500/10";
  if (type.includes("commitment")) return "text-gameia-success bg-gameia-success/10";
  return "text-muted-foreground bg-muted";
};

export function HistoryTab() {
  const { activities, isLoading, getActivityLabel } = useActivities();
  const [filter, setFilter] = useState("all");

  const filteredActivities = useMemo(() => {
    if (filter === "all") return activities;
    return activities.filter(a => {
      if (filter === "game") return a.type.includes("game");
      if (filter === "training") return a.type.includes("training");
      if (filter === "test") return a.type.includes("test") || a.type.includes("cognitive");
      if (filter === "achievement") return a.type.includes("achievement") || a.type.includes("badge");
      if (filter === "commitment") return a.type.includes("commitment");
      return true;
    });
  }, [activities, filter]);

  // Group by date
  const groupedActivities = useMemo(() => {
    const groups: Record<string, Activity[]> = {};
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long"
      });
      if (!groups[date]) groups[date] = [];
      groups[date].push(activity);
    });
    
    return groups;
  }, [filteredActivities]);

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="surface p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Linha do Tempo</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filtrar" />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPES.map(type => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className="surface p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-4">Carregando histórico...</p>
        </div>
      ) : Object.keys(groupedActivities).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3 capitalize">
                {date}
              </h4>
              
              <div className="surface divide-y divide-border">
                {dateActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 flex items-start gap-4"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{getActivityLabel(activity.type)}</p>
                      {activity.data && Object.keys(activity.data).length > 0 && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {activity.data.game || activity.data.training || activity.data.test || ""}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.created_at).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {activity.xp_earned && activity.xp_earned > 0 && (
                        <Badge variant="outline" className="text-xs text-primary">
                          +{activity.xp_earned} XP
                        </Badge>
                      )}
                      {activity.coins_earned && activity.coins_earned > 0 && (
                        <Badge variant="outline" className="text-xs text-yellow-500">
                          +{activity.coins_earned} 🪙
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhuma atividade ainda</p>
          <p className="text-sm text-muted-foreground mt-1">
            Jogue e participe para criar seu histórico!
          </p>
        </div>
      )}
    </div>
  );
}

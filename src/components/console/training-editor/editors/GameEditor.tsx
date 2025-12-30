import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Gamepad2,
  Target,
  HelpCircle,
  Users,
  Zap,
  TrendingUp,
  Loader2,
} from "lucide-react";
import type { TrainingModule } from "@/hooks/useTrainingEditor";

interface GameConfig {
  game_type: string;
  display_name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
}

const GAME_ICONS: Record<string, React.ElementType> = {
  sales_challenge: Target,
  quiz_battle: HelpCircle,
  team_challenge: Users,
  speed_quiz: Zap,
  skill_duel: TrendingUp,
};

interface GameEditorProps {
  module: TrainingModule;
  onChange: (data: Partial<TrainingModule>) => void;
}

export function GameEditor({ module, onChange }: GameEditorProps) {
  const [games, setGames] = useState<GameConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const gameConfig = (module.game_config || {}) as { 
    game_type?: string; 
    min_score?: number;
    difficulty?: string;
    time_limit?: number;
  };
  
  const selectedGame = gameConfig.game_type;
  const minScore = gameConfig.min_score || 70;

  useEffect(() => {
    async function fetchGames() {
      const { data, error } = await supabase
        .from("game_configurations")
        .select("game_type, display_name, description, icon, is_active")
        .eq("is_active", true)
        .order("display_name");

      if (!error && data) {
        setGames(data);
      }
      setIsLoading(false);
    }

    fetchGames();
  }, []);

  const handleSelectGame = (gameType: string) => {
    onChange({
      game_config: {
        ...gameConfig,
        game_type: gameType,
      },
    });
  };

  const handleMinScoreChange = (value: number) => {
    onChange({
      game_config: {
        ...gameConfig,
        min_score: value,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Game Selection */}
      <div className="space-y-3">
        <Label>Selecione um Jogo da Arena</Label>
        
        {games.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Gamepad2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum jogo disponível</p>
              <p className="text-sm">Configure jogos na Arena primeiro</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {games.map((game) => {
              const Icon = GAME_ICONS[game.game_type] || Gamepad2;
              const isSelected = selectedGame === game.game_type;

              return (
                <Card
                  key={game.game_type}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    isSelected && "ring-2 ring-primary border-primary"
                  )}
                  onClick={() => handleSelectGame(game.game_type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {game.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {game.description || "Jogo da Arena"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Game Configuration */}
      {selectedGame && (
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-sm">Configuração do Jogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Minimum Score */}
            <div className="space-y-3">
              <Label>Score Mínimo para Aprovação</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[minScore]}
                  onValueChange={([value]) => handleMinScoreChange(value)}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <Badge variant="secondary" className="min-w-[50px] justify-center">
                  {minScore}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                O usuário precisa atingir este score para avançar no treinamento
              </p>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <div className="flex gap-2">
                {["easy", "medium", "hard"].map((diff) => (
                  <Badge
                    key={diff}
                    variant={gameConfig.difficulty === diff ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      onChange({
                        game_config: { ...gameConfig, difficulty: diff },
                      })
                    }
                  >
                    {diff === "easy" ? "Fácil" : diff === "medium" ? "Médio" : "Difícil"}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Time Limit */}
            <div className="space-y-2">
              <Label>Tempo Limite (minutos)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={gameConfig.time_limit || 10}
                onChange={(e) =>
                  onChange({
                    game_config: {
                      ...gameConfig,
                      time_limit: parseInt(e.target.value) || 10,
                    },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

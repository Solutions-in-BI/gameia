import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Gamepad2, 
  Layers, 
  Gift, 
  Building2, 
  Settings2,
  Check,
  X,
  Star,
  Sparkles
} from "lucide-react";
import { useGameConfig, type MergedGameConfig } from "@/hooks/useGameConfig";
import { BaseConfigLayer, RewardsConfigLayer, OrgConfigLayer, AdvancedConfigLayer } from "./layers";
import { useNavigate } from "react-router-dom";

interface GameConfigurationHubProps {
  onBack?: () => void;
}

const GAME_ICONS: Record<string, string> = {
  memory: "🧠",
  snake: "🐍",
  dino: "🦖",
  tetris: "🧱",
  quiz: "❓",
  sales: "💼",
  decisions: "🎯",
  scenario: "📊",
};

export function GameConfigurationHub({ onBack }: GameConfigurationHubProps) {
  const navigate = useNavigate();
  const { 
    games, 
    isLoading, 
    isSaving,
    getMergedConfig, 
    getAllMergedConfigs,
    updateBaseConfig,
    updateOrgOverride,
    resetOrgOverrides,
  } = useGameConfig();

  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("base");
  const [pendingChanges, setPendingChanges] = useState<Partial<MergedGameConfig>>({});

  const mergedConfigs = getAllMergedConfigs();
  const currentConfig = selectedGame ? getMergedConfig(selectedGame) : null;

  const handleSelectGame = (gameType: string) => {
    setSelectedGame(gameType);
    setActiveTab("base");
    setPendingChanges({});
  };

  const handleBackToList = () => {
    setSelectedGame(null);
    setPendingChanges({});
  };

  const handleBaseChange = (updates: Partial<MergedGameConfig>) => {
    setPendingChanges(prev => ({ ...prev, ...updates }));
  };

  const handleSaveBase = async () => {
    if (!selectedGame || Object.keys(pendingChanges).length === 0) return;
    await updateBaseConfig(selectedGame, pendingChanges);
    setPendingChanges({});
  };

  const handleOrgOverrideChange = async (updates: any) => {
    if (!selectedGame) return;
    await updateOrgOverride(selectedGame, updates);
  };

  const handleAdvancedChange = async (updates: Record<string, any>) => {
    if (!selectedGame) return;
    await updateOrgOverride(selectedGame, { advanced_config_override: updates });
  };

  const handleResetOverrides = async () => {
    if (!selectedGame) return;
    await resetOrgOverrides(selectedGame);
  };

  const navigateToSalesConfig = () => {
    navigate("/console?section=salesGame");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Game List View
  if (!selectedGame) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Gamepad2 className="h-6 w-6" />
                Configuração de Jogos
              </h2>
              <p className="text-muted-foreground">
                Configure recompensas, dificuldade e comportamento dos jogos
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mergedConfigs.map((game) => (
            <motion.div
              key={game.game_type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !game.effectiveIsActive ? "opacity-60" : ""
                } ${game.hasOverrides ? "ring-2 ring-primary/30" : ""}`}
                onClick={() => handleSelectGame(game.game_type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {GAME_ICONS[game.game_type] || "🎮"}
                      </span>
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {game.display_name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {game.game_type}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      {game.effectiveIsActive ? (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                          <Check className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30">
                          <X className="h-3 w-3 mr-1" />
                          Inativo
                        </Badge>
                      )}
                      
                      {game.hasOverrides && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          <Star className="h-3 w-3 mr-1" />
                          Customizado
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                      <span>{game.effectiveXpBase} XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>🪙</span>
                      <span>{game.effectiveCoinsBase}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {game.effectiveVisibility === "required" && "🔴 Obrigatório"}
                      {game.effectiveVisibility === "recommended" && "🟡 Recomendado"}
                      {game.effectiveVisibility === "optional" && "🟢 Livre"}
                      {game.effectiveVisibility === "hidden" && "⚫ Oculto"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Game Editor View
  const mergedConfig = { ...currentConfig!, ...pendingChanges } as MergedGameConfig;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={handleBackToList}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {GAME_ICONS[selectedGame] || "🎮"}
            </span>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {currentConfig?.display_name}
              </h2>
              <p className="text-sm text-muted-foreground">
                Configurar jogo em camadas
              </p>
            </div>
          </div>
        </div>

        {Object.keys(pendingChanges).length > 0 && (
          <Button onClick={handleSaveBase} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="base" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span className="hidden sm:inline">Base</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Recompensas</span>
          </TabsTrigger>
          <TabsTrigger value="org" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Empresa</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Avançado</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="mt-6"
          >
            <TabsContent value="base" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <BaseConfigLayer
                    config={mergedConfig}
                    onChange={handleBaseChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rewards" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <RewardsConfigLayer
                    config={mergedConfig}
                    onChange={handleBaseChange}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="org" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <OrgConfigLayer
                    config={mergedConfig}
                    onOverrideChange={handleOrgOverrideChange}
                    onReset={handleResetOverrides}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="advanced" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <AdvancedConfigLayer
                    config={mergedConfig}
                    onAdvancedChange={handleAdvancedChange}
                    onNavigateToFullConfig={
                      selectedGame === "sales" ? navigateToSalesConfig : undefined
                    }
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
}

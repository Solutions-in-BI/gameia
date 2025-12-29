import { useState, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Settings2, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SalesAdvancedConfig } from "../advanced/SalesAdvancedConfig";
import { QuizAdvancedConfig } from "../advanced/QuizAdvancedConfig";
import { DecisionsAdvancedConfig } from "../advanced/DecisionsAdvancedConfig";
import type { MergedGameConfig } from "@/hooks/useGameConfig";

interface AdvancedConfigLayerProps {
  config: MergedGameConfig;
  onAdvancedChange: (updates: Record<string, any>) => void;
  onNavigateToFullConfig?: () => void;
  readonly?: boolean;
}

export const AdvancedConfigLayer = forwardRef<HTMLDivElement, AdvancedConfigLayerProps>(
  function AdvancedConfigLayer({ config, onAdvancedChange, onNavigateToFullConfig, readonly }, ref) {
    const [isExpanded, setIsExpanded] = useState(true);
    const advancedConfig = config.effectiveAdvancedConfig || {};

    const handleChange = (key: string, value: any) => {
      onAdvancedChange({ ...advancedConfig, [key]: value });
    };

    const renderGameSpecificConfig = () => {
      switch (config.game_type) {
        case "sales":
          return (
            <SalesAdvancedConfig
              config={advancedConfig}
              onChange={handleChange}
              readonly={readonly}
            />
          );
        
        case "quiz":
          return (
            <QuizAdvancedConfig
              config={advancedConfig}
              onChange={handleChange}
              readonly={readonly}
            />
          );
        
        case "decisions":
        case "scenario":
          return (
            <DecisionsAdvancedConfig
              config={advancedConfig}
              onChange={handleChange}
              readonly={readonly}
            />
          );
        
        default:
          return (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Settings2 className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Este jogo usa configurações padrão.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Configuração avançada em breve!
                </p>
              </CardContent>
            </Card>
          );
      }
    };

    const hasFullConfigScreen = ["sales"].includes(config.game_type);

    return (
      <div ref={ref} className="space-y-4">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 hover:bg-transparent">
                <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Settings2 className="h-4 w-4" />
                  Configuração Avançada
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </h4>
              </Button>
            </CollapsibleTrigger>

            {hasFullConfigScreen && onNavigateToFullConfig && (
              <Button variant="outline" size="sm" onClick={onNavigateToFullConfig}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Configuração Completa
              </Button>
            )}
          </div>

          <CollapsibleContent className="mt-4">
            {renderGameSpecificConfig()}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }
);

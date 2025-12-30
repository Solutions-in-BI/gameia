/**
 * LinkedEntitiesSelect - Multi-select para vincular treinamentos, jogos, desafios às metas
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { Check, X, BookOpen, Gamepad2, Trophy, Brain, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type EntityType = "training" | "challenge" | "cognitive_test" | "game";

interface Entity {
  id: string;
  name: string;
  type: EntityType;
}

const ENTITY_CONFIG = {
  training: {
    icon: BookOpen,
    label: "Treinamentos",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  challenge: {
    icon: Trophy,
    label: "Desafios",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  cognitive_test: {
    icon: Brain,
    label: "Testes Cognitivos",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  game: {
    icon: Gamepad2,
    label: "Jogos",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
};

interface LinkedEntitiesSelectProps {
  entityType: EntityType;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  skillId?: string;
  disabled?: boolean;
  placeholder?: string;
}

export function LinkedEntitiesSelect({
  entityType,
  selectedIds,
  onChange,
  skillId,
  disabled,
  placeholder,
}: LinkedEntitiesSelectProps) {
  const [open, setOpen] = useState(false);
  const { currentOrg } = useOrganization();
  const config = ENTITY_CONFIG[entityType];
  const Icon = config.icon;

  // Buscar entidades disponíveis
  const { data: entities = [], isLoading } = useQuery({
    queryKey: ["linked-entities", entityType, currentOrg?.id, skillId],
    queryFn: async (): Promise<Entity[]> => {
      switch (entityType) {
        case "training": {
          let query = supabase
            .from("trainings")
            .select("id, name")
            .eq("organization_id", currentOrg?.id || "")
            .eq("is_active", true);
          
          if (skillId) {
            query = query.contains("skill_ids", [skillId]);
          }
          
          const { data, error } = await query;
          if (error) throw error;
          return (data || []).map((item: { id: string; name: string }) => ({
            id: item.id,
            name: item.name,
            type: "training" as EntityType,
          }));
        }

        case "challenge": {
          const { data, error } = await supabase
            .from("commitments")
            .select("id, name")
            .eq("organization_id", currentOrg?.id || "")
            .in("status", ["active", "draft"]);
          
          if (error) throw error;
          return (data || []).map((item: { id: string; name: string }) => ({
            id: item.id,
            name: item.name,
            type: "challenge" as EntityType,
          }));
        }

        case "cognitive_test": {
          const { data, error } = await supabase
            .from("cognitive_tests")
            .select("id, name")
            .eq("is_active", true);
          
          if (error) throw error;
          return (data || []).map((item: { id: string; name: string }) => ({
            id: item.id,
            name: item.name,
            type: "cognitive_test" as EntityType,
          }));
        }

        case "game":
          // Jogos são pré-definidos no sistema
          return [
            { id: "negotiation_arena", name: "Arena de Negociação", type: "game" as EntityType },
            { id: "prioritization_game", name: "Jogo de Priorização", type: "game" as EntityType },
            { id: "memory_match", name: "Memory Match", type: "game" as EntityType },
            { id: "sales_pitch", name: "Sales Pitch", type: "game" as EntityType },
            { id: "decision_maker", name: "Decision Maker", type: "game" as EntityType },
          ];

        default:
          return [];
      }
    },
    enabled: !!currentOrg?.id || entityType === "game",
  });

  const selectedEntities = entities.filter((e) => selectedIds.includes(e.id));

  const handleSelect = (entityId: string) => {
    if (selectedIds.includes(entityId)) {
      onChange(selectedIds.filter((id) => id !== entityId));
    } else {
      onChange([...selectedIds, entityId]);
    }
  };

  const handleRemove = (entityId: string) => {
    onChange(selectedIds.filter((id) => id !== entityId));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn("h-4 w-4", config.color)} />
        <span>{config.label}</span>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className="w-full justify-start text-left font-normal"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : selectedIds.length > 0 ? (
              <span>{selectedIds.length} selecionado(s)</span>
            ) : (
              <span className="text-muted-foreground">
                {placeholder || `Selecionar ${config.label.toLowerCase()}...`}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder={`Buscar ${config.label.toLowerCase()}...`} />
            <CommandList>
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
              <CommandGroup>
                {entities.map((entity) => (
                  <CommandItem
                    key={entity.id}
                    value={entity.name}
                    onSelect={() => handleSelect(entity.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedIds.includes(entity.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {entity.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Tags dos selecionados */}
      {selectedEntities.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedEntities.map((entity) => (
            <Badge
              key={entity.id}
              variant="secondary"
              className={cn("gap-1 pr-1", config.bgColor)}
            >
              <span className="truncate max-w-[150px]">{entity.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(entity.id)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

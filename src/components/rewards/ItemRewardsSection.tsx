/**
 * ItemRewardsSection - Seção para configurar itens da loja como recompensa
 * Usado em CreateChallengeModal e TrainingWizard
 * Apenas itens específicos (não categorias)
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Plus,
  X,
  Gift,
  ShoppingBag,
  Package,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  useItemRewards, 
  type ItemRewardConfig,
  type ItemUnlockMode,
} from "@/hooks/useItemRewards";

interface ItemRewardsSectionProps {
  rewardItems: ItemRewardConfig[];
  setRewardItems: (items: ItemRewardConfig[]) => void;
  maxItems?: number;
}

export function ItemRewardsSection({
  rewardItems,
  setRewardItems,
  maxItems = 3,
}: ItemRewardsSectionProps) {
  const { getAvailableItems } = useItemRewards();
  const [availableItems, setAvailableItems] = useState<Array<{
    id: string;
    name: string;
    icon: string;
    category: string;
    price: number;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Carregar itens disponíveis
  useEffect(() => {
    async function loadItems() {
      setIsLoading(true);
      const items = await getAvailableItems();
      setAvailableItems(items);
      setIsLoading(false);
    }
    loadItems();
  }, [getAvailableItems]);

  const addRewardItem = () => {
    if (rewardItems.length >= maxItems) return;
    if (availableItems.length === 0) return;
    
    setRewardItems([
      ...rewardItems,
      {
        item_id: availableItems[0]?.id,
        unlock_mode: "auto_unlock",
      },
    ]);
  };

  const removeRewardItem = (index: number) => {
    setRewardItems(rewardItems.filter((_, i) => i !== index));
  };

  const updateRewardItem = (index: number, updates: Partial<ItemRewardConfig>) => {
    setRewardItems(
      rewardItems.map((item, i) =>
        i === index ? { ...item, ...updates } : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Gift className="w-3 h-3" />
          Itens da Loja como Recompensa
        </Label>
        {rewardItems.length < maxItems && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRewardItem}
            disabled={isLoading || availableItems.length === 0}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Item
          </Button>
        )}
      </div>

      {rewardItems.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-border rounded-lg">
          <Package className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Nenhum item configurado como recompensa
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addRewardItem}
            disabled={isLoading || availableItems.length === 0}
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Item
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {rewardItems.map((reward, index) => {
            const selectedItem = availableItems.find(i => i.id === reward.item_id);

            return (
              <Card key={index}>
                <CardContent className="p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      Item {index + 1}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeRewardItem(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Seleção de Item */}
                  <div className="space-y-2">
                    <Label className="text-sm">Item</Label>
                    <Select
                      value={reward.item_id || ""}
                      onValueChange={(value) => updateRewardItem(index, { item_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um item" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        {availableItems.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            <span className="flex items-center gap-2">
                              <span>{item.icon}</span>
                              <span>{item.name}</span>
                              <Badge variant="outline" className="ml-1 text-xs">
                                {item.category}
                              </Badge>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Modo de desbloqueio */}
                  <div className="space-y-2">
                    <Label className="text-sm">Modo de Entrega</Label>
                    <RadioGroup
                      value={reward.unlock_mode}
                      onValueChange={(value) => updateRewardItem(index, { unlock_mode: value as ItemUnlockMode })}
                      className="grid grid-cols-2 gap-3"
                    >
                      <label
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          reward.unlock_mode === "auto_unlock"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        <RadioGroupItem value="auto_unlock" />
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <div>
                            <p className="text-sm font-medium">Desbloqueio</p>
                            <p className="text-xs text-muted-foreground">
                              Vai direto ao inventário
                            </p>
                          </div>
                        </div>
                      </label>
                      <label
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          reward.unlock_mode === "enable_purchase"
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-border/80"
                        )}
                      >
                        <RadioGroupItem value="enable_purchase" />
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-4 h-4 text-amber-500" />
                          <div>
                            <p className="text-sm font-medium">Liberação</p>
                            <p className="text-xs text-muted-foreground">
                              Disponível na loja
                            </p>
                          </div>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Preview */}
                  <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs text-muted-foreground">
                      {reward.unlock_mode === "auto_unlock" ? (
                        <>
                          🎁 Ao completar, o usuário receberá o item{" "}
                          <strong>{selectedItem?.name || "selecionado"}</strong>{" "}
                          diretamente no inventário.
                        </>
                      ) : (
                        <>
                          🔓 Ao completar, o item{" "}
                          <strong>{selectedItem?.name || "selecionado"}</strong>{" "}
                          ficará disponível para compra na loja.
                        </>
                      )}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {rewardItems.length > 0 && rewardItems.length < maxItems && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          onClick={addRewardItem}
        >
          <Plus className="w-4 h-4 mr-1" />
          Adicionar Outro Item ({rewardItems.length}/{maxItems})
        </Button>
      )}
    </div>
  );
}

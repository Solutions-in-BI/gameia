import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Coins, Package, History, Check, Sparkles } from "lucide-react";
import { useMarketplace, InventoryItem } from "@/hooks/useMarketplace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ShopTab() {
  const { coins, inventory, items, equipItem, unequipItem, isLoading } = useMarketplace();
  const [activeTab, setActiveTab] = useState("inventory");

  const equippedItems = inventory.filter(i => i.is_equipped);
  
  // Get item details for inventory items
  const inventoryWithDetails = inventory.map(invItem => ({
    ...invItem,
    item: items.find(i => i.id === invItem.item_id)
  }));

  const handleToggleEquip = async (inventoryItem: InventoryItem) => {
    if (inventoryItem.is_equipped) {
      await unequipItem(inventoryItem.item_id);
    } else {
      await equipItem(inventoryItem.item_id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Moedas Display */}
      <div className="surface-elevated p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Coins className="h-6 w-6 text-yellow-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{coins.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Moedas disponíveis</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => window.location.href = "/app/marketplace"}>
          <ShoppingBag className="h-4 w-4 mr-2" />
          Ir para Loja
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="inventory" className="gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Inventário</span>
          </TabsTrigger>
          <TabsTrigger value="equipped" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Equipados</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Histórico</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="mt-4">
          {inventoryWithDetails.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {inventoryWithDetails.map((invItem, index) => (
                <motion.div
                  key={invItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`surface p-4 ${invItem.is_equipped ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">{invItem.item?.icon || "📦"}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{invItem.item?.name || "Item"}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {invItem.item?.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {invItem.item?.rarity || "comum"}
                        </Badge>
                        {invItem.is_equipped && (
                          <Badge className="text-xs bg-primary/20 text-primary border-0">
                            <Check className="h-3 w-3 mr-1" />
                            Equipado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant={invItem.is_equipped ? "outline" : "default"}
                    size="sm"
                    className="w-full mt-3"
                    onClick={() => handleToggleEquip(invItem)}
                  >
                    {invItem.is_equipped ? "Desequipar" : "Equipar"}
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="surface p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Seu inventário está vazio</p>
              <p className="text-sm text-muted-foreground mt-1">
                Visite a loja para adquirir itens!
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipped" className="mt-4">
          {equippedItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {equippedItems.map((invItem, index) => {
                const item = items.find(i => i.id === invItem.item_id);
                return (
                  <motion.div
                    key={invItem.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="surface-elevated p-4 ring-2 ring-primary/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{item?.icon || "📦"}</div>
                      <div className="flex-1">
                        <p className="font-medium">{item?.name || "Item"}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item?.category}
                        </p>
                      </div>
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="surface p-8 text-center">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum item equipado</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          {inventory.length > 0 ? (
            <div className="surface divide-y divide-border">
              {inventory.sort((a, b) => 
                new Date(b.purchased_at).getTime() - new Date(a.purchased_at).getTime()
              ).map((invItem) => {
                const item = items.find(i => i.id === invItem.item_id);
                return (
                  <div key={invItem.id} className="p-4 flex items-center gap-3">
                    <div className="text-2xl">{item?.icon || "📦"}</div>
                    <div className="flex-1">
                      <p className="font-medium">{item?.name || "Item"}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(invItem.purchased_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-yellow-500">
                        {item?.price?.toLocaleString() || 0} 🪙
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="surface p-8 text-center">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma transação ainda</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

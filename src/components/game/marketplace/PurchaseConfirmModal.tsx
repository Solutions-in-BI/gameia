import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RarityBadge, Rarity } from "./RarityBadge";
import { CoinDisplay } from "./CoinDisplay";
import confetti from "canvas-confetti";

interface MarketplaceItem {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  price: number;
  rarity: string;
}

interface PurchaseConfirmModalProps {
  item: MarketplaceItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (itemId: string) => Promise<{ success: boolean }>;
  userCoins: number;
}

export function PurchaseConfirmModal({
  item,
  isOpen,
  onClose,
  onConfirm,
  userCoins,
}: PurchaseConfirmModalProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  if (!item) return null;

  const canAfford = userCoins >= item.price;
  const coinsAfter = userCoins - item.price;

  const handleConfirm = async () => {
    setIsPurchasing(true);
    const result = await onConfirm(item.id);
    setIsPurchasing(false);

    if (result.success) {
      setPurchaseSuccess(true);
      
      // Confetti para itens raros+
      if (["rare", "epic", "legendary"].includes(item.rarity)) {
        confetti({
          particleCount: item.rarity === "legendary" ? 150 : item.rarity === "epic" ? 100 : 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: item.rarity === "legendary" 
            ? ["#f59e0b", "#fbbf24", "#fcd34d"] 
            : item.rarity === "epic"
            ? ["#a855f7", "#c084fc", "#d8b4fe"]
            : ["#3b82f6", "#60a5fa", "#93c5fd"],
        });
      }

      setTimeout(() => {
        setPurchaseSuccess(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <AnimatePresence mode="wait">
          {purchaseSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-8 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5 }}
                className="text-7xl mb-4"
              >
                {item.icon}
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Item Adquirido! 🎉
                </h3>
                <p className="text-muted-foreground">
                  {item.name} foi adicionado ao seu inventário
                </p>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Confirmar Compra
                </DialogTitle>
                <DialogDescription>
                  Deseja adquirir este item?
                </DialogDescription>
              </DialogHeader>

              <div className="py-6">
                {/* Item Preview */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl mb-4">
                  <span className="text-5xl">{item.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <RarityBadge rarity={item.rarity as Rarity} size="sm" />
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Preço</span>
                    <CoinDisplay amount={item.price} size="sm" showChange={false} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Suas moedas</span>
                    <CoinDisplay amount={userCoins} size="sm" showChange={false} />
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center font-medium">
                    <span>Saldo após compra</span>
                    <span className={canAfford ? "text-green-500" : "text-red-500"}>
                      🪙 {canAfford ? coinsAfter.toLocaleString("pt-BR") : "Insuficiente"}
                    </span>
                  </div>
                </div>

                {!canAfford && (
                  <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm text-center">
                    Você precisa de mais {(item.price - userCoins).toLocaleString("pt-BR")} moedas
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={onClose} disabled={isPurchasing}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={!canAfford || isPurchasing}
                  className="gap-2"
                >
                  {isPurchasing ? (
                    <>
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        ⏳
                      </motion.span>
                      Comprando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Comprar por 🪙 {item.price}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

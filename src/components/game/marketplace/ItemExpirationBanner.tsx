/**
 * Banner de aviso para itens expirando em breve
 */

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useExpiringItems, ExpiringItem } from "@/hooks/useExpiringItems";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ItemExpirationBannerProps {
  onViewInventory?: () => void;
}

export function ItemExpirationBanner({ onViewInventory }: ItemExpirationBannerProps) {
  const { expiringItems, hasExpiringItems, isLoading } = useExpiringItems();
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();

  if (isLoading || !hasExpiringItems || isDismissed) return null;

  // Get most urgent items (1-2 days)
  const urgentItems = expiringItems.filter(item => item.days_remaining <= 2);
  const hasUrgent = urgentItems.length > 0;

  const handleViewInventory = () => {
    if (onViewInventory) {
      onViewInventory();
    } else {
      navigate("/app/marketplace");
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative overflow-hidden rounded-lg border ${
          hasUrgent 
            ? "bg-red-500/10 border-red-500/30" 
            : "bg-amber-500/10 border-amber-500/30"
        }`}
      >
        <div className="flex items-center gap-3 p-3">
          <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            hasUrgent ? "bg-red-500/20" : "bg-amber-500/20"
          }`}>
            <AlertTriangle className={`w-4 h-4 ${
              hasUrgent ? "text-red-500" : "text-amber-500"
            }`} />
          </div>

          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${
              hasUrgent ? "text-red-700" : "text-amber-700"
            }`}>
              {expiringItems.length === 1 
                ? "1 item expirando em breve"
                : `${expiringItems.length} itens expirando em breve`
              }
            </p>
            <div className="flex items-center gap-2 mt-1">
              {expiringItems.slice(0, 3).map((item) => (
                <ExpiringItemChip key={item.inventory_id} item={item} />
              ))}
              {expiringItems.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{expiringItems.length - 3}
                </span>
              )}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewInventory}
            className={`shrink-0 ${
              hasUrgent 
                ? "text-red-600 hover:text-red-700 hover:bg-red-500/10" 
                : "text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
            }`}
          >
            Ver inventário
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDismissed(true)}
            className="shrink-0 w-6 h-6 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function ExpiringItemChip({ item }: { item: ExpiringItem }) {
  const isUrgent = item.days_remaining <= 2;
  
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
      isUrgent 
        ? "bg-red-500/20 text-red-700" 
        : "bg-amber-500/20 text-amber-700"
    }`}>
      <span>{item.item_icon}</span>
      <span>{item.days_remaining}d</span>
    </span>
  );
}

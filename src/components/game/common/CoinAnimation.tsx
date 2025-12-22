import { useEffect, useState } from "react";
import { Coins } from "lucide-react";

interface CoinAnimationProps {
  amount: number;
  trigger: boolean;
  onComplete?: () => void;
}

export function CoinAnimation({ amount, trigger, onComplete }: CoinAnimationProps) {
  const [coins, setCoins] = useState<{ id: number; x: number; delay: number }[]>([]);
  const [showAmount, setShowAmount] = useState(false);

  useEffect(() => {
    if (trigger && amount > 0) {
      // Cria múltiplas moedas para animação
      const numCoins = Math.min(amount, 8);
      const newCoins = Array.from({ length: numCoins }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 60 - 30, // -30 a 30px offset horizontal
        delay: i * 100, // Delay escalonado
      }));
      
      setCoins(newCoins);
      setShowAmount(true);

      // Limpa após animação
      const timer = setTimeout(() => {
        setCoins([]);
        setShowAmount(false);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [trigger, amount, onComplete]);

  if (coins.length === 0 && !showAmount) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Moedas flutuantes */}
      {coins.map((coin) => (
        <div
          key={coin.id}
          className="absolute animate-coin-float"
          style={{
            left: `calc(50% + ${coin.x}px)`,
            bottom: "40%",
            animationDelay: `${coin.delay}ms`,
          }}
        >
          <div className="relative">
            <Coins className="w-8 h-8 text-yellow-400 drop-shadow-lg animate-spin-slow" />
            <div className="absolute inset-0 bg-yellow-300/50 rounded-full blur-md -z-10" />
          </div>
        </div>
      ))}

      {/* Contador central */}
      {showAmount && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 animate-coin-popup">
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-6 py-3 rounded-full shadow-2xl">
            <Coins className="w-6 h-6" />
            <span className="text-2xl font-bold">+{amount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

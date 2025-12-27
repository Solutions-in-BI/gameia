/**
 * Seção de Apostas & Desafios
 * Lista cards de apostas ativas
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Plus } from "lucide-react";
import { BettingCard } from "./BettingCard";
import type { Bet } from "./BettingCard";

export type { Bet } from "./BettingCard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BettingSectionProps {
  bets: Bet[];
  userCoins: number;
  onPlaceBet: (betId: string, side: "for" | "against", amount: number) => Promise<void>;
  isAdmin?: boolean;
  onCreateBet?: (bet: Omit<Bet, "id">) => Promise<void>;
}

export function BettingSection({ bets, userCoins, onPlaceBet, isAdmin, onCreateBet }: BettingSectionProps) {
  const { toast } = useToast();
  const [selectedBet, setSelectedBet] = useState<{ bet: Bet; side: "for" | "against" } | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);

  const activeBets = bets.filter(b => b.isActive);

  const handlePlaceBet = async () => {
    if (!selectedBet) return;
    const amount = parseInt(betAmount);
    
    if (isNaN(amount) || amount < selectedBet.bet.minBet || amount > selectedBet.bet.maxBet) {
      toast({
        title: "Valor inválido",
        description: `O valor deve estar entre ${selectedBet.bet.minBet} e ${selectedBet.bet.maxBet}`,
        variant: "destructive",
      });
      return;
    }

    if (amount > userCoins) {
      toast({
        title: "Moedas insuficientes",
        description: "Você não tem moedas suficientes para esta aposta",
        variant: "destructive",
      });
      return;
    }

    setIsPlacing(true);
    try {
      await onPlaceBet(selectedBet.bet.id, selectedBet.side, amount);
      toast({
        title: "🎲 Aposta realizada!",
        description: `Você apostou ${amount} moedas`,
      });
      setSelectedBet(null);
      setBetAmount("");
    } catch (err) {
      toast({
        title: "Erro ao apostar",
        variant: "destructive",
      });
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Apostas & Desafios
        </h2>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center gap-1.5">
            <Ticket className="w-4 h-4" />
            {activeBets.length} ATIVOS
          </div>
          {isAdmin && onCreateBet && (
            <CreateBetDialog onCreate={onCreateBet} />
          )}
        </div>
      </div>

      {/* Bets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bets.map((bet, index) => (
          <BettingCard
            key={bet.id}
            bet={bet}
            delay={index * 0.05}
            onBetFor={() => setSelectedBet({ bet, side: "for" })}
            onBetAgainst={() => setSelectedBet({ bet, side: "against" })}
          />
        ))}
      </div>

      {/* Empty State */}
      {bets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Ticket className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma aposta disponível no momento</p>
        </div>
      )}

      {/* Bet Amount Dialog */}
      <Dialog open={!!selectedBet} onOpenChange={(open) => !open && setSelectedBet(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              Apostar {selectedBet?.side === "for" ? "A Favor" : "Contra"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedBet && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {selectedBet.bet.title}
              </p>
              
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-foreground mb-1">
                  {selectedBet.side === "for" 
                    ? selectedBet.bet.oddsFor.toFixed(2) 
                    : selectedBet.bet.oddsAgainst.toFixed(2)}x
                </div>
                <p className="text-sm text-muted-foreground">
                  Multiplicador de ganhos
                </p>
              </div>

              <div className="space-y-2">
                <Label>Quantidade de moedas</Label>
                <Input
                  type="number"
                  placeholder={`Min: ${selectedBet.bet.minBet} - Max: ${selectedBet.bet.maxBet}`}
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-background"
                />
                <p className="text-xs text-muted-foreground">
                  Suas moedas: {userCoins.toLocaleString()}
                </p>
              </div>

              {betAmount && !isNaN(parseInt(betAmount)) && (
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground">Possível retorno:</p>
                  <p className="text-xl font-bold text-primary">
                    {Math.floor(
                      parseInt(betAmount) * 
                      (selectedBet.side === "for" 
                        ? selectedBet.bet.oddsFor 
                        : selectedBet.bet.oddsAgainst)
                    ).toLocaleString()} moedas
                  </p>
                </div>
              )}

              <Button 
                onClick={handlePlaceBet} 
                disabled={isPlacing}
                className="w-full"
              >
                {isPlacing ? "Processando..." : "Confirmar Aposta"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Dialog para criar nova aposta (admin)
function CreateBetDialog({ onCreate }: { onCreate: (bet: Omit<Bet, "id">) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "prediction" as const,
    daysLeft: 7,
    oddsFor: 1.8,
    oddsAgainst: 2.2,
    minBet: 100,
    maxBet: 5000,
  });

  const handleCreate = async () => {
    if (!form.title || !form.description) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    try {
      await onCreate({
        ...form,
        participants: 0,
        isActive: true,
      });
      toast({ title: "✅ Aposta criada!" });
      setOpen(false);
      setForm({
        title: "",
        description: "",
        type: "prediction",
        daysLeft: 7,
        oddsFor: 1.8,
        oddsAgainst: 2.2,
        minBet: 100,
        maxBet: 5000,
      });
    } catch {
      toast({ title: "Erro ao criar aposta", variant: "destructive" });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="w-4 h-4" />
          Nova Aposta
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Criar Nova Aposta</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input
              placeholder="Ex: Meta de Vendas Q4"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              placeholder="Ex: A equipe vai bater a meta de R$1M?"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="bg-background"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Odd A Favor</Label>
              <Input
                type="number"
                step="0.1"
                value={form.oddsFor}
                onChange={(e) => setForm(f => ({ ...f, oddsFor: parseFloat(e.target.value) }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Odd Contra</Label>
              <Input
                type="number"
                step="0.1"
                value={form.oddsAgainst}
                onChange={(e) => setForm(f => ({ ...f, oddsAgainst: parseFloat(e.target.value) }))}
                className="bg-background"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aposta Mínima</Label>
              <Input
                type="number"
                value={form.minBet}
                onChange={(e) => setForm(f => ({ ...f, minBet: parseInt(e.target.value) }))}
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Aposta Máxima</Label>
              <Input
                type="number"
                value={form.maxBet}
                onChange={(e) => setForm(f => ({ ...f, maxBet: parseInt(e.target.value) }))}
                className="bg-background"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo (dias)</Label>
            <Input
              type="number"
              value={form.daysLeft}
              onChange={(e) => setForm(f => ({ ...f, daysLeft: parseInt(e.target.value) }))}
              className="bg-background"
            />
          </div>

          <Button onClick={handleCreate} disabled={isCreating} className="w-full">
            {isCreating ? "Criando..." : "Criar Aposta"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

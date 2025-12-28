/**
 * SalesGameConfig - Container principal de configuração do Desafio de Vendas
 */

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Route,
  User,
  MessageSquare,
  Settings,
  ChevronLeft,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { SalesTracksManager } from "./SalesTracksManager";
import { SalesPersonasManager } from "./SalesPersonasManager";
import { SalesStagesManager } from "./SalesStagesManager";

interface SalesGameConfigProps {
  onBack?: () => void;
}

const TABS = [
  { id: "tracks", label: "Trilhas", icon: Route, description: "Jornadas de vendas" },
  { id: "personas", label: "Personas", icon: User, description: "Clientes virtuais" },
  { id: "stages", label: "Estágios", icon: MessageSquare, description: "Fluxo de conversa" },
  { id: "products", label: "Produtos", icon: ShoppingBag, description: "Catálogo de vendas", disabled: true },
  { id: "objections", label: "Objeções", icon: AlertTriangle, description: "Biblioteca", disabled: true },
];

export function SalesGameConfig({ onBack }: SalesGameConfigProps) {
  const [activeTab, setActiveTab] = useState("tracks");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Configuração do Desafio de Vendas
          </h2>
          <p className="text-muted-foreground">
            Personalize todos os aspectos do jogo de simulação de vendas
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start gap-1 h-auto flex-wrap bg-muted/50 p-1 rounded-xl">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all",
                "data-[state=active]:bg-background data-[state=active]:shadow-sm",
                tab.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.disabled && (
                <span className="text-xs text-muted-foreground hidden sm:inline">(Em breve)</span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TabsContent value="tracks" className="m-0">
            <SalesTracksManager />
          </TabsContent>

          <TabsContent value="personas" className="m-0">
            <SalesPersonasManager />
          </TabsContent>

          <TabsContent value="stages" className="m-0">
            <SalesStagesManager />
          </TabsContent>

          <TabsContent value="products" className="m-0">
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Produtos & Serviços</h3>
              <p className="text-sm max-w-md mx-auto">
                Configure o catálogo de produtos e serviços que serão vendidos nas simulações.
                Em breve!
              </p>
            </div>
          </TabsContent>

          <TabsContent value="objections" className="m-0">
            <div className="text-center py-16 text-muted-foreground">
              <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-2">Biblioteca de Objeções</h3>
              <p className="text-sm max-w-md mx-auto">
                Gerencie objeções comuns e técnicas de resposta recomendadas.
                Em breve!
              </p>
            </div>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
}

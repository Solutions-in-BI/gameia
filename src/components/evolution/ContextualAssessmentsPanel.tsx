/**
 * ContextualAssessmentsPanel - Painel integrado de avaliações contextuais
 * Mostra sugestões, loops abertos e histórico
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  ChevronDown,
  ChevronUp,
  GitBranch,
  Lightbulb,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useContextualAssessments } from "@/hooks/useContextualAssessments";
import { AssessmentLoopCard } from "./AssessmentLoopCard";
import { AssessmentSuggestionCard } from "./AssessmentSuggestionCard";
import type { 
  AssessmentOriginType, 
  LoopStatus, 
  SuggestionType 
} from "@/types/contextualAssessments";

export function ContextualAssessmentsPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<"suggestions" | "loops">("suggestions");

  const {
    pendingSuggestions,
    dynamicSuggestions,
    openLoops,
    suggestionsLoading,
    loopsLoading,
    hasPendingSuggestions,
    refetchDynamicSuggestions,
    acceptSuggestion,
    dismissSuggestion,
    closeLoop,
  } = useContextualAssessments();

  const isLoading = suggestionsLoading || loopsLoading;
  const totalSuggestions = pendingSuggestions.length + dynamicSuggestions.length;
  const totalLoops = openLoops.length;

  const handleAcceptSuggestion = (suggestionId: string) => {
    acceptSuggestion.mutate(suggestionId);
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    dismissSuggestion.mutate(suggestionId);
  };

  const handleCloseLoop = (contextLinkId: string) => {
    closeLoop.mutate({ contextLinkId, reason: "user_closed" });
  };

  // Não exibir se não houver nada
  if (!hasPendingSuggestions && openLoops.length === 0 && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader
          className="cursor-pointer py-3"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  Avaliações Contextuais
                  {hasPendingSuggestions && (
                    <Badge variant="default" className="animate-pulse">
                      {totalSuggestions} nova{totalSuggestions > 1 ? "s" : ""}
                    </Badge>
                  )}
                  {totalLoops > 0 && (
                    <Badge variant="outline">
                      {totalLoops} loop{totalLoops > 1 ? "s" : ""} aberto{totalLoops > 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Sugestões inteligentes baseadas na sua evolução
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  refetchDynamicSuggestions();
                }}
                disabled={suggestionsLoading}
              >
                <RefreshCw className={`w-4 h-4 ${suggestionsLoading ? 'animate-spin' : ''}`} />
              </Button>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardContent className="pt-0">
                <Tabs
                  value={activeTab}
                  onValueChange={(v) => setActiveTab(v as typeof activeTab)}
                >
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="suggestions" className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Sugestões
                      {totalSuggestions > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {totalSuggestions}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="loops" className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      Loops
                      {totalLoops > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {totalLoops}
                        </Badge>
                      )}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="suggestions">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-32 w-full" />
                        ))}
                      </div>
                    ) : totalSuggestions > 0 ? (
                      <ScrollArea className="h-[300px] pr-2">
                        <div className="space-y-3">
                          {/* Sugestões dinâmicas (do RPC) */}
                          {dynamicSuggestions.map((suggestion, index) => (
                            <AssessmentSuggestionCard
                              key={`dynamic-${index}`}
                              id={`dynamic-${index}`}
                              suggestionType={suggestion.suggestion_type as SuggestionType}
                              reason={suggestion.reason}
                              skillsToEvaluate={suggestion.skill_ids || []}
                              priority={suggestion.priority}
                              createdAt={new Date().toISOString()}
                              contextType={suggestion.context_type}
                              onAccept={() => {
                                // Para sugestões dinâmicas, criar diretamente
                              }}
                              onDismiss={() => {}}
                            />
                          ))}

                          {/* Sugestões persistidas */}
                          {pendingSuggestions.map((suggestion) => (
                            <AssessmentSuggestionCard
                              key={suggestion.id}
                              id={suggestion.id}
                              suggestionType={suggestion.suggestion_type as SuggestionType}
                              reason={suggestion.reason || "Sugestão de avaliação"}
                              skillsToEvaluate={suggestion.skills_to_evaluate || []}
                              priority={suggestion.priority || 5}
                              createdAt={suggestion.created_at || new Date().toISOString()}
                              contextType={suggestion.context_type}
                              onAccept={() => handleAcceptSuggestion(suggestion.id)}
                              onDismiss={() => handleDismissSuggestion(suggestion.id)}
                              isLoading={acceptSuggestion.isPending || dismissSuggestion.isPending}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhuma sugestão no momento</p>
                        <p className="text-sm">
                          Continue jogando e evoluindo para receber sugestões personalizadas
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="loops">
                    {isLoading ? (
                      <div className="space-y-3">
                        {[1, 2].map((i) => (
                          <Skeleton key={i} className="h-40 w-full" />
                        ))}
                      </div>
                    ) : totalLoops > 0 ? (
                      <ScrollArea className="h-[300px] pr-2">
                        <div className="space-y-3">
                          {openLoops.map((loop) => {
                            const cycle = loop.assessment_cycles as {
                              id: string;
                              name: string;
                              status: string;
                              evaluated_skills?: string[];
                            } | null;

                            return (
                              <AssessmentLoopCard
                                key={loop.id}
                                id={loop.id}
                                originType={loop.origin_type as AssessmentOriginType}
                                originId={loop.origin_id}
                                cycleName={cycle?.name || "Avaliação"}
                                cycleStatus={cycle?.status || "active"}
                                loopStatus={(loop.loop_status || "open") as LoopStatus}
                                evaluatedSkills={cycle?.evaluated_skills || loop.context_skill_ids || []}
                                createdAt={loop.created_at || new Date().toISOString()}
                                closedAt={loop.closed_at}
                                closureReason={loop.closure_reason}
                                onCloseLoop={() => handleCloseLoop(loop.id)}
                              />
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Nenhum loop de avaliação aberto</p>
                        <p className="text-sm">
                          Loops são criados automaticamente quando eventos disparam avaliações
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

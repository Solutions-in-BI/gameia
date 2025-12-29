/**
 * Perfil Cognitivo do Colaborador
 * Visualização com radar chart e insights
 */

import { motion } from "framer-motion";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown,
  Target,
  Lightbulb,
  Award,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useCognitiveTests } from "@/hooks/useCognitiveTests";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

const COGNITIVE_DIMENSIONS = [
  { key: "logical_reasoning", label: "Lógica", shortLabel: "Lógica" },
  { key: "numerical_ability", label: "Numérico", shortLabel: "Num." },
  { key: "verbal_reasoning", label: "Verbal", shortLabel: "Verbal" },
  { key: "spatial_reasoning", label: "Espacial", shortLabel: "Esp." },
  { key: "attention_to_detail", label: "Atenção", shortLabel: "Atenção" },
  { key: "working_memory", label: "Memória", shortLabel: "Mem." },
];

interface MyCognitiveProfileProps {
  onBack?: () => void;
}

export function MyCognitiveProfile({ onBack }: MyCognitiveProfileProps) {
  const { myProfile, mySessions, profileLoading } = useCognitiveTests();

  if (profileLoading) {
    return (
      <div className="space-y-4">
        <Card className="animate-pulse">
          <CardContent className="p-8">
            <div className="h-80 bg-muted rounded-lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!myProfile) {
    return (
      <Card className="p-12 text-center">
        <Brain className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-semibold text-foreground">Perfil não disponível</h3>
        <p className="text-muted-foreground mt-2">
          Complete pelo menos um teste cognitivo para gerar seu perfil.
        </p>
      </Card>
    );
  }

  // Prepare radar chart data
  const radarData = COGNITIVE_DIMENSIONS.map(dim => ({
    subject: dim.shortLabel,
    value: (myProfile as any)[dim.key] || 0,
    fullMark: 100,
  }));

  // Calculate strengths and weaknesses
  const sortedDimensions = [...COGNITIVE_DIMENSIONS]
    .map(dim => ({
      ...dim,
      value: (myProfile as any)[dim.key] || 0,
    }))
    .sort((a, b) => b.value - a.value);

  const strengths = sortedDimensions.slice(0, 2).filter(d => d.value >= 70);
  const weaknesses = sortedDimensions.slice(-2).filter(d => d.value < 60);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Brain className="w-6 h-6 text-primary" />
              Meu Perfil Cognitivo
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise das suas habilidades mentais
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          {myProfile.assessments_count || 0} avaliações realizadas
        </Badge>
      </div>

      {/* Main Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Score Circle */}
              <div className="relative">
                <div className="w-40 h-40 rounded-full bg-background flex items-center justify-center border-4 border-primary/30">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{myProfile.overall_score || 0}</p>
                    <p className="text-sm text-muted-foreground">Score Geral</p>
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>

              {/* Radar Chart */}
              <div className="flex-1 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 100]} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Dimensions Detail */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COGNITIVE_DIMENSIONS.map((dim, index) => {
          const value = (myProfile as any)[dim.key] || 0;
          const isStrength = value >= 80;
          const isWeakness = value < 50;

          return (
            <motion.div
              key={dim.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`${isStrength ? 'border-emerald-500/30' : isWeakness ? 'border-amber-500/30' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-foreground">{dim.label}</span>
                    <div className="flex items-center gap-2">
                      {isStrength && <TrendingUp className="w-4 h-4 text-emerald-500" />}
                      {isWeakness && <TrendingDown className="w-4 h-4 text-amber-500" />}
                      <span className={`font-bold ${
                        isStrength ? 'text-emerald-500' : isWeakness ? 'text-amber-500' : 'text-foreground'
                      }`}>
                        {value}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={value} 
                    className={`h-2 ${
                      isStrength ? '[&>div]:bg-emerald-500' : isWeakness ? '[&>div]:bg-amber-500' : ''
                    }`}
                  />
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        {strengths.length > 0 && (
          <Card className="border-emerald-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-emerald-500">
                <TrendingUp className="w-5 h-5" />
                Pontos Fortes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {strengths.map(s => (
                <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10">
                  <span className="font-medium text-foreground">{s.label}</span>
                  <Badge className="bg-emerald-500/20 text-emerald-500">{s.value}%</Badge>
                </div>
              ))}
              <p className="text-sm text-muted-foreground mt-2">
                Suas habilidades mais desenvolvidas. Continue praticando para manter a excelência.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Areas for Improvement */}
        {weaknesses.length > 0 && (
          <Card className="border-amber-500/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                <Target className="w-5 h-5" />
                Áreas para Desenvolver
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weaknesses.map(w => (
                <div key={w.key} className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10">
                  <span className="font-medium text-foreground">{w.label}</span>
                  <Badge className="bg-amber-500/20 text-amber-500">{w.value}%</Badge>
                </div>
              ))}
              <p className="text-sm text-muted-foreground mt-2">
                Foque nestas habilidades para um desenvolvimento mais equilibrado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Recomendações de Treinamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {weaknesses.length > 0 ? (
              weaknesses.map(w => (
                <div key={w.key} className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h4 className="font-medium text-foreground mb-2">Melhore seu {w.label}</h4>
                  <p className="text-sm text-muted-foreground">
                    {w.key === 'spatial_reasoning' && 'Pratique jogos de visualização 3D como Tetris e quebra-cabeças espaciais.'}
                    {w.key === 'numerical_ability' && 'Faça exercícios de cálculo mental diariamente e pratique estimativas.'}
                    {w.key === 'verbal_reasoning' && 'Leia textos variados e pratique analogias e sinônimos.'}
                    {w.key === 'attention_to_detail' && 'Pratique jogos de memória e exercícios de atenção focada.'}
                    {w.key === 'working_memory' && 'Faça exercícios de memorização progressiva e jogos de sequência.'}
                    {w.key === 'logical_reasoning' && 'Resolva puzzles lógicos e pratique silogismos.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-muted-foreground">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Complete mais testes para receber recomendações personalizadas.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

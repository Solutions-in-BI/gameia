/**
 * Gestão de Testes Cognitivos - Admin
 */

import { useState } from "react";
import {
  Brain,
  Plus,
  Search,
  Filter,
  Clock,
  BarChart3,
  Users,
  Zap,
  Target,
  Calculator,
  Type,
  Eye,
  Edit2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCognitiveTests } from "@/hooks/useCognitiveTests";

export function CognitiveTestsManagement() {
  const { tests, testsLoading, createTest, updateTest } = useCognitiveTests();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const [newTest, setNewTest] = useState({
    name: "",
    description: "",
    test_type: "logic",
    difficulty: "medium",
    time_limit_minutes: 30,
    xp_reward: 100,
  });

  const handleCreateTest = async () => {
    if (!newTest.name) return;
    
    await createTest.mutateAsync({
      name: newTest.name,
      description: newTest.description,
      test_type: newTest.test_type,
      difficulty: newTest.difficulty,
      time_limit_minutes: newTest.time_limit_minutes,
      xp_reward: newTest.xp_reward,
    });
    
    setNewTest({
      name: "",
      description: "",
      test_type: "logic",
      difficulty: "medium",
      time_limit_minutes: 30,
      xp_reward: 100,
    });
    setIsCreateOpen(false);
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    await updateTest.mutateAsync({ id, is_active: !currentState });
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || test.test_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getTestTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      logic: <Brain className="h-4 w-4" />,
      numerical: <Calculator className="h-4 w-4" />,
      verbal: <Type className="h-4 w-4" />,
      spatial: <Target className="h-4 w-4" />,
      attention: <Eye className="h-4 w-4" />,
      memory: <Zap className="h-4 w-4" />,
    };
    return icons[type] || <Brain className="h-4 w-4" />;
  };

  const getTestTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      logic: "Raciocínio Lógico",
      numerical: "Habilidade Numérica",
      verbal: "Raciocínio Verbal",
      spatial: "Raciocínio Espacial",
      attention: "Atenção aos Detalhes",
      memory: "Memória de Trabalho",
    };
    return labels[type] || type;
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      easy: { variant: "secondary", label: "Fácil" },
      medium: { variant: "default", label: "Médio" },
      hard: { variant: "destructive", label: "Difícil" },
    };
    const config = variants[difficulty] || variants.medium;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const stats = {
    total: tests.length,
    active: tests.filter((t) => t.is_active).length,
    types: new Set(tests.map((t) => t.test_type)).size,
    avgXp: tests.length > 0 
      ? Math.round(tests.reduce((acc, t) => acc + t.xp_reward, 0) / tests.length)
      : 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Testes Cognitivos
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Crie e gerencie testes de lógica, raciocínio e habilidades cognitivas
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Teste
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Teste Cognitivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Nome do Teste</Label>
                <Input
                  placeholder="Ex: Sequências Lógicas Avançadas"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  placeholder="Descreva o objetivo e formato do teste..."
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Teste</Label>
                  <Select
                    value={newTest.test_type}
                    onValueChange={(value) => setNewTest({ ...newTest, test_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="logic">Raciocínio Lógico</SelectItem>
                      <SelectItem value="numerical">Habilidade Numérica</SelectItem>
                      <SelectItem value="verbal">Raciocínio Verbal</SelectItem>
                      <SelectItem value="spatial">Raciocínio Espacial</SelectItem>
                      <SelectItem value="attention">Atenção aos Detalhes</SelectItem>
                      <SelectItem value="memory">Memória de Trabalho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Dificuldade</Label>
                  <Select
                    value={newTest.difficulty}
                    onValueChange={(value) => setNewTest({ ...newTest, difficulty: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Fácil</SelectItem>
                      <SelectItem value="medium">Médio</SelectItem>
                      <SelectItem value="hard">Difícil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tempo Limite (min)</Label>
                  <Input
                    type="number"
                    min={5}
                    max={120}
                    value={newTest.time_limit_minutes}
                    onChange={(e) => setNewTest({ ...newTest, time_limit_minutes: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recompensa XP</Label>
                  <Input
                    type="number"
                    min={10}
                    value={newTest.xp_reward}
                    onChange={(e) => setNewTest({ ...newTest, xp_reward: Number(e.target.value) })}
                  />
                </div>
              </div>
              <Button 
                onClick={handleCreateTest} 
                className="w-full"
                disabled={createTest.isPending}
              >
                {createTest.isPending ? "Criando..." : "Criar Teste"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Testes</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <ToggleRight className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.types}</p>
              <p className="text-xs text-muted-foreground">Tipos</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.avgXp}</p>
              <p className="text-xs text-muted-foreground">XP Médio</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar testes..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Tipos</SelectItem>
            <SelectItem value="logic">Raciocínio Lógico</SelectItem>
            <SelectItem value="numerical">Habilidade Numérica</SelectItem>
            <SelectItem value="verbal">Raciocínio Verbal</SelectItem>
            <SelectItem value="spatial">Raciocínio Espacial</SelectItem>
            <SelectItem value="attention">Atenção</SelectItem>
            <SelectItem value="memory">Memória</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tests List */}
      <div className="space-y-4">
        {testsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground mt-2">Carregando testes...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Nenhum teste encontrado</p>
            <Button variant="link" onClick={() => setIsCreateOpen(true)} className="mt-2">
              Criar primeiro teste
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      {getTestTypeIcon(test.test_type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{test.name}</h3>
                      <p className="text-xs text-muted-foreground">{getTestTypeLabel(test.test_type)}</p>
                    </div>
                  </div>
                  <Switch
                    checked={test.is_active}
                    onCheckedChange={() => handleToggleActive(test.id, test.is_active)}
                  />
                </div>
                
                {test.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{test.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {getDifficultyBadge(test.difficulty)}
                  <Badge variant="outline" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {test.time_limit_minutes} min
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    <Zap className="h-3 w-3" />
                    {test.xp_reward} XP
                  </Badge>
                  <Badge variant="outline" className="gap-1">
                    {test.questions_count} questões
                  </Badge>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Button size="sm" variant="outline" className="flex-1 gap-1">
                    <Plus className="h-3 w-3" />
                    Adicionar Questões
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

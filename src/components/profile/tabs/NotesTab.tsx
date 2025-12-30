import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  StickyNote, Search, Filter, Star, FileText, 
  CheckCircle, RefreshCw, Calendar, BookOpen
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { NoteCard } from "@/components/notes/NoteCard";
import { useTrainingNotes, type NoteStatus } from "@/hooks/useTrainingNotes";

export function NotesTab() {
  const [statusFilter, setStatusFilter] = useState<NoteStatus | "all">("all");
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState("");

  const { notes, isLoading, stats } = useTrainingNotes({
    status: statusFilter === "all" ? undefined : statusFilter,
    is_favorite: favoriteFilter,
    search: searchQuery || undefined,
  });

  // Group notes by training
  const groupedNotes = useMemo(() => {
    const groups: Record<string, typeof notes> = {};
    
    notes.forEach(note => {
      const trainingName = note.training?.name || "Treinamento";
      if (!groups[trainingName]) {
        groups[trainingName] = [];
      }
      groups[trainingName].push(note);
    });

    return groups;
  }, [notes]);

  const statCards = [
    { 
      label: "Total", 
      value: stats.total, 
      icon: StickyNote,
      color: "text-primary",
      onClick: () => { setStatusFilter("all"); setFavoriteFilter(undefined); }
    },
    { 
      label: "Rascunhos", 
      value: stats.draft, 
      icon: FileText,
      color: "text-muted-foreground",
      onClick: () => { setStatusFilter("draft"); setFavoriteFilter(undefined); }
    },
    { 
      label: "Aplicadas", 
      value: stats.applied, 
      icon: CheckCircle,
      color: "text-green-500",
      onClick: () => { setStatusFilter("applied"); setFavoriteFilter(undefined); }
    },
    { 
      label: "Revisadas", 
      value: stats.reviewed, 
      icon: RefreshCw,
      color: "text-blue-500",
      onClick: () => { setStatusFilter("reviewed"); setFavoriteFilter(undefined); }
    },
    { 
      label: "Favoritas", 
      value: stats.favorites, 
      icon: Star,
      color: "text-yellow-500",
      onClick: () => { setFavoriteFilter(true); setStatusFilter("all"); }
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-12 rounded-lg" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const isActive = 
            (stat.label === "Total" && statusFilter === "all" && favoriteFilter === undefined) ||
            (stat.label === "Rascunhos" && statusFilter === "draft") ||
            (stat.label === "Aplicadas" && statusFilter === "applied") ||
            (stat.label === "Revisadas" && statusFilter === "reviewed") ||
            (stat.label === "Favoritas" && favoriteFilter === true);

          return (
            <Card 
              key={stat.label}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isActive ? "ring-2 ring-primary" : ""
              }`}
              onClick={stat.onClick}
            >
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anotações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select 
          value={statusFilter} 
          onValueChange={(v) => setStatusFilter(v as NoteStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="applied">Aplicadas</SelectItem>
            <SelectItem value="reviewed">Revisadas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters */}
      {(statusFilter !== "all" || favoriteFilter || searchQuery) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros:</span>
          {statusFilter !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {statusFilter === "draft" ? "Rascunhos" : 
               statusFilter === "applied" ? "Aplicadas" : "Revisadas"}
              <button 
                onClick={() => setStatusFilter("all")}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {favoriteFilter && (
            <Badge variant="secondary" className="gap-1">
              <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
              Favoritas
              <button 
                onClick={() => setFavoriteFilter(undefined)}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              "{searchQuery}"
              <button 
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              setStatusFilter("all");
              setFavoriteFilter(undefined);
              setSearchQuery("");
            }}
          >
            Limpar todos
          </Button>
        </div>
      )}

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma anotação encontrada</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery || statusFilter !== "all" || favoriteFilter
                ? "Tente ajustar os filtros para ver mais resultados."
                : "Comece a fazer anotações durante seus treinamentos para revisar depois!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotes).map(([trainingName, trainingNotes]) => (
            <div key={trainingName} className="space-y-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                  {trainingName}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {trainingNotes.length}
                </Badge>
              </div>
              <div className="grid gap-4">
                {trainingNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <Card className="bg-muted/30 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-primary" />
            Dica Gameia
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground">
            <strong>Quem anota, aprende.</strong> Marque suas anotações como "aplicadas" quando 
            usar o conhecimento no trabalho, e "revisadas" quando revisar para fixar o aprendizado.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

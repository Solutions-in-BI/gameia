import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Clock, Video, FileText, Gamepad2, HelpCircle, 
  Star, MoreVertical, Edit2, Trash2, Check, 
  RefreshCw, ExternalLink, BookOpen
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { NoteEditor } from "./NoteEditor";
import { useTrainingNotes, type TrainingNote, type NoteStatus, type NoteContentType } from "@/hooks/useTrainingNotes";

interface NoteCardProps {
  note: TrainingNote;
  compact?: boolean;
}

const contentTypeConfig: Record<NoteContentType, { icon: typeof Video; color: string }> = {
  video: { icon: Video, color: "text-blue-500" },
  text: { icon: FileText, color: "text-green-500" },
  quiz: { icon: HelpCircle, color: "text-purple-500" },
  game: { icon: Gamepad2, color: "text-orange-500" },
  pdf: { icon: FileText, color: "text-red-500" },
  link: { icon: ExternalLink, color: "text-cyan-500" },
  reflection: { icon: BookOpen, color: "text-pink-500" },
};

const statusConfig: Record<NoteStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Rascunho", variant: "outline" },
  applied: { label: "Aplicada", variant: "secondary" },
  reviewed: { label: "Revisada", variant: "default" },
};

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function NoteCard({ note, compact = false }: NoteCardProps) {
  const navigate = useNavigate();
  const { toggleFavorite, updateStatus, deleteNote, isDeleting } = useTrainingNotes();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const ContentIcon = contentTypeConfig[note.content_type]?.icon || FileText;
  const iconColor = contentTypeConfig[note.content_type]?.color || "text-muted-foreground";
  const statusInfo = statusConfig[note.status];

  const handleNavigateToContext = () => {
    // Navigate to module player with context
    let url = `/app/trainings/${note.training_id}/modules/${note.module_id}`;
    
    if (note.timestamp_seconds) {
      url += `?t=${note.timestamp_seconds}`;
    }
    
    navigate(url);
  };

  const handleStatusChange = async (newStatus: NoteStatus) => {
    await updateStatus(note.id, newStatus);
  };

  const handleDelete = async () => {
    await deleteNote(note.id);
    setIsDeleteDialogOpen(false);
  };

  if (compact) {
    return (
      <>
        <div 
          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={handleNavigateToContext}
        >
          <div className={`mt-0.5 ${iconColor}`}>
            <ContentIcon className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-2">{note.content}</p>
            <div className="flex items-center gap-2 mt-1.5">
              {note.timestamp_seconds !== null && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(note.timestamp_seconds)}
                </span>
              )}
              <Badge variant={statusInfo.variant} className="text-xs h-5">
                {statusInfo.label}
              </Badge>
            </div>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(note);
            }}
          >
            <Star className={`h-4 w-4 ${note.is_favorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
          </Button>
        </div>

        <NoteEditor
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          trainingId={note.training_id}
          moduleId={note.module_id}
          contentType={note.content_type}
          existingNote={note}
        />
      </>
    );
  }

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Content type icon */}
            <div className={`p-2 rounded-lg bg-muted ${iconColor}`}>
              <ContentIcon className="h-5 w-5" />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-2">
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  {note.title && (
                    <h4 className="font-medium text-sm">{note.title}</h4>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={statusInfo.variant} className="text-xs">
                      {statusInfo.label}
                    </Badge>
                    {note.timestamp_seconds !== null && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(note.timestamp_seconds)}
                      </span>
                    )}
                    {note.quiz_question_index !== null && (
                      <span className="text-xs text-muted-foreground">
                        Questão {note.quiz_question_index + 1}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => toggleFavorite(note)}
                  >
                    <Star className={`h-4 w-4 ${note.is_favorite ? "fill-yellow-500 text-yellow-500" : ""}`} />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleNavigateToContext}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ir para o conteúdo
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsEditorOpen(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {note.status !== "applied" && (
                        <DropdownMenuItem onClick={() => handleStatusChange("applied")}>
                          <Check className="h-4 w-4 mr-2" />
                          Marcar como aplicada
                        </DropdownMenuItem>
                      )}
                      {note.status !== "reviewed" && (
                        <DropdownMenuItem onClick={() => handleStatusChange("reviewed")}>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Marcar como revisada
                        </DropdownMenuItem>
                      )}
                      {note.status !== "draft" && (
                        <DropdownMenuItem onClick={() => handleStatusChange("draft")}>
                          Voltar para rascunho
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Selected text */}
              {note.text_selection && (
                <div className="p-2 rounded bg-muted/50 border-l-2 border-primary text-xs italic text-muted-foreground">
                  "{note.text_selection.length > 100 ? note.text_selection.slice(0, 100) + "..." : note.text_selection}"
                </div>
              )}

              {/* Note content */}
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                {note.content}
              </p>

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  {note.training?.name && (
                    <span className="font-medium">{note.training.name}</span>
                  )}
                  {note.module?.name && (
                    <span> • {note.module.name}</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(note.created_at), "dd MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <NoteEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        trainingId={note.training_id}
        moduleId={note.module_id}
        contentType={note.content_type}
        existingNote={note}
      />

      {/* Delete confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anotação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A anotação será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

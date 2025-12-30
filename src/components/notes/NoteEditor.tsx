import { useState, useEffect } from "react";
import { Clock, Video, FileText, Gamepad2, HelpCircle, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTrainingNotes, type NoteContentType, type TrainingNote } from "@/hooks/useTrainingNotes";

interface NoteEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingId: string;
  moduleId: string;
  contentType: NoteContentType;
  currentTimestamp?: number;
  selectedText?: string;
  quizQuestionIndex?: number;
  gameContext?: Record<string, unknown>;
  skillIds?: string[];
  existingNote?: TrainingNote;
  onSuccess?: () => void;
}

const contentTypeLabels: Record<NoteContentType, { label: string; icon: typeof Video }> = {
  video: { label: "Vídeo", icon: Video },
  text: { label: "Texto", icon: FileText },
  quiz: { label: "Quiz", icon: HelpCircle },
  game: { label: "Jogo", icon: Gamepad2 },
  pdf: { label: "PDF", icon: FileText },
  link: { label: "Link", icon: FileText },
  reflection: { label: "Reflexão", icon: FileText },
};

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function NoteEditor({
  open,
  onOpenChange,
  trainingId,
  moduleId,
  contentType,
  currentTimestamp,
  selectedText,
  quizQuestionIndex,
  gameContext,
  skillIds,
  existingNote,
  onSuccess,
}: NoteEditorProps) {
  const { createNote, updateNote, isCreating, isUpdating } = useTrainingNotes();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const isEditing = !!existingNote;
  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (existingNote) {
      setTitle(existingNote.title || "");
      setContent(existingNote.content);
      setTags(existingNote.tags || []);
    } else {
      setTitle("");
      setContent("");
      setTags([]);
    }
  }, [existingNote, open]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    try {
      if (isEditing && existingNote) {
        await updateNote({
          id: existingNote.id,
          title: title.trim() || undefined,
          content: content.trim(),
          tags: tags.length > 0 ? tags : undefined,
        });
      } else {
        await createNote({
          training_id: trainingId,
          module_id: moduleId,
          content_type: contentType,
          content: content.trim(),
          title: title.trim() || undefined,
          timestamp_seconds: currentTimestamp,
          text_selection: selectedText,
          quiz_question_index: quizQuestionIndex,
          game_context: gameContext,
          skill_ids: skillIds,
          tags: tags.length > 0 ? tags : undefined,
        });
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const ContentIcon = contentTypeLabels[contentType]?.icon || FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? "Editar Anotação" : "Nova Anotação"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Context indicator */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <ContentIcon className="h-3 w-3" />
              {contentTypeLabels[contentType]?.label || contentType}
            </Badge>
            
            {currentTimestamp !== undefined && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                {formatTimestamp(currentTimestamp)}
              </Badge>
            )}
            
            {quizQuestionIndex !== undefined && (
              <Badge variant="outline">
                Questão {quizQuestionIndex + 1}
              </Badge>
            )}
          </div>

          {/* Selected text preview */}
          {selectedText && (
            <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary text-sm italic text-muted-foreground">
              "{selectedText.length > 150 ? selectedText.slice(0, 150) + "..." : selectedText}"
            </div>
          )}

          {/* Title (optional) */}
          <div className="space-y-2">
            <Label htmlFor="note-title">Título (opcional)</Label>
            <Input
              id="note-title"
              placeholder="Ex: Conceito importante sobre..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="note-content">Anotação *</Label>
            <Textarea
              id="note-content"
              placeholder="Escreva sua anotação aqui..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="note-tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="note-tags"
                placeholder="Adicionar tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                Adicionar
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer hover:bg-destructive/20"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!content.trim() || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

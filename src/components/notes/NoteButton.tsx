import { useState } from "react";
import { StickyNote, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { NoteEditor } from "./NoteEditor";
import type { NoteContentType } from "@/hooks/useTrainingNotes";

interface NoteButtonProps {
  trainingId: string;
  moduleId: string;
  contentType: NoteContentType;
  currentTimestamp?: number;
  selectedText?: string;
  quizQuestionIndex?: number;
  gameContext?: Record<string, unknown>;
  skillIds?: string[];
  variant?: "floating" | "inline" | "icon";
  className?: string;
  onNoteAdded?: () => void;
}

export function NoteButton({
  trainingId,
  moduleId,
  contentType,
  currentTimestamp,
  selectedText,
  quizQuestionIndex,
  gameContext,
  skillIds,
  variant = "inline",
  className = "",
  onNoteAdded,
}: NoteButtonProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleOpenEditor = () => {
    setIsEditorOpen(true);
  };

  const handleNoteAdded = () => {
    setIsEditorOpen(false);
    onNoteAdded?.();
  };

  if (variant === "floating") {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className={`fixed bottom-24 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:scale-105 transition-transform ${className}`}
                onClick={handleOpenEditor}
              >
                <Plus className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Adicionar anotação</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <NoteEditor
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          trainingId={trainingId}
          moduleId={moduleId}
          contentType={contentType}
          currentTimestamp={currentTimestamp}
          selectedText={selectedText}
          quizQuestionIndex={quizQuestionIndex}
          gameContext={gameContext}
          skillIds={skillIds}
          onSuccess={handleNoteAdded}
        />
      </>
    );
  }

  if (variant === "icon") {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 ${className}`}
                onClick={handleOpenEditor}
              >
                <StickyNote className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Adicionar anotação</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <NoteEditor
          open={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          trainingId={trainingId}
          moduleId={moduleId}
          contentType={contentType}
          currentTimestamp={currentTimestamp}
          selectedText={selectedText}
          quizQuestionIndex={quizQuestionIndex}
          gameContext={gameContext}
          skillIds={skillIds}
          onSuccess={handleNoteAdded}
        />
      </>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={`gap-2 ${className}`}
        onClick={handleOpenEditor}
      >
        <StickyNote className="h-4 w-4" />
        <span>Anotar</span>
      </Button>

      <NoteEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        trainingId={trainingId}
        moduleId={moduleId}
        contentType={contentType}
        currentTimestamp={currentTimestamp}
        selectedText={selectedText}
        quizQuestionIndex={quizQuestionIndex}
        gameContext={gameContext}
        skillIds={skillIds}
        onSuccess={handleNoteAdded}
      />
    </>
  );
}

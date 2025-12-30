/**
 * ModuleNotesPanel - Shows notes for current module with collapsible view
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useModuleNotes } from "@/hooks/useTrainingNotes";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ModuleNotesPanelProps {
  trainingId: string;
  moduleId: string;
}

export function ModuleNotesPanel({ trainingId, moduleId }: ModuleNotesPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notes = [], isLoading } = useModuleNotes(trainingId, moduleId);

  if (isLoading) {
    return null;
  }

  if (notes.length === 0) {
    return null;
  }

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Minhas Anotações ({notes.length})
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <ScrollArea className="max-h-[300px] mt-2">
          <div className="space-y-3 pr-2">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg bg-muted/50 border border-border/50 text-sm"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {note.timestamp_seconds !== null && (
                      <Badge variant="secondary" className="text-xs font-mono">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimestamp(note.timestamp_seconds)}
                      </Badge>
                    )}
                    <span>
                      {formatDistanceToNow(new Date(note.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>

                {note.text_selection && (
                  <div className="mt-2 pl-3 border-l-2 border-primary/30 text-xs text-muted-foreground italic">
                    "{note.text_selection}"
                  </div>
                )}

                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CollapsibleContent>
    </Collapsible>
  );
}

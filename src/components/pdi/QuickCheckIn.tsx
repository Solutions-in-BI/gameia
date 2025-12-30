import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { 
  MessageSquarePlus, 
  X,
  Send,
  Sparkles,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DevelopmentGoal } from "@/hooks/usePDI";
import { motion, AnimatePresence } from "framer-motion";

interface QuickCheckInProps {
  goal: DevelopmentGoal;
  onSubmit: (progress: number, notes: string) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const QuickCheckIn: React.FC<QuickCheckInProps> = ({
  goal,
  onSubmit,
  onClose,
  isLoading = false,
}) => {
  const [progress, setProgress] = useState(goal.progress || 0);
  const [notes, setNotes] = useState("");

  const handleSubmit = async () => {
    await onSubmit(progress, notes);
  };

  const progressDelta = progress - (goal.progress || 0);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MessageSquarePlus className="h-4 w-4 text-primary" />
              Check-in: {goal.title}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Progress Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Novo progresso</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">{progress}%</span>
                {progressDelta > 0 && (
                  <span className="text-sm text-emerald-400">+{progressDelta}%</span>
                )}
              </div>
            </div>
            
            <Slider
              value={[progress]}
              onValueChange={([v]) => setProgress(v)}
              max={100}
              step={5}
              className="py-2"
            />

            {/* Quick buttons */}
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((v) => (
                <Button
                  key={v}
                  variant={progress === v ? "default" : "outline"}
                  size="sm"
                  onClick={() => setProgress(v)}
                  className="flex-1"
                >
                  {v}%
                </Button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">
              O que você fez? (opcional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva brevemente seu progresso..."
              className="min-h-[80px] resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isLoading || progress === goal.progress}
              className="flex-1 gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Registrar Check-in
                </>
              )}
            </Button>
            
            {progressDelta > 0 && (
              <div className="flex items-center gap-1 px-3 py-2 rounded-md bg-amber-500/10 text-amber-400 text-sm">
                <Sparkles className="h-4 w-4" />
                <span>+{Math.round(progressDelta * 0.5)} XP</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickCheckIn;

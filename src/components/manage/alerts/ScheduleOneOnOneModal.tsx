/**
 * Modal para agendar 1-on-1 a partir de um alerta
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Video, MapPin } from "lucide-react";
import { useOneOnOne } from "@/hooks/useOneOnOne";
import { useAuth } from "@/hooks/useAuth";

interface ScheduleOneOnOneModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
  context?: string;
  onSuccess?: () => void;
}

export function ScheduleOneOnOneModal({
  open,
  onClose,
  targetUserId,
  targetUserName,
  context,
  onSuccess,
}: ScheduleOneOnOneModalProps) {
  const { user } = useAuth();
  const { scheduleMeeting, templates } = useOneOnOne();
  
  const [scheduledAt, setScheduledAt] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState("30");
  const [location, setLocation] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [notes, setNotes] = useState(context || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user?.id) return;
    
    setIsSubmitting(true);
    try {
      await scheduleMeeting.mutateAsync({
        manager_id: user.id,
        employee_id: targetUserId,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: parseInt(duration),
        location: location || null,
        template_id: templateId,
      });
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error scheduling 1-on-1:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Agendar 1-on-1 com {targetUserName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {context && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Contexto:</strong> {context}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="datetime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Data e Hora
            </Label>
            <Input
              id="datetime"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutos</SelectItem>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Local / Link
            </Label>
            <Input
              id="location"
              placeholder="Ex: Google Meet, Sala 3, Zoom..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {templates.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="template">Template (opcional)</Label>
              <Select value={templateId || ""} onValueChange={(v) => setTemplateId(v || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Pauta inicial</Label>
            <Textarea
              id="notes"
              placeholder="Tópicos para discutir..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Agendando..." : "Agendar Reunião"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * One-on-One Section
 * Shows scheduled meetings and allows creating notes
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { useOneOnOne, OneOnOneMeeting } from "@/hooks/useOneOnOne";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Plus,
  MessageSquare,
  CheckCircle2,
  ListTodo,
  ArrowRight,
  Sparkles,
  Coffee,
} from "lucide-react";
import { format, isAfter, isBefore, isToday, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

export function OneOnOneSection() {
  const { user } = useAuth();
  const { myMeetings, myMeetingsLoading, templates, addNote, addActionItem, updateMeeting } = useOneOnOne();
  const [selectedMeeting, setSelectedMeeting] = useState<OneOnOneMeeting | null>(null);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newNote, setNewNote] = useState({ content: "", section: "general", isPrivate: false });
  const [newAction, setNewAction] = useState({ title: "", dueDate: "" });

  const now = new Date();
  const upcomingMeetings = myMeetings.filter((m) => isAfter(new Date(m.scheduled_at), now) && m.status !== "completed");
  const pastMeetings = myMeetings.filter((m) => isBefore(new Date(m.scheduled_at), now) || m.status === "completed");

  const handleAddNote = async () => {
    if (!selectedMeeting || !newNote.content.trim()) return;
    await addNote.mutateAsync({
      meeting_id: selectedMeeting.id,
      content: newNote.content,
      section: newNote.section,
      is_private: newNote.isPrivate,
    });
    setNewNote({ content: "", section: "general", isPrivate: false });
    setIsAddingNote(false);
  };

  const handleAddAction = async () => {
    if (!selectedMeeting || !newAction.title.trim()) return;
    await addActionItem.mutateAsync({
      meeting_id: selectedMeeting.id,
      assigned_to: user?.id!,
      title: newAction.title,
      due_date: newAction.dueDate || null,
    });
    setNewAction({ title: "", dueDate: "" });
    setIsAddingAction(false);
  };

  const handleCompleteMeeting = async () => {
    if (!selectedMeeting) return;
    await updateMeeting.mutateAsync({
      id: selectedMeeting.id,
      status: "completed",
    });
    setSelectedMeeting(null);
  };

  const getMeetingIcon = (location: string | null) => {
    if (!location) return <Calendar className="h-5 w-5" />;
    if (location.includes("zoom") || location.includes("meet") || location.includes("teams")) {
      return <Video className="h-5 w-5 text-blue-500" />;
    }
    return <MapPin className="h-5 w-5 text-green-500" />;
  };

  const getTimeUntil = (date: Date) => {
    if (isToday(date)) return "Hoje";
    const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 1) return "Amanhã";
    if (days <= 7) return `Em ${days} dias`;
    return format(date, "dd MMM", { locale: ptBR });
  };

  if (myMeetingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (selectedMeeting) {
    const meetingDate = new Date(selectedMeeting.scheduled_at);
    const isPast = isBefore(meetingDate, now);

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => setSelectedMeeting(null)}>
              ← Voltar
            </Button>
            <h2 className="text-2xl font-bold mt-2">Reunião 1:1</h2>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(meetingDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(meetingDate, "HH:mm", { locale: ptBR })} ({selectedMeeting.duration_minutes} min)
              </span>
            </div>
          </div>
          <Badge variant={selectedMeeting.status === "completed" ? "secondary" : "default"}>
            {selectedMeeting.status === "completed" ? "Concluída" : "Agendada"}
          </Badge>
        </div>

        {selectedMeeting.location && (
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              {getMeetingIcon(selectedMeeting.location)}
              <span>{selectedMeeting.location}</span>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Notas
              </CardTitle>
              <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Nota</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Conteúdo</Label>
                      <Textarea
                        value={newNote.content}
                        onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                        placeholder="Registre pontos importantes da conversa..."
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="private"
                        checked={newNote.isPrivate}
                        onCheckedChange={(checked) => setNewNote({ ...newNote, isPrivate: checked as boolean })}
                      />
                      <Label htmlFor="private">Nota privada (só você verá)</Label>
                    </div>
                    <Button onClick={handleAddNote} className="w-full">
                      Salvar Nota
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma nota registrada ainda</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="h-5 w-5" />
                Ações
              </CardTitle>
              <Dialog open={isAddingAction} onOpenChange={setIsAddingAction}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Ação</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>O que precisa ser feito?</Label>
                      <Input
                        value={newAction.title}
                        onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                        placeholder="Ex: Estudar documentação do projeto X"
                      />
                    </div>
                    <div>
                      <Label>Prazo (opcional)</Label>
                      <Input
                        type="date"
                        value={newAction.dueDate}
                        onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
                      />
                    </div>
                    <Button onClick={handleAddAction} className="w-full">
                      Criar Ação
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhuma ação definida ainda</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {selectedMeeting.status !== "completed" && isPast && (
          <Button onClick={handleCompleteMeeting} className="w-full" size="lg">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Marcar como Concluída
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reuniões 1:1</h2>
          <p className="text-muted-foreground">Acompanhe suas reuniões individuais</p>
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Próximas ({upcomingMeetings.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Anteriores ({pastMeetings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4 mt-6">
          {upcomingMeetings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <Coffee className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Nenhuma reunião agendada</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Você não tem reuniões 1:1 próximas. Converse com seu gestor para agendar.
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingMeetings.map((meeting, index) => {
              const meetingDate = new Date(meeting.scheduled_at);
              return (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedMeeting(meeting)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-primary/10">
                            <span className="text-2xl font-bold text-primary">
                              {format(meetingDate, "dd")}
                            </span>
                            <span className="text-xs text-muted-foreground uppercase">
                              {format(meetingDate, "MMM", { locale: ptBR })}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold">Reunião 1:1</h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(meetingDate, "HH:mm")}
                              </span>
                              <span>{meeting.duration_minutes} min</span>
                              {meeting.location && (
                                <span className="flex items-center gap-1">
                                  {getMeetingIcon(meeting.location)}
                                  <span className="truncate max-w-32">{meeting.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isToday(meetingDate) && (
                            <Badge variant="default" className="bg-green-500">
                              Hoje
                            </Badge>
                          )}
                          <Button variant="ghost" size="icon">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {pastMeetings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Nenhuma reunião anterior encontrada.</p>
              </CardContent>
            </Card>
          ) : (
            pastMeetings.slice(0, 10).map((meeting) => {
              const meetingDate = new Date(meeting.scheduled_at);
              return (
                <Card
                  key={meeting.id}
                  className="hover:shadow-md transition-shadow cursor-pointer opacity-80 hover:opacity-100"
                  onClick={() => setSelectedMeeting(meeting)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-muted">
                          <span className="text-lg font-bold">{format(meetingDate, "dd")}</span>
                          <span className="text-xs text-muted-foreground uppercase">
                            {format(meetingDate, "MMM", { locale: ptBR })}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium">Reunião 1:1</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(meetingDate, "EEEE, HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={meeting.status === "completed" ? "secondary" : "outline"}>
                        {meeting.status === "completed" ? "Concluída" : "Pendente"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

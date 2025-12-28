/**
 * Gestão de One-on-One - Admin
 */

import { useState } from "react";
import {
  MessageCircle,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useOneOnOne } from "@/hooks/useOneOnOne";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function OneOnOneManagement() {
  const { meetings, meetingsLoading, templates, templatesLoading, scheduleMeeting, createTemplate } = useOneOnOne();
  const [activeTab, setActiveTab] = useState("meetings");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [newMeeting, setNewMeeting] = useState({
    scheduled_at: "",
    duration_minutes: 30,
    location: "",
    recurrence: "",
  });

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    questions: "",
  });

  const handleScheduleMeeting = async () => {
    if (!newMeeting.scheduled_at) return;
    
    await scheduleMeeting.mutateAsync({
      scheduled_at: newMeeting.scheduled_at,
      duration_minutes: newMeeting.duration_minutes,
      location: newMeeting.location || undefined,
      recurrence: newMeeting.recurrence || undefined,
      manager_id: "", // Would be filled from a user selector
      employee_id: "", // Would be filled from a user selector
    });
    
    setNewMeeting({ scheduled_at: "", duration_minutes: 30, location: "", recurrence: "" });
    setIsScheduleOpen(false);
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name) return;
    
    const questions = newTemplate.questions
      .split("\n")
      .filter(q => q.trim())
      .map((q, i) => ({ id: `q${i}`, question: q.trim(), section: "general" }));

    await createTemplate.mutateAsync({
      name: newTemplate.name,
      questions,
    });
    
    setNewTemplate({ name: "", questions: "" });
    setIsTemplateOpen(false);
  };

  const filteredMeetings = meetings.filter((meeting) => {
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    return matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ReactNode }> = {
      scheduled: { variant: "secondary", label: "Agendada", icon: <Clock className="h-3 w-3" /> },
      in_progress: { variant: "default", label: "Em Andamento", icon: <Video className="h-3 w-3" /> },
      completed: { variant: "outline", label: "Concluída", icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { variant: "destructive", label: "Cancelada", icon: <XCircle className="h-3 w-3" /> },
    };
    const config = variants[status] || variants.scheduled;
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const stats = {
    total: meetings.length,
    scheduled: meetings.filter((m) => m.status === "scheduled").length,
    completed: meetings.filter((m) => m.status === "completed").length,
    templates: templates.length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            One-on-One
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie reuniões individuais entre gestores e colaboradores
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileText className="h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Template de 1:1</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Nome do Template</Label>
                  <Input
                    placeholder="Ex: Check-in Semanal"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Perguntas (uma por linha)</Label>
                  <Textarea
                    placeholder="Como você está se sentindo?&#10;Quais foram suas principais conquistas?&#10;Precisa de algum suporte?"
                    rows={6}
                    value={newTemplate.questions}
                    onChange={(e) => setNewTemplate({ ...newTemplate, questions: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={handleCreateTemplate} 
                  className="w-full"
                  disabled={createTemplate.isPending}
                >
                  {createTemplate.isPending ? "Criando..." : "Criar Template"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Agendar 1:1
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Agendar One-on-One</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Data e Hora</Label>
                  <Input
                    type="datetime-local"
                    value={newMeeting.scheduled_at}
                    onChange={(e) => setNewMeeting({ ...newMeeting, scheduled_at: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duração (minutos)</Label>
                  <Select
                    value={String(newMeeting.duration_minutes)}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, duration_minutes: Number(value) })}
                  >
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
                  <Label>Local / Link</Label>
                  <Input
                    placeholder="Sala de reunião ou link do Meet"
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Recorrência</Label>
                  <Select
                    value={newMeeting.recurrence}
                    onValueChange={(value) => setNewMeeting({ ...newMeeting, recurrence: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem recorrência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem recorrência</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quinzenal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleScheduleMeeting} 
                  className="w-full"
                  disabled={scheduleMeeting.isPending}
                >
                  {scheduleMeeting.isPending ? "Agendando..." : "Agendar Reunião"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageCircle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Reuniões</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.scheduled}</p>
              <p className="text-xs text-muted-foreground">Agendadas</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Concluídas</p>
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <FileText className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.templates}</p>
              <p className="text-xs text-muted-foreground">Templates</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="meetings">Reuniões</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="meetings" className="mt-4 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar reuniões..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="in_progress">Em Andamento</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Meetings List */}
          {meetingsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-2">Carregando reuniões...</p>
            </div>
          ) : filteredMeetings.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhuma reunião agendada</p>
              <Button variant="link" onClick={() => setIsScheduleOpen(true)} className="mt-2">
                Agendar primeira reunião
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">1:1 Reunião</h3>
                        {getStatusBadge(meeting.status)}
                        {meeting.recurrence && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {meeting.recurrence === "weekly" ? "Semanal" : 
                             meeting.recurrence === "biweekly" ? "Quinzenal" : "Mensal"}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(meeting.scheduled_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {meeting.duration_minutes} min
                        </span>
                        {meeting.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {meeting.location}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="mt-4 space-y-4">
          {templatesLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground mt-2">Carregando templates...</p>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">Nenhum template criado</p>
              <Button variant="link" onClick={() => setIsTemplateOpen(true)} className="mt-2">
                Criar primeiro template
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {template.questions.length} perguntas
                      </p>
                      {template.is_default && (
                        <Badge variant="secondary" className="mt-2">Padrão</Badge>
                      )}
                    </div>
                    <Button size="sm" variant="ghost">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

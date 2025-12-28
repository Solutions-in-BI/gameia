import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Palette, Smile } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrgTeam } from "@/hooks/useOrgTeams";

const TEAM_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#06b6d4", "#3b82f6", "#6b7280", "#1f2937",
];

const TEAM_ICONS = [
  "👥", "🚀", "⭐", "💡", "🎯", "🔥", "💪", "🏆",
  "📊", "💻", "🎨", "📱", "🛠️", "📈", "🌟", "⚡",
];

interface TeamFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team?: OrgTeam | null;
  members?: Array<{ user_id: string; nickname: string; avatar_url: string | null }>;
  onSubmit: (data: Partial<OrgTeam>) => void;
}

export function TeamFormModal({
  open,
  onOpenChange,
  team,
  members = [],
  onSubmit,
}: TeamFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(TEAM_COLORS[0]);
  const [icon, setIcon] = useState(TEAM_ICONS[0]);
  const [managerId, setManagerId] = useState<string>("");

  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description || "");
      setColor(team.color);
      setIcon(team.icon);
      setManagerId(team.manager_id || "");
    } else {
      setName("");
      setDescription("");
      setColor(TEAM_COLORS[0]);
      setIcon(TEAM_ICONS[0]);
      setManagerId("");
    }
  }, [team, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: team?.id,
      name,
      description: description || null,
      color,
      icon,
      manager_id: managerId || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {team ? "Editar Equipe" : "Nova Equipe"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da equipe</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Equipe de Vendas"
              required
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a equipe..."
              rows={2}
            />
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Cor
            </Label>
            <div className="flex flex-wrap gap-2">
              {TEAM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c ? "border-foreground scale-110" : "border-transparent"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Ícone
            </Label>
            <div className="flex flex-wrap gap-2">
              {TEAM_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl transition-all hover:bg-muted ${
                    icon === i ? "bg-muted ring-2 ring-primary" : ""
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Gestor */}
          {members.length > 0 && (
            <div className="space-y-2">
              <Label>Gestor (opcional)</Label>
              <Select value={managerId || "none"} onValueChange={(v) => setManagerId(v === "none" ? "" : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.user_id} value={m.user_id}>
                      {m.nickname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Preview */}
          <div className="rounded-lg border p-3" style={{ borderLeftColor: color, borderLeftWidth: "4px" }}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{icon}</span>
              <span className="font-medium">{name || "Nome da equipe"}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              {team ? "Salvar" : "Criar equipe"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

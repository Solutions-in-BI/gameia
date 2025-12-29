import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useState } from "react";

interface SalesAdvancedConfigProps {
  config: Record<string, any>;
  onChange: (key: string, value: any) => void;
  readonly?: boolean;
}

export function SalesAdvancedConfig({ config, onChange, readonly }: SalesAdvancedConfigProps) {
  const [newObjection, setNewObjection] = useState("");
  const objections = config.objections || [];

  const addObjection = () => {
    if (newObjection.trim()) {
      onChange("objections", [...objections, newObjection.trim()]);
      setNewObjection("");
    }
  };

  const removeObjection = (index: number) => {
    onChange("objections", objections.filter((_: string, i: number) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Produto/Serviço Principal</Label>
        <Input
          placeholder="Ex: Software de gestão empresarial"
          value={config.product || ""}
          onChange={e => onChange("product", e.target.value)}
          disabled={readonly}
        />
      </div>

      <div className="space-y-2">
        <Label>Tipo de Cliente</Label>
        <Select value={config.clientType || "b2b"} onValueChange={v => onChange("clientType", v)} disabled={readonly}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="b2b">B2B - Empresas</SelectItem>
            <SelectItem value="b2c">B2C - Consumidores</SelectItem>
            <SelectItem value="b2g">B2G - Governo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Nível da IA</Label>
        <Select value={config.aiLevel || "medium"} onValueChange={v => onChange("aiLevel", v)} disabled={readonly}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Fácil - Cliente receptivo</SelectItem>
            <SelectItem value="medium">Médio - Cliente neutro</SelectItem>
            <SelectItem value="hard">Difícil - Cliente resistente</SelectItem>
            <SelectItem value="adaptive">Adaptativo - Ajusta ao vendedor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Objeções Reais da Empresa</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Adicionar objeção..."
            value={newObjection}
            onChange={e => setNewObjection(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addObjection())}
            disabled={readonly}
          />
          <Button type="button" size="icon" onClick={addObjection} disabled={readonly}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {objections.map((obj: string, i: number) => (
            <Badge key={i} variant="secondary" className="flex items-center gap-1">
              {obj}
              {!readonly && <X className="h-3 w-3 cursor-pointer" onClick={() => removeObjection(i)} />}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Critérios de Sucesso</Label>
        <Textarea
          placeholder="Descreva os critérios que definem uma venda bem-sucedida..."
          value={config.successCriteria || ""}
          onChange={e => onChange("successCriteria", e.target.value)}
          disabled={readonly}
          rows={3}
        />
      </div>
    </div>
  );
}

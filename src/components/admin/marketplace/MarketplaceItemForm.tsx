import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useMarketplaceAdmin, MarketplaceItemAdmin, MarketplaceCategory, CreateItemInput } from "@/hooks/useMarketplaceAdmin";

const RARITY_OPTIONS = [
  { value: "common", label: "Comum", color: "bg-muted" },
  { value: "uncommon", label: "Incomum", color: "bg-green-500/20 text-green-400" },
  { value: "rare", label: "Raro", color: "bg-blue-500/20 text-blue-400" },
  { value: "epic", label: "Épico", color: "bg-purple-500/20 text-purple-400" },
  { value: "legendary", label: "Lendário", color: "bg-amber-500/20 text-amber-400" },
];

const EMOJI_SUGGESTIONS = [
  "👤", "🎭", "🦊", "🐱", "🐶", "🦁", "🐻", "🐼", "🐨", "🐯",
  "🖼️", "💎", "⭐", "🌟", "✨", "💫", "🔥", "❄️", "🌈", "🎨",
  "🎮", "🕹️", "🎲", "🃏", "🎯", "🏆", "🥇", "👑", "💰", "🪙",
  "🐍", "🦖", "🧠", "🎵", "🎶", "🎸", "🎹", "🐾", "🦋", "🌸",
];

const formSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  icon: z.string().min(1, "Selecione um ícone"),
  category: z.string().min(1, "Selecione uma categoria"),
  price: z.number().min(0, "Preço deve ser positivo"),
  rarity: z.string().min(1, "Selecione a raridade"),
  stock: z.number().optional().nullable(),
  is_limited_edition: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface MarketplaceItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  editItem: MarketplaceItemAdmin | null;
  categories: MarketplaceCategory[];
}

export function MarketplaceItemForm({ isOpen, onClose, editItem, categories }: MarketplaceItemFormProps) {
  const { createItem, updateItem } = useMarketplaceAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "🎁",
      category: "",
      price: 100,
      rarity: "common",
      stock: null,
      is_limited_edition: false,
      is_featured: false,
    },
  });

  // Preencher formulário quando editando
  useEffect(() => {
    if (editItem) {
      form.reset({
        name: editItem.name,
        description: editItem.description || "",
        icon: editItem.icon,
        category: editItem.category,
        price: editItem.price,
        rarity: editItem.rarity,
        stock: editItem.stock,
        is_limited_edition: editItem.is_limited_edition,
        is_featured: editItem.is_featured,
      });
    } else {
      form.reset({
        name: "",
        description: "",
        icon: "🎁",
        category: categories[0]?.slug || "",
        price: 100,
        rarity: "common",
        stock: null,
        is_limited_edition: false,
        is_featured: false,
      });
    }
  }, [editItem, categories, form]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    const input: CreateItemInput = {
      name: values.name,
      description: values.description,
      icon: values.icon,
      category: values.category,
      price: values.price,
      rarity: values.rarity,
      stock: values.is_limited_edition ? values.stock : null,
      is_limited_edition: values.is_limited_edition,
      is_featured: values.is_featured,
    };

    let result;
    if (editItem) {
      result = await updateItem(editItem.id, input);
    } else {
      result = await createItem(input);
    }

    setIsSubmitting(false);

    if (result.success) {
      onClose();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    form.setValue("icon", emoji);
  };

  const handleCustomEmojiAdd = () => {
    if (customEmoji.trim()) {
      form.setValue("icon", customEmoji.trim());
      setCustomEmoji("");
    }
  };

  const selectedIcon = form.watch("icon");
  const selectedRarity = form.watch("rarity");
  const isLimited = form.watch("is_limited_edition");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editItem ? "Editar Item" : "Novo Item"}</DialogTitle>
          <DialogDescription>
            {editItem ? "Atualize as informações do item" : "Configure um novo item para a loja"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview */}
            <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg">
              <div className="text-center">
                <span className="text-6xl">{selectedIcon}</span>
                <p className="mt-2 font-medium">{form.watch("name") || "Nome do item"}</p>
                <Badge 
                  variant="outline" 
                  className={RARITY_OPTIONS.find(r => r.value === selectedRarity)?.color}
                >
                  {RARITY_OPTIONS.find(r => r.value === selectedRarity)?.label}
                </Badge>
              </div>
            </div>

            {/* Ícone */}
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {EMOJI_SUGGESTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleEmojiSelect(emoji)}
                          className={`text-2xl p-2 rounded-lg transition-all hover:bg-muted ${
                            field.value === emoji ? "bg-primary/20 ring-2 ring-primary" : ""
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ou digite um emoji..."
                        value={customEmoji}
                        onChange={(e) => setCustomEmoji(e.target.value)}
                        className="w-32"
                      />
                      <Button type="button" variant="outline" onClick={handleCustomEmojiAdd}>
                        Usar
                      </Button>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome e Descrição */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                      >
                        <option value="">Selecione...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.icon} {cat.name}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o item..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preço e Raridade */}
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (moedas)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">🪙</span>
                        <Input
                          type="number"
                          min={0}
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rarity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Raridade</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {RARITY_OPTIONS.map((rarity) => (
                          <button
                            key={rarity.value}
                            type="button"
                            onClick={() => field.onChange(rarity.value)}
                            className={`px-3 py-1.5 rounded-full text-sm transition-all ${rarity.color} ${
                              field.value === rarity.value ? "ring-2 ring-primary" : ""
                            }`}
                          >
                            {rarity.label}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Opções */}
            <div className="space-y-4 border-t pt-4">
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Item em Destaque</FormLabel>
                      <FormDescription>Exibir na seção de destaque da loja</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_limited_edition"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between">
                    <div>
                      <FormLabel>Edição Limitada</FormLabel>
                      <FormDescription>Definir quantidade limitada em estoque</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isLimited && (
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade em estoque</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          placeholder="Ex: 100"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : editItem ? "Salvar alterações" : "Criar item"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

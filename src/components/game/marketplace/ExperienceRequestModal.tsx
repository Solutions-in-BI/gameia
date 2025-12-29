/**
 * Modal para solicitar uma experiência real
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Gift, Info } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ExperienceItem {
  id: string;
  item: {
    name: string;
    icon: string;
    description: string | null;
    usage_instructions: string | null;
  };
}

interface ExperienceRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ExperienceItem | null;
  onRequest: (inventoryId: string, preferredDate?: Date, notes?: string) => Promise<{ success: boolean }>;
}

const formSchema = z.object({
  preferredDate: z.date().optional(),
  notes: z.string().max(500, "Máximo de 500 caracteres").optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ExperienceRequestModal({ 
  isOpen, 
  onClose, 
  item, 
  onRequest 
}: ExperienceRequestModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredDate: undefined,
      notes: "",
    },
  });

  if (!item) return null;

  const { name, icon, description, usage_instructions } = item.item;

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    const result = await onRequest(item.id, values.preferredDate, values.notes);
    setIsSubmitting(false);
    if (result.success) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Solicitar Benefício
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para solicitar aprovação
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Item preview */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-4">
            <span className="text-4xl">{icon}</span>
            <div>
              <h3 className="font-semibold">{name}</h3>
              {description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          {usage_instructions && (
            <div className="flex gap-3 p-3 bg-blue-500/10 rounded-lg mb-4">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-700">Instruções de uso</p>
                <p className="text-sm text-blue-600/80">{usage_instructions}</p>
              </div>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="preferredDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data preferida (opcional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: ptBR })
                            ) : (
                              "Selecione uma data"
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Alguma informação adicional para o gestor..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Enviando..." : "Enviar solicitação"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

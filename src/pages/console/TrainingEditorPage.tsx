import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TrainingEditorLayout } from "@/components/console/training-editor/TrainingEditorLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Training {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  difficulty: string | null;
  icon: string | null;
  is_active: boolean;
  xp_reward: number;
  coins_reward: number;
  estimated_hours: number;
}

export default function TrainingEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [training, setTraining] = useState<Training | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTraining() {
      if (!id) return;
      
      const { data, error } = await supabase
        .from("trainings")
        .select("id, name, description, category, difficulty, icon, is_active, xp_reward, coins_reward, estimated_hours")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching training:", error);
        toast.error("Erro ao carregar treinamento");
        navigate("/console");
        return;
      }

      setTraining(data);
      setIsLoading(false);
    }

    fetchTraining();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!training) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-4">
        <p className="text-muted-foreground">Treinamento não encontrado</p>
        <Button variant="outline" onClick={() => navigate("/console")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <TrainingEditorLayout 
        training={training} 
        onBack={() => navigate("/console")}
      />
    </div>
  );
}

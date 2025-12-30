import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProgressEvent {
  user_id: string;
  organization_id?: string;
  event_type: string;
  source_type: "training" | "module" | "game" | "challenge" | "cognitive_test";
  source_id: string;
  source_name?: string;
  score?: number;
  skill_ids?: string[];
  metadata?: Record<string, unknown>;
}

// Configuração de impacto por tipo de fonte
const PROGRESS_IMPACT = {
  training: { base: 25, max: 40 },
  module: { base: 8, max: 15 },
  game: { base: 5, max: 12 },
  challenge: { base: 15, max: 30 },
  cognitive_test: { base: 10, max: 20 },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const event: ProgressEvent = await req.json();
    console.log("Processing PDI progress update for event:", event);

    if (!event.user_id || !event.source_type || !event.source_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: user_id, source_type, source_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Buscar metas ativas do usuário que podem ser impactadas
    const { data: userGoals, error: goalsError } = await supabase
      .from("development_goals")
      .select(`
        id,
        title,
        progress,
        plan_id,
        skill_id,
        linked_training_ids,
        linked_challenge_ids,
        linked_cognitive_test_ids,
        related_games,
        auto_progress_enabled,
        xp_reward,
        weight
      `)
      .eq("status", "in_progress")
      .or(`plan_id.in.(
        SELECT id FROM development_plans 
        WHERE user_id = '${event.user_id}' 
        AND status = 'active'
      )`);

    if (goalsError) {
      console.error("Error fetching goals:", goalsError);
      throw goalsError;
    }

    // Buscar planos ativos do usuário para filtrar metas
    const { data: activePlans, error: plansError } = await supabase
      .from("development_plans")
      .select("id")
      .eq("user_id", event.user_id)
      .eq("status", "active");

    if (plansError) {
      console.error("Error fetching plans:", plansError);
      throw plansError;
    }

    const activePlanIds = activePlans?.map(p => p.id) || [];
    
    // Filtrar metas dos planos ativos
    const eligibleGoals = userGoals?.filter(goal => 
      goal.auto_progress_enabled !== false && 
      activePlanIds.includes(goal.plan_id)
    ) || [];

    console.log(`Found ${eligibleGoals.length} eligible goals for user ${event.user_id}`);

    const updatedGoals: Array<{ goal_id: string; progress_delta: number; new_progress: number }> = [];
    let totalXpEarned = 0;

    for (const goal of eligibleGoals) {
      let shouldUpdate = false;
      let matchReason = "";

      // Verificar conexão direta com a fonte
      switch (event.source_type) {
        case "training":
          if (goal.linked_training_ids?.includes(event.source_id)) {
            shouldUpdate = true;
            matchReason = "linked_training";
          }
          break;
        case "challenge":
          if (goal.linked_challenge_ids?.includes(event.source_id)) {
            shouldUpdate = true;
            matchReason = "linked_challenge";
          }
          break;
        case "cognitive_test":
          if (goal.linked_cognitive_test_ids?.includes(event.source_id)) {
            shouldUpdate = true;
            matchReason = "linked_cognitive_test";
          }
          break;
        case "game":
          if (goal.related_games?.includes(event.source_id)) {
            shouldUpdate = true;
            matchReason = "related_game";
          }
          break;
      }

      // Verificar conexão via skill
      if (!shouldUpdate && event.skill_ids?.length && goal.skill_id) {
        if (event.skill_ids.includes(goal.skill_id)) {
          shouldUpdate = true;
          matchReason = "skill_match";
        }
      }

      if (!shouldUpdate) continue;

      // Calcular impacto no progresso
      const impactConfig = PROGRESS_IMPACT[event.source_type];
      let progressDelta = impactConfig.base;

      // Ajustar baseado no score se disponível
      if (event.score !== undefined) {
        const scoreMultiplier = Math.min(event.score / 100, 1.5);
        progressDelta = Math.round(progressDelta * scoreMultiplier);
      }

      // Garantir que não exceda o máximo
      progressDelta = Math.min(progressDelta, impactConfig.max);

      // Calcular novo progresso (não pode exceder 100)
      const currentProgress = goal.progress || 0;
      const newProgress = Math.min(currentProgress + progressDelta, 100);
      const actualDelta = newProgress - currentProgress;

      if (actualDelta <= 0) continue;

      // Calcular XP proporcional
      const xpReward = goal.xp_reward || 100;
      const xpEarned = Math.round((actualDelta / 100) * xpReward);
      totalXpEarned += xpEarned;

      // Atualizar meta
      const { error: updateError } = await supabase
        .from("development_goals")
        .update({
          progress: newProgress,
          last_auto_update: new Date().toISOString(),
          stagnant_since: null,
          status: newProgress >= 100 ? "completed" : "in_progress",
        })
        .eq("id", goal.id);

      if (updateError) {
        console.error(`Error updating goal ${goal.id}:`, updateError);
        continue;
      }

      // Registrar evento de progresso
      const { error: eventError } = await supabase
        .from("goal_progress_events")
        .insert({
          goal_id: goal.id,
          user_id: event.user_id,
          organization_id: event.organization_id,
          source_type: event.source_type,
          source_id: event.source_id,
          source_name: event.source_name,
          progress_before: currentProgress,
          progress_after: newProgress,
          progress_delta: actualDelta,
          xp_earned: xpEarned,
          metadata: {
            match_reason: matchReason,
            score: event.score,
            event_type: event.event_type,
          },
        });

      if (eventError) {
        console.error(`Error logging progress event for goal ${goal.id}:`, eventError);
      }

      updatedGoals.push({
        goal_id: goal.id,
        progress_delta: actualDelta,
        new_progress: newProgress,
      });

      // Marcar ações relacionadas como concluídas
      await supabase
        .from("pdi_linked_actions")
        .update({ completed_at: new Date().toISOString() })
        .eq("goal_id", goal.id)
        .eq("action_type", event.source_type)
        .eq("action_id", event.source_id);

      console.log(`Updated goal ${goal.id}: ${currentProgress}% -> ${newProgress}% (+${actualDelta}%)`);
    }

    // Creditar XP ao usuário se houve progresso
    if (totalXpEarned > 0) {
      const { data: userData, error: userError } = await supabase
        .from("user_balances")
        .select("xp")
        .eq("user_id", event.user_id)
        .single();

      if (!userError && userData) {
        await supabase
          .from("user_balances")
          .update({ xp: (userData.xp || 0) + totalXpEarned })
          .eq("user_id", event.user_id);
      }

      // Registrar evento de XP
      await supabase.from("core_events").insert({
        user_id: event.user_id,
        organization_id: event.organization_id,
        event_type: "PDI_PROGRESS_AUTO",
        xp_earned: totalXpEarned,
        metadata: {
          goals_updated: updatedGoals.length,
          source_type: event.source_type,
          source_id: event.source_id,
        },
      });
    }

    const response = {
      success: true,
      goals_updated: updatedGoals.length,
      total_xp_earned: totalXpEarned,
      updates: updatedGoals,
    };

    console.log("PDI progress update completed:", response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in update-pdi-progress:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

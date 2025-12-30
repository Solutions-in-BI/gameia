/**
 * detect-patterns - Edge Function para detecção de padrões e geração de alertas
 * 
 * Analisa core_events, user_skill_levels e dados de evolução para detectar:
 * - Skills estagnadas (> 14 dias sem evolução)
 * - Streaks quebrados (alto impacto se > 7 dias)
 * - Inatividade prolongada (sem eventos em X dias)
 * - Queda de performance (score médio caindo)
 * - Metas de PDI atrasadas
 * - Treinamentos obrigatórios pendentes
 * - Evolução positiva (reconhecimento)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PatternAlert {
  type: string;
  severity: "info" | "warning" | "critical" | "positive";
  userId: string;
  organizationId: string;
  title: string;
  description: string;
  suggestedAction?: string;
  suggestedActionType?: string;
  suggestedActionId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[detect-patterns] Starting pattern detection...");

    const alerts: PatternAlert[] = [];
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // 1. Detectar skills estagnadas (> 14 dias sem evolução)
    console.log("[detect-patterns] Checking stagnant skills...");
    
    const { data: stagnantSkills, error: stagnantError } = await supabase
      .from("user_skill_levels")
      .select(`
        id,
        user_id,
        skill_id,
        last_practiced,
        current_level,
        skill_configurations!inner(name, organization_id)
      `)
      .lt("last_practiced", twoWeeksAgo.toISOString())
      .eq("is_unlocked", true);

    if (stagnantError) {
      console.error("[detect-patterns] Error fetching stagnant skills:", stagnantError);
    } else if (stagnantSkills) {
      console.log(`[detect-patterns] Found ${stagnantSkills.length} stagnant skills`);
      
      for (const skill of stagnantSkills) {
        const skillConfig = skill.skill_configurations as unknown as { name: string; organization_id: string };
        const daysSinceActivity = Math.floor(
          (now.getTime() - new Date(skill.last_practiced || now).getTime()) / (24 * 60 * 60 * 1000)
        );

        alerts.push({
          type: "skill_stagnation",
          severity: daysSinceActivity > 21 ? "warning" : "info",
          userId: skill.user_id,
          organizationId: skillConfig?.organization_id || "",
          title: `Skill estagnada há ${daysSinceActivity} dias`,
          description: `A skill "${skillConfig?.name}" não evolui há ${daysSinceActivity} dias. Recomenda-se iniciar um treinamento ou jogo relacionado.`,
          suggestedAction: "Iniciar atividade para evoluir a skill",
          suggestedActionType: "game",
          relatedEntityType: "skill",
          relatedEntityId: skill.skill_id,
          metadata: { days_inactive: daysSinceActivity, skill_level: skill.current_level }
        });
      }
    }

    // 2. Detectar streaks quebrados recentemente (últimas 24h)
    console.log("[detect-patterns] Checking broken streaks...");
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const { data: brokenStreaks, error: streakError } = await supabase
      .from("core_events")
      .select(`id, user_id, organization_id, metadata, created_at`)
      .eq("event_type", "STREAK_QUEBRADO")
      .gte("created_at", yesterday.toISOString());

    if (streakError) {
      console.error("[detect-patterns] Error fetching broken streaks:", streakError);
    } else if (brokenStreaks) {
      console.log(`[detect-patterns] Found ${brokenStreaks.length} broken streaks`);
      
      for (const event of brokenStreaks) {
        const previousStreak = (event.metadata as Record<string, unknown>)?.previous_streak as number || 0;
        
        if (previousStreak >= 7) {
          alerts.push({
            type: "streak_broken",
            severity: previousStreak >= 14 ? "critical" : "warning",
            userId: event.user_id,
            organizationId: event.organization_id || "",
            title: `Streak de ${previousStreak} dias quebrado`,
            description: `Você perdeu um streak de ${previousStreak} dias. Volte a jogar para reconstruir!`,
            suggestedAction: "Jogar para iniciar novo streak",
            suggestedActionType: "game",
            metadata: { previous_streak: previousStreak }
          });
        }
      }
    }

    // 3. Detectar usuários inativos (sem eventos nos últimos 7 dias)
    console.log("[detect-patterns] Checking inactive users...");
    
    const { data: activeUsers } = await supabase
      .from("core_events")
      .select("user_id")
      .gte("created_at", weekAgo.toISOString());

    const activeUserIds = new Set(activeUsers?.map(e => e.user_id) || []);

    const { data: allMembers, error: membersError } = await supabase
      .from("organization_members")
      .select(`user_id, organization_id`)
      .eq("is_active", true);

    if (!membersError && allMembers) {
      for (const member of allMembers) {
        if (!activeUserIds.has(member.user_id)) {
          // Check if alert already exists
          const { data: existingAlert } = await supabase
            .from("evolution_alerts")
            .select("id")
            .eq("user_id", member.user_id)
            .eq("alert_type", "inactivity")
            .eq("is_dismissed", false)
            .gte("created_at", weekAgo.toISOString())
            .limit(1);

          if (!existingAlert || existingAlert.length === 0) {
            alerts.push({
              type: "inactivity",
              severity: "warning",
              userId: member.user_id,
              organizationId: member.organization_id,
              title: "Você está inativo há 7+ dias",
              description: "Continue sua jornada de evolução! Complete um treinamento ou jogue para manter seu progresso.",
              suggestedAction: "Retomar atividades",
              suggestedActionType: "training",
              metadata: { days_inactive: 7 }
            });
          }
        }
      }
    }

    // 4. Detectar queda de performance (score médio caiu >20%)
    console.log("[detect-patterns] Checking performance drops...");
    
    const { data: recentScores } = await supabase
      .from("core_events")
      .select("user_id, organization_id, score, created_at")
      .eq("event_type", "JOGO_CONCLUIDO")
      .not("score", "is", null)
      .gte("created_at", twoWeeksAgo.toISOString());

    if (recentScores && recentScores.length > 0) {
      const userScores: Record<string, { recent: number[]; previous: number[]; orgId: string }> = {};
      
      for (const event of recentScores) {
        if (!userScores[event.user_id]) {
          userScores[event.user_id] = { recent: [], previous: [], orgId: event.organization_id || "" };
        }
        
        const eventDate = new Date(event.created_at);
        if (eventDate >= weekAgo) {
          userScores[event.user_id].recent.push(event.score || 0);
        } else {
          userScores[event.user_id].previous.push(event.score || 0);
        }
      }

      for (const [userId, scores] of Object.entries(userScores)) {
        if (scores.recent.length >= 3 && scores.previous.length >= 3) {
          const recentAvg = scores.recent.reduce((a, b) => a + b, 0) / scores.recent.length;
          const previousAvg = scores.previous.reduce((a, b) => a + b, 0) / scores.previous.length;
          
          if (previousAvg > 0) {
            const dropPercent = ((previousAvg - recentAvg) / previousAvg) * 100;
            
            if (dropPercent >= 20) {
              alerts.push({
                type: "performance_drop",
                severity: dropPercent >= 40 ? "critical" : "warning",
                userId,
                organizationId: scores.orgId,
                title: `Queda de ${Math.round(dropPercent)}% na performance`,
                description: `Seu desempenho caiu de ${Math.round(previousAvg)}% para ${Math.round(recentAvg)}%. Considere revisar treinamentos relacionados.`,
                suggestedAction: "Revisar treinamentos",
                suggestedActionType: "training",
                metadata: {
                  drop_percent: Math.round(dropPercent),
                  recent_avg: Math.round(recentAvg),
                  previous_avg: Math.round(previousAvg)
                }
              });
            }
          }
        }
      }
    }

    // 5. Detectar metas de PDI atrasadas
    console.log("[detect-patterns] Checking overdue PDI goals...");
    
    const { data: overdueGoals } = await supabase
      .from("development_goals")
      .select(`
        id,
        title,
        progress,
        target_date,
        plan_id,
        development_plans!inner(user_id, organization_id, status)
      `)
      .lt("target_date", now.toISOString())
      .lt("progress", 100)
      .eq("status", "active");

    if (overdueGoals) {
      console.log(`[detect-patterns] Found ${overdueGoals.length} overdue goals`);
      
      for (const goal of overdueGoals) {
        const plan = goal.development_plans as unknown as { user_id: string; organization_id: string; status: string };
        if (plan?.status === "active") {
          const daysOverdue = Math.floor(
            (now.getTime() - new Date(goal.target_date!).getTime()) / (24 * 60 * 60 * 1000)
          );

          alerts.push({
            type: "goal_overdue",
            severity: daysOverdue > 14 ? "critical" : "warning",
            userId: plan.user_id,
            organizationId: plan.organization_id || "",
            title: `Meta de PDI atrasada`,
            description: `A meta "${goal.title}" está ${daysOverdue} dias atrasada com ${goal.progress}% de progresso.`,
            suggestedAction: "Atualizar progresso da meta",
            suggestedActionType: "pdi",
            suggestedActionId: goal.plan_id,
            relatedEntityType: "goal",
            relatedEntityId: goal.id,
            metadata: { days_overdue: daysOverdue, progress: goal.progress }
          });
        }
      }
    }

    // 6. Detectar evolução positiva (streak alto, conquistas)
    console.log("[detect-patterns] Checking positive evolution...");
    
    const { data: highStreaks } = await supabase
      .from("user_streaks")
      .select("user_id, current_streak, organization_id")
      .gte("current_streak", 7)
      .eq("is_active", true);

    if (highStreaks) {
      for (const streak of highStreaks) {
        // Only create positive alert if not already created this week
        const { data: existing } = await supabase
          .from("evolution_alerts")
          .select("id")
          .eq("user_id", streak.user_id)
          .eq("alert_type", "positive_streak")
          .gte("created_at", weekAgo.toISOString())
          .limit(1);

        if (!existing || existing.length === 0) {
          alerts.push({
            type: "positive_streak",
            severity: "positive",
            userId: streak.user_id,
            organizationId: streak.organization_id || "",
            title: `🔥 Streak de ${streak.current_streak} dias!`,
            description: `Parabéns! Você está em uma sequência de ${streak.current_streak} dias de atividade. Continue assim!`,
            suggestedAction: "Ver evolução",
            suggestedActionType: "view",
            metadata: { current_streak: streak.current_streak }
          });
        }
      }
    }

    console.log(`[detect-patterns] Generated ${alerts.length} alerts`);

    // Insert alerts into evolution_alerts table
    let createdCount = 0;
    
    for (const alert of alerts) {
      const { error: insertError } = await supabase
        .from("evolution_alerts")
        .insert({
          user_id: alert.userId,
          organization_id: alert.organizationId || null,
          alert_type: alert.type,
          severity: alert.severity,
          title: alert.title,
          description: alert.description,
          suggested_action: alert.suggestedAction,
          suggested_action_type: alert.suggestedActionType,
          suggested_action_id: alert.suggestedActionId,
          related_entity_type: alert.relatedEntityType,
          related_entity_id: alert.relatedEntityId,
          metadata: alert.metadata || {},
          is_read: false,
          is_dismissed: false
        });

      if (insertError) {
        console.error("[detect-patterns] Error creating alert:", insertError);
      } else {
        createdCount++;
      }
    }

    console.log(`[detect-patterns] Created ${createdCount} alerts in evolution_alerts table`);

    // Also create notifications for managers (for critical alerts only)
    let managerNotifications = 0;
    const criticalAlerts = alerts.filter(a => a.severity === "critical");
    
    for (const alert of criticalAlerts) {
      if (!alert.organizationId) continue;

      const { data: managers } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", alert.organizationId)
        .in("org_role", ["owner", "admin", "manager"]);

      for (const manager of managers || []) {
        if (manager.user_id === alert.userId) continue;

        const { error: notifError } = await supabase
          .from("notifications")
          .insert({
            user_id: manager.user_id,
            type: "alert",
            title: `[Equipe] ${alert.title}`,
            message: alert.description,
            data: {
              alert_type: alert.type,
              severity: alert.severity,
              target_user_id: alert.userId,
              suggested_action: alert.suggestedAction
            },
            is_read: false
          });

        if (!notifError) managerNotifications++;
      }
    }

    console.log(`[detect-patterns] Created ${managerNotifications} manager notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        alertsGenerated: alerts.length,
        alertsCreated: createdCount,
        managerNotifications,
        summary: {
          skillStagnation: alerts.filter(a => a.type === "skill_stagnation").length,
          streakBroken: alerts.filter(a => a.type === "streak_broken").length,
          inactivity: alerts.filter(a => a.type === "inactivity").length,
          performanceDrop: alerts.filter(a => a.type === "performance_drop").length,
          goalOverdue: alerts.filter(a => a.type === "goal_overdue").length,
          positiveStreak: alerts.filter(a => a.type === "positive_streak").length
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[detect-patterns] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

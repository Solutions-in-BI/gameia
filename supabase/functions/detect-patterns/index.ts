/**
 * detect-patterns - Edge Function para detecção de padrões e geração de alertas
 * 
 * Analisa core_events e user_streaks para detectar:
 * - Streaks quebrados (alto impacto se > 7 dias)
 * - Inatividade prolongada (sem eventos em X dias)
 * - Queda de performance (score médio caindo)
 * - Metas não atingidas
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PatternAlert {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  userId: string;
  organizationId: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  suggestedAction?: string;
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

    // 1. Detectar streaks quebrados recentemente (últimas 24h)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: brokenStreaks, error: streakError } = await supabase
      .from("core_events")
      .select(`
        id,
        user_id,
        organization_id,
        metadata,
        created_at
      `)
      .eq("event_type", "STREAK_QUEBRADO")
      .gte("created_at", yesterday.toISOString())
      .order("created_at", { ascending: false });

    if (streakError) {
      console.error("[detect-patterns] Error fetching broken streaks:", streakError);
    } else if (brokenStreaks) {
      console.log(`[detect-patterns] Found ${brokenStreaks.length} broken streaks`);
      
      for (const event of brokenStreaks) {
        const previousStreak = (event.metadata as Record<string, unknown>)?.previous_streak as number || 0;
        
        if (previousStreak >= 7) {
          // Buscar nome do usuário
          const { data: profile } = await supabase
            .from("profiles")
            .select("nickname, full_name")
            .eq("id", event.user_id)
            .single();

          const userName = profile?.full_name || profile?.nickname || "Membro";
          
          alerts.push({
            type: "streak_broken",
            severity: previousStreak >= 14 ? "high" : "medium",
            userId: event.user_id,
            organizationId: event.organization_id || "",
            title: `Streak de ${previousStreak} dias quebrado`,
            message: `${userName} perdeu um streak de ${previousStreak} dias consecutivos. Considere agendar um check-in.`,
            data: {
              previous_streak: previousStreak,
              user_name: userName,
              event_id: event.id
            },
            suggestedAction: "schedule_1on1"
          });
        }
      }
    }

    // 2. Detectar usuários inativos (sem eventos nos últimos 7 dias)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: activeUsers, error: activeError } = await supabase
      .from("core_events")
      .select("user_id, organization_id")
      .gte("created_at", weekAgo.toISOString());

    if (activeError) {
      console.error("[detect-patterns] Error fetching active users:", activeError);
    } else {
      // Pegar IDs únicos de usuários ativos
      const activeUserIds = new Set(activeUsers?.map(e => e.user_id) || []);

      // Buscar todos os membros de organizações
      const { data: allMembers, error: membersError } = await supabase
        .from("organization_members")
        .select(`
          user_id,
          organization_id,
          profiles!inner(nickname, full_name)
        `)
        .eq("is_active", true);

      if (!membersError && allMembers) {
        for (const member of allMembers) {
          if (!activeUserIds.has(member.user_id)) {
            const profile = member.profiles as unknown as { nickname?: string; full_name?: string };
            const userName = profile?.full_name || profile?.nickname || "Membro";

            // Verificar se já existe alerta recente para este usuário
            const { data: existingAlert } = await supabase
              .from("notifications")
              .select("id")
              .eq("data->user_id", member.user_id)
              .eq("type", "alert")
              .gte("created_at", weekAgo.toISOString())
              .limit(1);

            if (!existingAlert || existingAlert.length === 0) {
              alerts.push({
                type: "user_inactive",
                severity: "medium",
                userId: member.user_id,
                organizationId: member.organization_id,
                title: "Usuário inativo há 7+ dias",
                message: `${userName} não teve nenhuma atividade nos últimos 7 dias.`,
                data: {
                  user_id: member.user_id,
                  user_name: userName,
                  days_inactive: 7
                },
                suggestedAction: "send_reminder"
              });
            }
          }
        }
      }
    }

    // 3. Detectar queda de performance (score médio caiu >20% nos últimos 7 dias vs 7 dias anteriores)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: recentScores, error: scoresError } = await supabase
      .from("core_events")
      .select("user_id, organization_id, score, created_at")
      .eq("event_type", "JOGO_CONCLUIDO")
      .not("score", "is", null)
      .gte("created_at", twoWeeksAgo.toISOString());

    if (!scoresError && recentScores && recentScores.length > 0) {
      // Agrupar por usuário e calcular médias
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
              const { data: profile } = await supabase
                .from("profiles")
                .select("nickname, full_name")
                .eq("id", userId)
                .single();

              const userName = profile?.full_name || profile?.nickname || "Membro";

              alerts.push({
                type: "performance_drop",
                severity: dropPercent >= 40 ? "high" : "medium",
                userId,
                organizationId: scores.orgId,
                title: `Queda de performance: ${Math.round(dropPercent)}%`,
                message: `${userName} teve uma queda de ${Math.round(dropPercent)}% na performance esta semana.`,
                data: {
                  user_id: userId,
                  user_name: userName,
                  drop_percent: Math.round(dropPercent),
                  recent_avg: Math.round(recentAvg),
                  previous_avg: Math.round(previousAvg)
                },
                suggestedAction: "assign_training"
              });
            }
          }
        }
      }
    }

    console.log(`[detect-patterns] Generated ${alerts.length} alerts`);

    // 4. Criar notificações para gestores
    let createdCount = 0;
    
    for (const alert of alerts) {
      if (!alert.organizationId) continue;

      // Buscar gestores da organização
      const { data: managers, error: managersError } = await supabase
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", alert.organizationId)
        .in("org_role", ["owner", "admin", "manager"]);

      if (managersError) {
        console.error("[detect-patterns] Error fetching managers:", managersError);
        continue;
      }

      for (const manager of managers || []) {
        // Não notificar se o alerta é sobre o próprio gestor
        if (manager.user_id === alert.userId) continue;

        const { error: insertError } = await supabase
          .from("notifications")
          .insert({
            user_id: manager.user_id,
            type: "alert",
            title: alert.title,
            message: alert.message,
            data: {
              ...alert.data,
              alert_type: alert.type,
              severity: alert.severity,
              suggested_action: alert.suggestedAction,
              target_user_id: alert.userId
            },
            is_read: false
          });

        if (insertError) {
          console.error("[detect-patterns] Error creating notification:", insertError);
        } else {
          createdCount++;
        }
      }
    }

    console.log(`[detect-patterns] Created ${createdCount} notifications for managers`);

    return new Response(
      JSON.stringify({
        success: true,
        alertsGenerated: alerts.length,
        notificationsCreated: createdCount,
        summary: {
          streakBroken: alerts.filter(a => a.type === "streak_broken").length,
          userInactive: alerts.filter(a => a.type === "user_inactive").length,
          performanceDrop: alerts.filter(a => a.type === "performance_drop").length
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
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  type: 'streak_reminder' | 'weekly_summary' | 'welcome' | 'achievement';
  data: Record<string, any>;
}

const emailTemplates = {
  streak_reminder: (data: any) => ({
    subject: '🔥 Seu streak está em risco!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f59e0b;">🔥 Não perca seu streak!</h1>
        <p>Olá <strong>${data.nickname || 'Jogador'}</strong>!</p>
        <p>Você tem um streak de <strong>${data.currentStreak} dias</strong> consecutivos. Não deixe ele zerar!</p>
        <p>Jogue hoje para manter sua sequência e ganhar recompensas extras.</p>
        <a href="${data.appUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Jogar Agora
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          GAMEIA - Gamificação Empresarial
        </p>
      </div>
    `,
  }),
  
  weekly_summary: (data: any) => ({
    subject: '📊 Seu resumo semanal chegou!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1;">📊 Resumo da Semana</h1>
        <p>Olá <strong>${data.nickname || 'Jogador'}</strong>!</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 12px; margin: 20px 0;">
          <p><strong>XP ganho:</strong> ${data.xpGained || 0}</p>
          <p><strong>Moedas ganhas:</strong> ${data.coinsGained || 0}</p>
          <p><strong>Jogos completados:</strong> ${data.gamesPlayed || 0}</p>
          <p><strong>Streak atual:</strong> ${data.currentStreak || 0} dias</p>
        </div>
        <p>Continue assim! 🎮</p>
        <a href="${data.appUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Ver Dashboard
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          GAMEIA - Gamificação Empresarial
        </p>
      </div>
    `,
  }),
  
  welcome: (data: any) => ({
    subject: '🎮 Bem-vindo ao GAMEIA!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #6366f1;">🎮 Bem-vindo ao GAMEIA!</h1>
        <p>Olá <strong>${data.nickname || 'Jogador'}</strong>!</p>
        <p>Sua conta foi criada com sucesso. Comece sua jornada de desenvolvimento profissional através de jogos!</p>
        <ul>
          <li>🎯 Complete desafios diários</li>
          <li>🏆 Ganhe badges e conquistas</li>
          <li>📈 Desenvolva suas competências</li>
          <li>🤝 Conecte-se com colegas</li>
        </ul>
        <a href="${data.appUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Começar Agora
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          GAMEIA - Gamificação Empresarial
        </p>
      </div>
    `,
  }),
  
  achievement: (data: any) => ({
    subject: `🏆 Nova conquista: ${data.achievementName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #f59e0b;">🏆 Parabéns!</h1>
        <p>Olá <strong>${data.nickname || 'Jogador'}</strong>!</p>
        <p>Você desbloqueou uma nova conquista:</p>
        <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
          <h2 style="margin: 0; color: #92400e;">${data.achievementName}</h2>
          <p style="margin: 8px 0 0 0; color: #b45309;">${data.achievementDescription}</p>
        </div>
        <p>Continue jogando para desbloquear mais conquistas!</p>
        <a href="${data.appUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
          Ver Conquistas
        </a>
        <p style="color: #666; font-size: 12px; margin-top: 24px;">
          GAMEIA - Gamificação Empresarial
        </p>
      </div>
    `,
  }),
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured - email sending disabled");
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Email service not configured" 
        }),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const { to, type, data }: EmailRequest = await req.json();
    
    if (!to || !type) {
      throw new Error("Missing required fields: to, type");
    }

    const template = emailTemplates[type];
    if (!template) {
      throw new Error(`Unknown email type: ${type}`);
    }

    const { subject, html } = template(data);

    console.log(`Sending ${type} email to ${to}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "GAMEIA <noreply@resend.dev>",
        to: [to],
        subject,
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend API error:", result);
      throw new Error(result.message || "Failed to send email");
    }

    console.log("Email sent successfully:", result);

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { 
        status: 200, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  } catch (error: any) {
    console.error("Error in send-notification-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);

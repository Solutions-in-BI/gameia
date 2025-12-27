import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { theme, difficulty } = await req.json();

    const systemPrompt = `Você é um especialista em treinamento corporativo e criação de cenários de decisão empresarial.
Crie um cenário de decisão realista e desafiador para treinar gestores.

REGRAS IMPORTANTES:
1. O cenário deve ser realista e baseado em situações empresariais reais
2. Deve haver exatamente 4 opções de decisão
3. Apenas UMA opção deve ser a "ótima" (is_optimal: true)
4. As outras devem ter diferentes níveis de impacto (positivo, neutro ou negativo)
5. Cada opção deve ter feedback explicando as consequências
6. Os scores devem ser coerentes: impact_score (-100 a 100), cost_score (0-100), risk_score (0-100)

Responda APENAS com um JSON válido no formato:
{
  "title": "Título do cenário",
  "context": "Descrição detalhada da situação (2-3 frases)",
  "difficulty": "${difficulty || 'medium'}",
  "xp_reward": ${difficulty === 'hard' ? 150 : difficulty === 'easy' ? 75 : 100},
  "options": [
    {
      "option_text": "Texto da opção 1",
      "feedback": "Feedback explicando consequências",
      "is_optimal": false,
      "impact_score": 50,
      "cost_score": 30,
      "risk_score": 40
    },
    ...mais 3 opções
  ]
}`;

    const userPrompt = theme 
      ? `Crie um cenário de decisão empresarial sobre o tema: "${theme}". Dificuldade: ${difficulty || 'medium'}.`
      : `Crie um cenário de decisão empresarial interessante e desafiador. Dificuldade: ${difficulty || 'medium'}. 
         Escolha um tema entre: liderança, gestão de crise, negociação, inovação, gestão de pessoas, estratégia de mercado, transformação digital, sustentabilidade corporativa.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos insuficientes. Adicione fundos na sua conta." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Erro ao gerar cenário com IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Resposta vazia da IA");
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    const scenario = JSON.parse(jsonStr.trim());

    // Validate structure
    if (!scenario.title || !scenario.context || !scenario.options || scenario.options.length !== 4) {
      throw new Error("Estrutura do cenário inválida");
    }

    return new Response(JSON.stringify(scenario), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating scenario:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

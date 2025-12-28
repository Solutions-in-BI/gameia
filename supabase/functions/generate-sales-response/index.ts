import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  persona: {
    name: string;
    personality: string;
    role: string;
    company_name: string;
    company_type: string;
    pain_points: string[];
    decision_factors: string[];
  };
  stage: {
    stage_key: string;
    stage_label: string;
    description: string;
    tips: string;
  };
  conversation_history: Array<{
    sender: 'client' | 'player';
    text: string;
  }>;
  player_response?: string;
  rapport: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { persona, stage, conversation_history, player_response, rapport }: RequestBody = await req.json();

    const systemPrompt = `Você é ${persona.name}, ${persona.role} da ${persona.company_name} (${persona.company_type}).

PERSONALIDADE: ${persona.personality}

PONTOS DE DOR:
${persona.pain_points?.map(p => `- ${p}`).join('\n') || '- Busca soluções eficientes'}

FATORES DE DECISÃO:
${persona.decision_factors?.map(f => `- ${f}`).join('\n') || '- Custo-benefício'}

ESTÁGIO ATUAL DA CONVERSA: ${stage.stage_label}
${stage.description}

NÍVEL DE RAPPORT ATUAL: ${rapport}% (0-100)
- Se rapport < 30%: Você está desconfiado e resistente
- Se rapport 30-60%: Você está neutro, mas aberto
- Se rapport 60-80%: Você está interessado e engajado
- Se rapport > 80%: Você está muito receptivo e próximo de fechar negócio

REGRAS:
1. Responda de forma natural e realista como um cliente de vendas
2. Mantenha sua personalidade consistente
3. Faça objeções realistas baseadas nos seus pontos de dor
4. Se o vendedor usar técnicas boas, demonstre mais interesse
5. Se o vendedor for muito agressivo ou técnico demais, demonstre resistência
6. Suas respostas devem ter 1-3 frases, seja conciso
7. Nunca quebre o personagem ou mencione que é uma simulação

HISTÓRICO DA CONVERSA:
${conversation_history.map(m => `${m.sender === 'client' ? persona.name : 'Vendedor'}: ${m.text}`).join('\n')}`;

    const userPrompt = player_response 
      ? `O vendedor respondeu: "${player_response}"

Baseado na sua personalidade, no estágio atual (${stage.stage_label}) e no rapport (${rapport}%), responda de forma natural.

Retorne um JSON com:
{
  "client_response": "Sua resposta como cliente",
  "rapport_change": número entre -15 e +15 (negativo se resposta foi ruim, positivo se foi boa),
  "score_change": número entre 0 e 100 (baseado na qualidade da resposta do vendedor),
  "feedback": "Dica curta para o jogador sobre o que foi bom ou ruim na abordagem",
  "should_advance_stage": boolean (true se a conversa deve avançar para o próximo estágio),
  "skills_impact": {
    "rapport": número 0-20,
    "discovery": número 0-20,
    "presentation": número 0-20,
    "objection": número 0-20,
    "closing": número 0-20
  }
}`
      : `Inicie a conversa como cliente no estágio "${stage.stage_label}". 
      
Diga algo que um cliente real diria neste momento da conversa de vendas.

IMPORTANTE: As opções de resposta (response_options) devem ser RESPOSTAS DO VENDEDOR para o cliente, NÃO perguntas do cliente!
O jogador é o vendedor e precisa escolher como responder ao cliente.

Exemplos de boas opções de resposta DO VENDEDOR:
- "Entendo sua preocupação. Posso mostrar como outros clientes reduziram custos em 30%?"
- "Vamos analisar juntos quais são os principais gargalos do seu processo atual."
- "Fico feliz em saber disso! Temos cases de sucesso em empresas similares à sua."

Retorne um JSON com:
{
  "client_response": "Sua fala inicial como cliente",
  "response_options": [
    {
      "text": "Resposta do vendedor (NÃO do cliente) - uma frase que o vendedor diria",
      "quality": "optimal" | "good" | "neutral" | "poor",
      "rapport_impact": número -10 a +10,
      "score_value": número 0-100,
      "feedback": "Feedback sobre esta escolha"
    },
    // mais 2-3 opções de respostas DO VENDEDOR
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsedResponse = JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI response');
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in generate-sales-response:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

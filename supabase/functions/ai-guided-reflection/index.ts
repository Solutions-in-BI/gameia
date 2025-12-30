import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReflectionRequest {
  moduleId: string;
  chapterTitle: string;
  chapterContent: string;
  learningObjective: string;
  contextWhyMatters: string;
  userResponse: string;
  conversationHistory: Array<{ role: 'assistant' | 'user'; content: string }>;
  pdiGoalContext?: string;
  skillName?: string;
}

interface ReflectionResponse {
  aiMessage: string;
  isComplete: boolean;
  comprehensionScore?: number;
  responseDepth?: 'superficial' | 'moderate' | 'deep';
  insights?: string[];
  feedback?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const body: ReflectionRequest = await req.json();
    const {
      chapterTitle,
      chapterContent,
      learningObjective,
      contextWhyMatters,
      userResponse,
      conversationHistory,
      pdiGoalContext,
      skillName
    } = body;

    console.log('Processing reflection for chapter:', chapterTitle);

    // Build conversation messages
    const systemPrompt = `Você é um facilitador de aprendizado do Gameia, uma plataforma de desenvolvimento profissional gamificada.

Seu papel é guiar reflexões sobre leituras de forma contextualizada e prática, garantindo compreensão real antes de permitir avanço.

CONTEXTO DO MÓDULO:
- Capítulo: ${chapterTitle}
- Conteúdo: ${chapterContent}
- Objetivo de aprendizado: ${learningObjective}
- Por que isso importa: ${contextWhyMatters}
${skillName ? `- Skill impactada: ${skillName}` : ''}
${pdiGoalContext ? `- Meta do PDI relacionada: ${pdiGoalContext}` : ''}

SUAS DIRETRIZES:
1. Faça perguntas abertas e contextualizadas
2. Peça exemplos práticos do dia a dia do trabalho
3. Detecte respostas superficiais e peça aprofundamento
4. Conecte o conceito com situações reais
5. Seja encorajador mas rigoroso na compreensão

EXEMPLOS DE PERGUNTAS:
- "Como esse conceito aparece hoje no seu trabalho?"
- "O que você faria diferente a partir disso?"
- "Qual foi a última situação onde esse erro aconteceu?"
- "Pode me dar um exemplo prático de como aplicaria isso?"
${pdiGoalContext ? `- "Como isso se conecta com sua meta de ${pdiGoalContext}?"` : ''}

FLUXO DA CONVERSA:
1. Primeira resposta: Faça uma pergunta inicial sobre o entendimento do conceito principal
2. Avalie cada resposta: Se superficial, peça exemplo prático
3. Aprofunde: Pergunte sobre aplicação real
4. Conclua: Após 3-5 trocas de qualidade, finalize com feedback

FORMATO DE RESPOSTA:
Responda SEMPRE em JSON válido com esta estrutura:
{
  "aiMessage": "Sua mensagem para o usuário",
  "isComplete": false,
  "comprehensionScore": null,
  "responseDepth": null,
  "insights": [],
  "feedback": null
}

Quando a reflexão estiver completa (após 3-5 trocas de qualidade):
{
  "aiMessage": "Mensagem final de fechamento",
  "isComplete": true,
  "comprehensionScore": 85,
  "responseDepth": "deep",
  "insights": ["Insight 1 extraído", "Insight 2 extraído"],
  "feedback": "Feedback geral sobre a compreensão do usuário"
}

CRITÉRIOS DE PROFUNDIDADE:
- superficial: Respostas genéricas, sem exemplos concretos
- moderate: Alguns exemplos, conexão parcial com realidade
- deep: Exemplos específicos, conexões claras, autorreflexão

CRITÉRIOS DE SCORE (0-100):
- 90-100: Compreensão profunda com múltiplos exemplos práticos
- 70-89: Boa compreensão com alguns exemplos
- 50-69: Compreensão básica, precisa de mais prática
- 0-49: Compreensão insuficiente`;

    // Build messages array
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    // Add current user response if provided
    if (userResponse) {
      messages.push({ role: 'user', content: userResponse });
    }

    console.log('Sending to Lovable AI with', messages.length, 'messages');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error('No response from AI');
    }

    console.log('AI response received');

    // Parse JSON from AI response
    let parsedResponse: ReflectionResponse;
    try {
      // Try to extract JSON from response (in case there's extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback if AI didn't return JSON
        parsedResponse = {
          aiMessage: aiContent,
          isComplete: false,
        };
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      parsedResponse = {
        aiMessage: aiContent,
        isComplete: false,
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-guided-reflection:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

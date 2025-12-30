/**
 * AI Self-Assessment Edge Function
 * Autoavaliação guiada por IA que estimula reflexão e identifica pontos cegos
 * Usa Lovable AI Gateway
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  action: 'start' | 'continue' | 'evaluate';
  messages?: Message[];
  skillName?: string;
  skillDescription?: string;
  userContext?: {
    recentTrainings?: string[];
    recentChallenges?: string[];
    currentStreak?: number;
    previousScore?: number;
  };
}

const SYSTEM_PROMPT = `Você é um coach de desenvolvimento profissional do Gameia. Sua função é guiar o usuário em uma autoavaliação reflexiva sobre suas competências.

REGRAS IMPORTANTES:
1. Faça perguntas curtas e diretas (máximo 2 linhas)
2. Estimule reflexão genuína, não respostas prontas
3. Identifique pontos cegos gentilmente
4. Nunca julgue ou critique - apenas explore e ajude a refletir
5. Use linguagem acolhedora e motivadora
6. Máximo de 5 perguntas por avaliação

ESTRUTURA DA CONVERSA:
1. Primeira pergunta: Situação recente relacionada à competência
2. Segunda pergunta: Como o usuário reagiu/agiu
3. Terceira pergunta: O que poderia ter sido diferente
4. Quarta pergunta: Aprendizado ou insight
5. Quinta pergunta: Próximo passo concreto

Após a 5ª resposta do usuário, forneça:
- Um resumo dos pontos fortes identificados
- Áreas de desenvolvimento sugeridas
- Score evolutivo (1-100) baseado na profundidade da reflexão
- Uma sugestão de ação prática

FORMATO DO RESUMO FINAL (use exatamente este formato JSON):
{
  "isComplete": true,
  "summary": {
    "strengths": ["ponto forte 1", "ponto forte 2"],
    "developmentAreas": ["área 1", "área 2"],
    "evolutionScore": 75,
    "reflectionDepth": "profunda|moderada|superficial",
    "actionSuggestion": "ação concreta sugerida",
    "insights": ["insight 1", "insight 2"]
  }
}

Durante a conversa (não no final), responda apenas com texto normal da conversa.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    const body: RequestBody = await req.json();
    const { action, messages = [], skillName, skillDescription, userContext } = body;

    console.log(`[ai-self-assessment] Action: ${action}, Messages: ${messages.length}`);

    let systemPrompt = SYSTEM_PROMPT;
    
    // Add context about the skill being evaluated
    if (skillName) {
      systemPrompt += `\n\nCOMPETÊNCIA SENDO AVALIADA: ${skillName}`;
      if (skillDescription) {
        systemPrompt += `\nDescrição: ${skillDescription}`;
      }
    }

    // Add user context if available
    if (userContext) {
      systemPrompt += '\n\nCONTEXTO DO USUÁRIO:';
      if (userContext.recentTrainings?.length) {
        systemPrompt += `\n- Treinamentos recentes: ${userContext.recentTrainings.join(', ')}`;
      }
      if (userContext.recentChallenges?.length) {
        systemPrompt += `\n- Desafios recentes: ${userContext.recentChallenges.join(', ')}`;
      }
      if (userContext.currentStreak) {
        systemPrompt += `\n- Sequência atual: ${userContext.currentStreak} dias`;
      }
      if (userContext.previousScore !== undefined) {
        systemPrompt += `\n- Score anterior nesta competência: ${userContext.previousScore}`;
      }
    }

    // Build messages for the AI
    const aiMessages: Message[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (action === 'start') {
      // Add initial prompt to start the conversation
      aiMessages.push({
        role: 'user',
        content: `Inicie a autoavaliação sobre ${skillName || 'minhas competências'}. Faça a primeira pergunta reflexiva.`
      });
    } else {
      // Continue conversation with existing messages
      aiMessages.push(...messages);
    }

    // Call Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: aiMessages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ai-self-assessment] AI Gateway error: ${response.status}`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Por favor, adicione créditos ao seu workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const assistantMessage = aiResponse.choices?.[0]?.message?.content || '';

    console.log(`[ai-self-assessment] Response received, length: ${assistantMessage.length}`);

    // Check if the response contains completion JSON
    let isComplete = false;
    let summary = null;

    if (assistantMessage.includes('"isComplete": true') || assistantMessage.includes('"isComplete":true')) {
      try {
        // Try to extract JSON from the response
        const jsonMatch = assistantMessage.match(/\{[\s\S]*"isComplete"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          isComplete = parsed.isComplete;
          summary = parsed.summary;
        }
      } catch (e) {
        console.log('[ai-self-assessment] Could not parse completion JSON, continuing conversation');
      }
    }

    // Count user messages to determine question number
    const userMessageCount = messages.filter(m => m.role === 'user').length;

    return new Response(
      JSON.stringify({
        message: assistantMessage,
        isComplete,
        summary,
        questionNumber: userMessageCount + 1,
        totalQuestions: 5,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[ai-self-assessment] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

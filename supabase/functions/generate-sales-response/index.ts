import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
  track_key: 'sdr' | 'closer' | 'cold_outreach';
  channel?: 'phone' | 'whatsapp' | 'linkedin';
  is_cold_outreach?: boolean;
  product?: {
    name: string;
    description: string;
    key_benefits: string[];
    pricing_info: string;
    pitch_script: string;
    discovery_questions: string[];
    competitive_advantages: string[];
  };
  objections?: Array<{
    objection_text: string;
    recommended_response: string;
    technique: string;
  }>;
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { 
      persona, 
      stage, 
      track_key,
      channel,
      is_cold_outreach,
      product,
      objections,
      conversation_history, 
      player_response, 
      rapport 
    }: RequestBody = await req.json();

    console.log(`[generate-sales-response] Track: ${track_key}, Channel: ${channel}, Stage: ${stage.stage_key}, Rapport: ${rapport}`);

    // Build context based on track
    const trackContext = track_key === 'cold_outreach'
      ? `Esta é uma PROSPECÇÃO FRIA (Cold Outreach). O prospect NÃO conhece você.
         Canal: ${channel === 'phone' ? 'LIGAÇÃO TELEFÔNICA' : channel === 'whatsapp' ? 'MENSAGEM WHATSAPP' : 'MENSAGEM LINKEDIN'}
         Você está MUITO ocupado e resistente. Quer se livrar da ligação/mensagem.
         Seja difícil mas realista. Se o vendedor for bom, dê uma chance.`
      : track_key === 'sdr' 
      ? `Esta é uma ligação de PROSPECÇÃO (SDR). O objetivo é qualificar o lead e agendar uma reunião.
         Você NÃO está pronto para comprar - está sendo abordado pela primeira vez.
         Seja mais resistente e questione a relevância da ligação.`
      : `Esta é uma reunião de NEGOCIAÇÃO (Closer). O lead já foi qualificado.
         Você está interessado mas tem objeções e precisa ser convencido do valor.`;

    // Build product context if available
    const productContext = product ? `
PRODUTO/SERVIÇO EM NEGOCIAÇÃO:
- Nome: ${product.name}
- Descrição: ${product.description}
- Benefícios: ${product.key_benefits?.join(', ') || 'Não especificados'}
- Preço: ${product.pricing_info || 'A negociar'}
- Pitch sugerido: ${product.pitch_script || 'Não disponível'}
- Perguntas de discovery: ${product.discovery_questions?.join('; ') || 'Não especificadas'}
- Diferenciais: ${product.competitive_advantages?.join(', ') || 'Não especificados'}
` : '';

    // Build objection context
    const objectionContext = objections?.length ? `
OBJEÇÕES COMUNS DESTE CLIENTE:
${objections.map(o => `- "${o.objection_text}" (Técnica: ${o.technique})`).join('\n')}
Use essas objeções de forma natural quando apropriado.
` : '';

    const systemPrompt = `Você é ${persona.name}, ${persona.role} da ${persona.company_name} (${persona.company_type}).

PERSONALIDADE: ${persona.personality}
${trackContext}

PONTOS DE DOR:
${persona.pain_points?.map(p => `- ${p}`).join('\n') || '- Busca soluções eficientes'}

FATORES DE DECISÃO:
${persona.decision_factors?.map(f => `- ${f}`).join('\n') || '- Custo-benefício'}

${productContext}
${objectionContext}

ESTÁGIO ATUAL DA CONVERSA: ${stage.stage_label}
${stage.description || ''}

NÍVEL DE RAPPORT ATUAL: ${rapport}% (0-100)
${rapport < 30 ? '- Você está desconfiado e resistente' : ''}
${rapport >= 30 && rapport < 60 ? '- Você está neutro, mas ouvindo' : ''}
${rapport >= 60 && rapport < 80 ? '- Você está interessado e engajado' : ''}
${rapport >= 80 ? '- Você está muito receptivo' : ''}

REGRAS IMPORTANTES:
1. Responda de forma natural e realista como cliente brasileiro
2. Mantenha sua personalidade consistente (${persona.personality})
3. Use linguagem apropriada ao seu cargo e empresa
4. Faça objeções realistas baseadas nos seus pontos de dor
5. Se o vendedor usar técnicas boas, demonstre mais interesse
6. Se for muito agressivo ou técnico demais, demonstre resistência
7. Suas respostas devem ter 1-3 frases, seja conciso
8. Nunca quebre o personagem ou mencione que é simulação
9. Para SDR: seja mais difícil de engajar inicialmente
10. Para Closer: tenha objeções mais elaboradas sobre preço, timing, decisão

HISTÓRICO DA CONVERSA:
${conversation_history.map(m => `${m.sender === 'client' ? persona.name : 'Vendedor'}: ${m.text}`).join('\n')}`;

    // Different skills based on track
    const skillsTemplate = track_key === 'sdr' 
      ? `"skills_impact": {
      "cold_calling": número 0-20,
      "qualification": número 0-20,
      "rapport_building": número 0-20,
      "meeting_setting": número 0-20
    }`
      : `"skills_impact": {
      "discovery": número 0-20,
      "presentation": número 0-20,
      "objection_handling": número 0-20,
      "closing": número 0-20
    }`;

    const userPrompt = player_response 
      ? `O vendedor respondeu: "${player_response}"

Baseado na sua personalidade, no estágio atual (${stage.stage_label}) e no rapport (${rapport}%), responda de forma natural.

Retorne um JSON válido com:
{
  "client_response": "Sua resposta como cliente em português brasileiro",
  "rapport_change": número entre -15 e +15,
  "score_change": número entre 0 e 100,
  "feedback": "Dica curta para o jogador em português",
  "should_advance_stage": boolean,
  ${skillsTemplate},
  "response_options": [
    {
      "text": "Resposta que o VENDEDOR pode dar (em português)",
      "quality": "optimal" | "good" | "neutral" | "poor",
      "rapport_impact": número -10 a +10,
      "score_value": número 0-100,
      "feedback": "Feedback sobre esta escolha"
    }
  ]
}`
      : `Inicie a conversa como cliente no estágio "${stage.stage_label}".

${track_key === 'sdr' 
  ? 'Você está recebendo uma ligação fria. Seja um pouco resistente inicialmente.' 
  : 'Você agendou esta reunião mas ainda tem dúvidas.'}

IMPORTANTE: As opções de resposta (response_options) são RESPOSTAS DO VENDEDOR, não suas!
O jogador é o vendedor e precisa escolher como responder.

Retorne um JSON válido com:
{
  "client_response": "Sua fala inicial como cliente em português brasileiro",
  "response_options": [
    {
      "text": "Resposta do VENDEDOR (não do cliente) em português",
      "quality": "optimal" | "good" | "neutral" | "poor",
      "rapport_impact": número -10 a +10,
      "score_value": número 0-100,
      "feedback": "Feedback sobre esta escolha"
    }
  ]
}

Forneça 3-4 opções de resposta do vendedor com diferentes qualidades.`;

    console.log('[generate-sales-response] Calling Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-sales-response] AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded. Please try again later.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI credits exhausted. Please add more credits.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('[generate-sales-response] Raw AI response:', content.substring(0, 200));

    // Parse JSON response
    let parsedResponse;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      parsedResponse = JSON.parse(jsonMatch[1].trim());
    } catch (e) {
      console.error('[generate-sales-response] Failed to parse AI response:', content);
      
      // Fallback response based on track
      const fallbackOptions = track_key === 'sdr' 
        ? [
            { text: "Entendo que está ocupado. Posso ser breve - temos uma solução que pode interessar.", quality: "good", rapport_impact: 5, score_value: 50, feedback: "Respeita o tempo do prospect" },
            { text: "Qual seria o melhor horário para uma conversa rápida de 5 minutos?", quality: "optimal", rapport_impact: 10, score_value: 80, feedback: "Flexível e direto ao ponto" },
            { text: "Preciso falar com você sobre uma oportunidade imperdível!", quality: "poor", rapport_impact: -5, score_value: 20, feedback: "Muito agressivo para cold call" },
          ]
        : [
            { text: "Posso apresentar como nossa solução resolve exatamente esse problema?", quality: "good", rapport_impact: 5, score_value: 50, feedback: "Boa transição para apresentação" },
            { text: "Me conta mais sobre esse desafio. Como ele impacta seu dia a dia?", quality: "optimal", rapport_impact: 10, score_value: 80, feedback: "Excelente técnica de discovery" },
            { text: "Temos o melhor preço do mercado!", quality: "poor", rapport_impact: -5, score_value: 20, feedback: "Foco em preço muito cedo" },
          ];

      parsedResponse = {
        client_response: player_response 
          ? "Interessante... continue me explicando melhor."
          : track_key === 'sdr' 
            ? "Olá? Quem está falando?" 
            : "Olá, obrigado por entrar em contato. Como posso ajudar?",
        response_options: fallbackOptions,
      };
    }

    console.log('[generate-sales-response] Parsed response successfully');

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('[generate-sales-response] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

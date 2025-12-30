import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create client with user's token for RLS
    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user from token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const { action } = await req.json();

    // Fetch user's notes
    const { data: notes, error: notesError } = await supabaseClient
      .from('training_notes')
      .select(`
        *,
        training:trainings(id, name),
        module:training_modules(id, name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notesError) {
      throw notesError;
    }

    if (!notes || notes.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        data: {
          summary: "Você ainda não tem anotações. Comece a anotar durante seus treinamentos!",
          patterns: [],
          reviewSuggestions: [],
          recommendations: [],
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare notes context for AI
    const notesContext = notes.map(note => ({
      content: note.content,
      title: note.title,
      training: note.training?.name,
      module: note.module?.name,
      status: note.status,
      created_at: note.created_at,
      tags: note.tags,
    }));

    // Build AI prompt based on action
    let systemPrompt = `Você é um assistente de aprendizado do Gameia, uma plataforma de desenvolvimento profissional gamificada.
Analise as anotações do usuário e forneça insights acionáveis em português brasileiro.
Seja conciso, prático e motivador.`;

    let userPrompt = '';

    switch (action) {
      case 'summary':
        userPrompt = `Analise estas ${notes.length} anotações e gere um resumo executivo dos principais aprendizados:

${JSON.stringify(notesContext, null, 2)}

Responda em JSON com:
{
  "summary": "Resumo de 2-3 parágrafos dos principais temas e aprendizados",
  "keyTopics": ["tema1", "tema2", "tema3"],
  "strengthAreas": ["área forte 1", "área forte 2"],
  "developmentAreas": ["área a desenvolver 1"]
}`;
        break;

      case 'patterns':
        userPrompt = `Identifique padrões nas anotações do usuário:

${JSON.stringify(notesContext, null, 2)}

Responda em JSON com:
{
  "patterns": [
    {
      "pattern": "Descrição do padrão identificado",
      "frequency": "alta/média/baixa",
      "insight": "O que isso significa para o desenvolvimento do usuário"
    }
  ],
  "focusAreas": ["área de foco 1", "área de foco 2"],
  "blindSpots": ["possível ponto cego ou área pouco explorada"]
}`;
        break;

      case 'review':
        const now = new Date();
        const notesWithAge = notes.map(note => ({
          ...note,
          daysAgo: Math.floor((now.getTime() - new Date(note.created_at).getTime()) / (1000 * 60 * 60 * 24))
        }));

        userPrompt = `Sugira revisões baseadas na idade e status das anotações:

${JSON.stringify(notesWithAge.map(n => ({
  title: n.title,
  content: n.content?.substring(0, 100),
  training: n.training?.name,
  status: n.status,
  daysAgo: n.daysAgo,
  id: n.id
})), null, 2)}

Responda em JSON com:
{
  "reviewSuggestions": [
    {
      "noteId": "id da nota",
      "reason": "Por que revisar (ex: há 7 dias, ainda em rascunho)",
      "priority": "alta/média/baixa"
    }
  ],
  "reviewTip": "Dica geral sobre revisão espaçada"
}`;
        break;

      case 'recommendations':
        userPrompt = `Baseado nas anotações, sugira próximos passos de desenvolvimento:

${JSON.stringify(notesContext, null, 2)}

Responda em JSON com:
{
  "recommendations": [
    {
      "type": "training/challenge/pdi/practice",
      "title": "Título da recomendação",
      "description": "Por que essa recomendação faz sentido",
      "priority": "alta/média/baixa"
    }
  ],
  "nextSteps": ["Passo imediato 1", "Passo imediato 2"]
}`;
        break;

      default:
        // Full analysis
        userPrompt = `Faça uma análise completa das anotações do usuário:

${JSON.stringify(notesContext, null, 2)}

Responda em JSON com:
{
  "summary": "Resumo breve dos aprendizados",
  "patterns": [{"pattern": "padrão", "insight": "significado"}],
  "reviewSuggestions": [{"reason": "motivo", "priority": "alta/média/baixa"}],
  "recommendations": [{"type": "tipo", "title": "título", "description": "descrição"}],
  "motivationalMessage": "Mensagem motivacional personalizada"
}`;
    }

    // Call Lovable AI (using the internal AI endpoint)
    const aiResponse = await fetch('https://api.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY') || ''}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!aiResponse.ok) {
      // Fallback to rule-based analysis if AI fails
      console.log('AI call failed, using fallback analysis');
      return new Response(JSON.stringify({
        success: true,
        data: generateFallbackAnalysis(notes)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const analysisResult = JSON.parse(aiData.choices[0].message.content);

    return new Response(JSON.stringify({
      success: true,
      data: analysisResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in analyze-notes function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: errorMessage 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback analysis when AI is not available
function generateFallbackAnalysis(notes: any[]) {
  const now = new Date();
  
  // Count by status
  const statusCounts = {
    draft: notes.filter(n => n.status === 'draft').length,
    applied: notes.filter(n => n.status === 'applied').length,
    reviewed: notes.filter(n => n.status === 'reviewed').length,
  };

  // Find old notes needing review
  const oldNotes = notes.filter(n => {
    const daysAgo = Math.floor((now.getTime() - new Date(n.created_at).getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo > 7 && n.status === 'draft';
  });

  // Group by training
  const trainingGroups: Record<string, number> = {};
  notes.forEach(n => {
    const name = n.training?.name || 'Outros';
    trainingGroups[name] = (trainingGroups[name] || 0) + 1;
  });

  const topTrainings = Object.entries(trainingGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);

  return {
    summary: `Você tem ${notes.length} anotações: ${statusCounts.draft} rascunhos, ${statusCounts.applied} aplicadas e ${statusCounts.reviewed} revisadas. ${
      oldNotes.length > 0 
        ? `Há ${oldNotes.length} anotações com mais de 7 dias que ainda estão em rascunho.` 
        : 'Ótimo trabalho mantendo suas anotações em dia!'
    }`,
    patterns: topTrainings.map(t => ({
      pattern: `Foco em ${t}`,
      insight: `Você tem várias anotações sobre ${t}, indicando interesse ou necessidade de desenvolvimento nessa área.`
    })),
    reviewSuggestions: oldNotes.slice(0, 5).map(n => ({
      noteId: n.id,
      reason: `Rascunho criado há mais de 7 dias`,
      priority: 'média'
    })),
    recommendations: statusCounts.draft > statusCounts.applied ? [
      {
        type: 'practice',
        title: 'Aplicar conhecimentos',
        description: 'Você tem mais rascunhos do que anotações aplicadas. Tente colocar em prática o que aprendeu!',
        priority: 'alta'
      }
    ] : [],
    motivationalMessage: 'Quem anota, aprende. Quem aplica, evolui. Continue assim! 🚀'
  };
}

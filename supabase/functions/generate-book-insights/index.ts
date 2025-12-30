import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { organization_id, training_id, module_id, period_days = 30 } = await req.json()

    if (!organization_id) {
      return new Response(
        JSON.stringify({ error: 'organization_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const periodStart = new Date()
    periodStart.setDate(periodStart.getDate() - period_days)

    // Get applications for the period
    let query = supabase
      .from('routine_applications')
      .select(`
        id,
        user_id,
        module_id,
        training_id,
        status,
        evidence_content,
        evidence_type,
        started_at,
        completed_at,
        deadline_at,
        is_late,
        reflection_summary
      `)
      .gte('started_at', periodStart.toISOString())

    if (training_id) {
      query = query.eq('training_id', training_id)
    }
    if (module_id) {
      query = query.eq('module_id', module_id)
    }

    const { data: applications, error: appsError } = await query

    if (appsError) {
      throw appsError
    }

    // Filter by organization members
    const { data: orgMembers } = await supabase
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', organization_id)

    const memberIds = orgMembers?.map(m => m.user_id) || []
    const orgApplications = applications?.filter(a => memberIds.includes(a.user_id)) || []

    // Calculate metrics
    const totalApplications = orgApplications.length
    const completed = orgApplications.filter(a => a.status === 'completed')
    const completedOnTime = completed.filter(a => !a.is_late)
    const completedLate = completed.filter(a => a.is_late)
    const pending = orgApplications.filter(a => a.status === 'in_progress')

    const participationRate = totalApplications > 0 ? (completed.length / totalApplications) * 100 : 0
    const onTimeRate = completed.length > 0 ? (completedOnTime.length / completed.length) * 100 : 0

    // Extract themes from evidence content using simple analysis
    const evidenceTexts = completed
      .filter(a => a.evidence_content)
      .map(a => a.evidence_content as string)

    // Simple theme extraction (word frequency)
    const wordFrequency: Record<string, number> = {}
    const stopWords = ['de', 'a', 'o', 'que', 'e', 'do', 'da', 'em', 'um', 'para', 'é', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'foi', 'ao', 'ele', 'das', 'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'quem', 'nas', 'me', 'esse', 'eles', 'estão', 'você', 'tinha', 'foram', 'essa', 'num', 'nem', 'suas', 'meu', 'às', 'minha', 'têm', 'numa', 'pelos', 'elas', 'havia', 'seja', 'qual', 'será', 'nós', 'tenho', 'lhe', 'deles', 'essas', 'esses', 'pelas', 'este', 'fosse', 'dele']

    evidenceTexts.forEach(text => {
      const words = text.toLowerCase()
        .replace(/[^\w\sáéíóúâêîôûãõç]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 3 && !stopWords.includes(w))

      words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1
      })
    })

    // Get top themes
    const sortedWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)

    const commonThemes = sortedWords.map(([word, count]) => ({
      theme: word,
      count,
      percentage: Math.round((count / evidenceTexts.length) * 100)
    }))

    // Generate AI summary using Lovable AI
    let aiSummary = ''
    if (evidenceTexts.length > 0) {
      try {
        const sampleTexts = evidenceTexts.slice(0, 10).join('\n\n---\n\n')
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'Você é um assistente que analisa evidências de aplicações práticas de treinamentos corporativos. Gere um resumo executivo em português com: 1) Principais aprendizados aplicados, 2) Desafios comuns enfrentados, 3) Oportunidades de melhoria. Seja conciso e objetivo.'
              },
              {
                role: 'user',
                content: `Analise as seguintes evidências de aplicação prática e gere um resumo executivo:\n\n${sampleTexts}`
              }
            ],
            max_tokens: 500
          })
        })

        if (response.ok) {
          const aiResult = await response.json()
          aiSummary = aiResult.choices?.[0]?.message?.content || ''
        }
      } catch (aiError) {
        console.error('AI summary generation failed:', aiError)
        aiSummary = `Resumo automático: ${completed.length} aplicações concluídas, ${Math.round(onTimeRate)}% no prazo. Temas mais citados: ${commonThemes.slice(0, 3).map(t => t.theme).join(', ')}.`
      }
    }

    // Save summary to database
    const { data: summary, error: summaryError } = await supabase
      .from('book_application_summaries')
      .insert({
        organization_id,
        training_id: training_id || null,
        module_id: module_id || null,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: new Date().toISOString().split('T')[0],
        ai_summary: aiSummary,
        common_themes: commonThemes,
        key_insights: commonThemes.slice(0, 5),
        participation_rate: participationRate,
        on_time_rate: onTimeRate,
        total_applications: totalApplications,
        completed_on_time: completedOnTime.length,
        completed_late: completedLate.length,
        pending: pending.length
      })
      .select()
      .single()

    if (summaryError) {
      throw summaryError
    }

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          ...summary,
          metrics: {
            total: totalApplications,
            completed: completed.length,
            completedOnTime: completedOnTime.length,
            completedLate: completedLate.length,
            pending: pending.length,
            participationRate,
            onTimeRate
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error generating book insights:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

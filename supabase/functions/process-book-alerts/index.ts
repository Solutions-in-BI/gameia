import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BookAlert {
  id: string
  user_id: string
  application_id: string
  alert_type: string
  scheduled_for: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Get pending alerts that are due
    const { data: alerts, error: alertsError } = await supabase
      .from('book_application_alerts')
      .select(`
        id,
        user_id,
        application_id,
        alert_type,
        scheduled_for
      `)
      .is('sent_at', null)
      .lte('scheduled_for', new Date().toISOString())
      .limit(100)

    if (alertsError) {
      throw alertsError
    }

    if (!alerts || alerts.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0, message: 'No pending alerts' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const processedAlerts: string[] = []

    for (const alert of alerts as BookAlert[]) {
      try {
        // Get application details
        const { data: application } = await supabase
          .from('routine_applications')
          .select(`
            id,
            module_id,
            training_id,
            status,
            deadline_at
          `)
          .eq('id', alert.application_id)
          .single()

        if (!application) continue

        // Skip if already completed
        if (application.status === 'completed') {
          await supabase
            .from('book_application_alerts')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', alert.id)
          continue
        }

        // Get module and training names
        const { data: module } = await supabase
          .from('training_modules')
          .select('name')
          .eq('id', application.module_id)
          .single()

        const { data: training } = await supabase
          .from('trainings')
          .select('name')
          .eq('id', application.training_id)
          .single()

        // Create notification based on alert type
        let title = ''
        let message = ''
        let notificationType = 'reminder'

        switch (alert.alert_type) {
          case 'reminder_3d':
            title = 'Aplicação Prática Pendente'
            message = `Você tem 3 dias para completar "${module?.name || 'a aplicação prática'}" do treinamento "${training?.name || ''}"`
            break
          case 'reminder_1d':
            title = 'Prazo Amanhã!'
            message = `Amanhã vence o prazo para "${module?.name || 'a aplicação prática'}". Complete agora!`
            notificationType = 'urgent'
            break
          case 'overdue':
            title = 'Prazo Vencido!'
            message = `O prazo para "${module?.name || 'a aplicação prática'}" venceu. Complete o mais rápido possível!`
            notificationType = 'alert'
            // Mark application as late
            await supabase
              .from('routine_applications')
              .update({ is_late: true })
              .eq('id', alert.application_id)
            break
        }

        // Insert notification
        const { data: notification } = await supabase
          .from('notifications')
          .insert({
            user_id: alert.user_id,
            title,
            message,
            type: notificationType,
            link: `/app/trainings/${application.training_id}`,
            metadata: {
              alert_type: alert.alert_type,
              application_id: alert.application_id,
              module_id: application.module_id,
              training_id: application.training_id
            }
          })
          .select('id')
          .single()

        // Update alert as sent
        await supabase
          .from('book_application_alerts')
          .update({ 
            sent_at: new Date().toISOString(),
            notification_id: notification?.id
          })
          .eq('id', alert.id)

        processedAlerts.push(alert.id)
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        processed: processedAlerts.length,
        alerts: processedAlerts
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error processing book alerts:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

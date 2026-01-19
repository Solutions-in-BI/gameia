import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Challenge {
  id: string
  name: string
  ends_at: string
  user_id: string
  organization_id: string
  is_overdue: boolean
  last_reminder_at: string | null
  status: string
  participants: Array<{ user_id: string }>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const now = new Date()
    const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

    // Fetch challenges ending soon that haven't been reminded recently
    const { data: challenges, error: fetchError } = await supabase
      .from('commitments')
      .select(`
        id,
        name,
        ends_at,
        created_by,
        organization_id,
        is_overdue,
        last_reminder_at,
        status,
        commitment_participants (user_id)
      `)
      .eq('status', 'active')
      .lte('ends_at', threeDaysFromNow.toISOString())
      .gt('ends_at', now.toISOString())

    if (fetchError) {
      console.error('Error fetching challenges:', fetchError)
      throw fetchError
    }

    console.log(`Found ${challenges?.length || 0} challenges ending soon`)

    const notifications: Array<{
      user_id: string
      title: string
      message: string
      type: string
      link: string
      organization_id: string
    }> = []

    const challengesToUpdate: string[] = []

    for (const challenge of challenges || []) {
      const endsAt = new Date(challenge.ends_at)
      const hoursRemaining = (endsAt.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      // Skip if reminded in last 12 hours
      if (challenge.last_reminder_at) {
        const lastReminder = new Date(challenge.last_reminder_at)
        const hoursSinceReminder = (now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60)
        if (hoursSinceReminder < 12) continue
      }

      let urgency = ''
      let shouldNotify = false

      if (hoursRemaining <= 24) {
        urgency = '⚠️ URGENTE'
        shouldNotify = true
      } else if (hoursRemaining <= 72) {
        urgency = '⏰ Em breve'
        shouldNotify = true
      }

      if (!shouldNotify) continue

      challengesToUpdate.push(challenge.id)

      // Get all participants
      const participants = challenge.commitment_participants || []
      const userIds = [...new Set([challenge.created_by, ...participants.map((p: any) => p.user_id)])]

      for (const userId of userIds) {
        if (!userId) continue
        
        notifications.push({
          user_id: userId,
          title: `${urgency}: Desafio expirando`,
          message: `O desafio "${challenge.name}" expira em ${Math.round(hoursRemaining)} horas!`,
          type: 'challenge_deadline',
          link: `/challenges?id=${challenge.id}`,
          organization_id: challenge.organization_id
        })
      }
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notifications')
        .insert(notifications)

      if (notifError) {
        console.error('Error inserting notifications:', notifError)
      } else {
        console.log(`Created ${notifications.length} notifications`)
      }
    }

    // Update last_reminder_at for processed challenges
    if (challengesToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from('commitments')
        .update({ last_reminder_at: now.toISOString() })
        .in('id', challengesToUpdate)

      if (updateError) {
        console.error('Error updating last_reminder_at:', updateError)
      }
    }

    // Mark overdue challenges
    const { data: overdueData, error: overdueError } = await supabase
      .from('commitments')
      .update({ is_overdue: true, status: 'failed' })
      .eq('status', 'active')
      .lt('ends_at', now.toISOString())
      .select('id')

    if (overdueError) {
      console.error('Error marking overdue:', overdueError)
    } else {
      console.log(`Marked ${overdueData?.length || 0} challenges as overdue`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        notifications_created: notifications.length,
        challenges_marked_overdue: overdueData?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in challenge-deadline-alerts:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

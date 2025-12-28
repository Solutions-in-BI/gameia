import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

// Helper to create response
const jsonResponse = (data: unknown, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
};

// Validate API key and get organization
async function validateApiKey(supabaseAdmin: any, apiKey: string) {
  console.log('[API] Validating API key...');
  
  if (!apiKey || !apiKey.startsWith('gsk_')) {
    return { valid: false, error: 'Invalid API key format' };
  }

  const keyPrefix = apiKey.substring(0, 12);
  
  // Hash the key for comparison
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const { data: keyData, error } = await supabaseAdmin
    .from('organization_api_keys')
    .select('*, organization:organizations(*)')
    .eq('key_prefix', keyPrefix)
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .is('revoked_at', null)
    .maybeSingle();

  if (error || !keyData) {
    console.log('[API] Key not found or invalid');
    return { valid: false, error: 'Invalid or expired API key' };
  }

  // Check expiration
  if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
    console.log('[API] Key expired');
    return { valid: false, error: 'API key has expired' };
  }

  // Update last used
  await supabaseAdmin
    .from('organization_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyData.id);

  console.log('[API] Key validated for org:', keyData.organization?.name);
  return { 
    valid: true, 
    keyId: keyData.id,
    orgId: keyData.organization_id,
    organization: keyData.organization,
    scopes: keyData.scopes || ['read']
  };
}

// Log API request
async function logRequest(supabaseAdmin: any, data: {
  api_key_id: string;
  organization_id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address?: string;
  user_agent?: string;
}) {
  try {
    await supabaseAdmin.from('api_request_logs').insert(data);
  } catch (err) {
    console.error('[API] Failed to log request:', err);
  }
}

serve(async (req) => {
  const startTime = Date.now();
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const endpoint = pathParts.slice(1).join('/'); // Remove 'public-api' prefix
    
    console.log(`[API] ${req.method} /${endpoint}`);

    // Get API key from header
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return jsonResponse({ error: 'API key required. Use x-api-key header.' }, 401);
    }

    // Validate API key
    const keyValidation = await validateApiKey(supabaseAdmin, apiKey);
    if (!keyValidation.valid) {
      return jsonResponse({ error: keyValidation.error }, 401);
    }

    const { keyId, orgId, organization, scopes } = keyValidation;

    // Route handling
    let response;
    let statusCode = 200;

    // GET /members - List organization members
    if (endpoint === 'members' && req.method === 'GET') {
      if (!scopes.includes('read') && !scopes.includes('members:read')) {
        return jsonResponse({ error: 'Insufficient permissions' }, 403);
      }

      const { data, error } = await supabaseAdmin
        .from('organization_members')
        .select(`
          user_id,
          org_role,
          department,
          job_title,
          joined_at,
          is_active,
          profile:profiles(nickname, avatar_url),
          team:organization_teams(id, name)
        `)
        .eq('organization_id', orgId)
        .eq('is_active', true);

      if (error) throw error;

      response = {
        organization: { id: orgId, name: organization.name },
        members: data?.map((m: any) => ({
          user_id: m.user_id,
          nickname: m.profile?.nickname,
          avatar_url: m.profile?.avatar_url,
          role: m.org_role,
          department: m.department,
          job_title: m.job_title,
          team: m.team?.name || null,
          joined_at: m.joined_at,
        })) || [],
        count: data?.length || 0,
      };
    }
    // GET /metrics - Get organization metrics
    else if (endpoint === 'metrics' && req.method === 'GET') {
      if (!scopes.includes('read') && !scopes.includes('metrics:read')) {
        return jsonResponse({ error: 'Insufficient permissions' }, 403);
      }

      const period = url.searchParams.get('period') || '30d';

      // Get engagement metrics
      const { data: engagementData } = await supabaseAdmin.rpc('get_org_engagement_metrics', {
        _org_id: orgId,
        _period: period,
      });

      // Get learning metrics
      const { data: learningData } = await supabaseAdmin.rpc('get_org_learning_metrics', {
        _org_id: orgId,
        _period: period,
      });

      response = {
        organization: { id: orgId, name: organization.name },
        period,
        engagement: engagementData || {},
        learning: learningData || {},
        generated_at: new Date().toISOString(),
      };
    }
    // GET /activities - Get recent activities
    else if (endpoint === 'activities' && req.method === 'GET') {
      if (!scopes.includes('read') && !scopes.includes('activities:read')) {
        return jsonResponse({ error: 'Insufficient permissions' }, 403);
      }

      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
      const offset = parseInt(url.searchParams.get('offset') || '0');

      const { data, error, count } = await supabaseAdmin
        .from('user_activity_log')
        .select(`
          id,
          user_id,
          activity_type,
          game_type,
          xp_earned,
          coins_earned,
          score,
          created_at,
          profile:profiles(nickname)
        `, { count: 'exact' })
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      response = {
        organization: { id: orgId, name: organization.name },
        activities: data?.map((a: any) => ({
          id: a.id,
          user_id: a.user_id,
          nickname: a.profile?.nickname,
          type: a.activity_type,
          game_type: a.game_type,
          xp_earned: a.xp_earned,
          coins_earned: a.coins_earned,
          score: a.score,
          timestamp: a.created_at,
        })) || [],
        pagination: {
          total: count || 0,
          limit,
          offset,
          has_more: (offset + limit) < (count || 0),
        },
      };
    }
    // GET /leaderboard - Get organization leaderboard
    else if (endpoint === 'leaderboard' && req.method === 'GET') {
      if (!scopes.includes('read') && !scopes.includes('leaderboard:read')) {
        return jsonResponse({ error: 'Insufficient permissions' }, 403);
      }

      const period = url.searchParams.get('period') || '30d';
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

      const { data } = await supabaseAdmin.rpc('get_members_ranking', {
        _org_id: orgId,
        _period: period,
        _limit: limit,
      });

      response = {
        organization: { id: orgId, name: organization.name },
        period,
        leaderboard: data?.ranking || [],
      };
    }
    // Not found
    else {
      statusCode = 404;
      response = {
        error: 'Endpoint not found',
        available_endpoints: [
          'GET /members',
          'GET /metrics?period=30d',
          'GET /activities?limit=50&offset=0',
          'GET /leaderboard?period=30d&limit=20',
        ],
      };
    }

    // Log the request
    await logRequest(supabaseAdmin, {
      api_key_id: keyId,
      organization_id: orgId,
      endpoint: `/${endpoint}`,
      method: req.method,
      status_code: statusCode,
      response_time_ms: Date.now() - startTime,
      user_agent: req.headers.get('user-agent') || undefined,
    });

    return jsonResponse(response, statusCode);

  } catch (error: any) {
    console.error('[API] Error:', error);
    return jsonResponse({ error: 'Internal server error', message: error?.message || 'Unknown error' }, 500);
  }
});

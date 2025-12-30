/**
 * Edge Function: generate-certificate-pdf
 * Gera um PDF profissional do certificado
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CertificateRequest {
  certificate_id: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { certificate_id }: CertificateRequest = await req.json();
    console.log('Generating PDF for certificate:', certificate_id);

    if (!certificate_id) {
      return new Response(
        JSON.stringify({ error: 'certificate_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch certificate with all related data
    const { data: certificate, error: certError } = await supabase
      .from('training_certificates')
      .select(`
        *,
        training:trainings(id, name, description, category, icon, color),
        profile:profiles(id, nickname, avatar_url)
      `)
      .eq('id', certificate_id)
      .single();

    if (certError || !certificate) {
      console.error('Certificate not found:', certError);
      return new Response(
        JSON.stringify({ error: 'Certificate not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch organization
    const { data: org } = await supabase
      .from('organizations')
      .select('name, logo_url')
      .eq('id', certificate.organization_id)
      .single();

    // Fetch validated skills
    let skills: { name: string; icon: string }[] = [];
    if (certificate.skills_validated && certificate.skills_validated.length > 0) {
      const { data: skillsData } = await supabase
        .from('skill_configurations')
        .select('name, icon')
        .in('id', certificate.skills_validated);
      
      skills = skillsData || [];
    }

    console.log('Certificate data loaded:', {
      holderName: certificate.profile?.nickname,
      trainingName: certificate.training?.name,
      orgName: org?.name,
      skillsCount: skills.length
    });

    // Generate HTML for PDF
    const certificateName = certificate.metadata?.certificate_name || certificate.training?.name || 'Certificado';
    const holderName = certificate.profile?.nickname || 'Participante';
    const issuedDate = new Date(certificate.issued_at).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    const expiresDate = certificate.expires_at 
      ? new Date(certificate.expires_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
      : null;
    const verificationCode = certificate.verification_code || '';
    const verificationUrl = `https://gameia.app/certificates/${verificationCode}`;

    // Build skills HTML
    const skillsHtml = skills.length > 0 
      ? `<div class="skills">
           <h4>Competências Validadas</h4>
           <div class="skills-list">
             ${skills.map(s => `<span class="skill">${s.icon} ${s.name}</span>`).join('')}
           </div>
         </div>`
      : '';

    // Generate certificate HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    
    .certificate {
      background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
      width: 900px;
      padding: 60px;
      border-radius: 20px;
      box-shadow: 0 25px 80px rgba(0,0,0,0.3);
      position: relative;
      overflow: hidden;
    }
    
    .certificate::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    }
    
    .certificate::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
    }
    
    .border-decoration {
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      bottom: 20px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      pointer-events: none;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo-section {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .logo {
      font-size: 32px;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .org-name {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    
    .title {
      font-family: 'Playfair Display', serif;
      font-size: 42px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 10px;
    }
    
    .subtitle {
      font-size: 16px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 3px;
    }
    
    .body {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .certify-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 15px;
    }
    
    .holder-name {
      font-family: 'Playfair Display', serif;
      font-size: 36px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 20px;
      border-bottom: 2px solid #3b82f6;
      display: inline-block;
      padding-bottom: 5px;
    }
    
    .completion-text {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.8;
      max-width: 600px;
      margin: 0 auto 30px;
    }
    
    .certificate-name {
      font-size: 24px;
      font-weight: 600;
      color: #3b82f6;
      margin-bottom: 10px;
    }
    
    .score {
      display: inline-block;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 8px 24px;
      border-radius: 30px;
      font-weight: 600;
      font-size: 16px;
      margin-top: 15px;
    }
    
    .skills {
      margin: 30px 0;
      padding: 20px;
      background: #f9fafb;
      border-radius: 12px;
    }
    
    .skills h4 {
      font-size: 14px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 15px;
    }
    
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 10px;
    }
    
    .skill {
      background: white;
      border: 1px solid #e5e7eb;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      color: #374151;
    }
    
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 40px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
    }
    
    .date-section, .verification-section {
      text-align: left;
    }
    
    .verification-section {
      text-align: right;
    }
    
    .label {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 5px;
    }
    
    .value {
      font-size: 14px;
      color: #374151;
      font-weight: 500;
    }
    
    .code {
      font-family: monospace;
      font-size: 12px;
      color: #6b7280;
      background: #f3f4f6;
      padding: 4px 8px;
      border-radius: 4px;
    }
    
    .qr-placeholder {
      width: 80px;
      height: 80px;
      background: #f3f4f6;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #9ca3af;
      margin-left: auto;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-decoration"></div>
    
    <div class="header">
      <div class="logo-section">
        <span class="logo">🎮 Gameia</span>
      </div>
      ${org?.name ? `<p class="org-name">${org.name}</p>` : ''}
      <h1 class="title">Certificado</h1>
      <p class="subtitle">de Conclusão</p>
    </div>
    
    <div class="body">
      <p class="certify-text">Este certificado atesta que</p>
      <h2 class="holder-name">${holderName}</h2>
      <p class="completion-text">
        concluiu com êxito o programa de desenvolvimento
      </p>
      <h3 class="certificate-name">${certificateName}</h3>
      ${certificate.final_score ? `<span class="score">Nota Final: ${certificate.final_score}%</span>` : ''}
      ${skillsHtml}
    </div>
    
    <div class="footer">
      <div class="date-section">
        <p class="label">Emitido em</p>
        <p class="value">${issuedDate}</p>
        ${expiresDate ? `<p class="label" style="margin-top: 10px;">Válido até</p><p class="value">${expiresDate}</p>` : ''}
      </div>
      
      <div class="verification-section">
        <p class="label">Código de Verificação</p>
        <p class="code">${verificationCode.slice(0, 16)}</p>
        <p class="label" style="margin-top: 10px;">Verificar em</p>
        <p class="value">gameia.app/certificates</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    // Return HTML that can be converted to PDF on client or use a PDF service
    // For now, return the HTML and metadata
    console.log('Certificate HTML generated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        html,
        metadata: {
          holder_name: holderName,
          certificate_name: certificateName,
          issued_at: certificate.issued_at,
          verification_code: verificationCode,
          verification_url: verificationUrl,
          organization: org?.name,
          final_score: certificate.final_score,
          skills: skills.map(s => s.name),
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Error generating certificate PDF:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

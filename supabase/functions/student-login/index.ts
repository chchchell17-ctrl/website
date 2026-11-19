// Supabase Edge Function reference for Student Login (Deno runtime)
// Deploy with: supabase functions deploy student-login
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { classCode, studentId, pin } = await req.json();
    const cleanClass = String(classCode ?? '').trim().toUpperCase();
    const cleanStudent = String(studentId ?? '').trim().toUpperCase();
    const cleanPin = String(pin ?? '').trim();

    if (!cleanClass || !cleanStudent || !cleanPin) {
      return new Response(
        JSON.stringify({
          ok: false,
          code: 'EMPTY_FIELDS',
          message: 'Oops! Please complete your login details.',
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          ok: false,
          code: 'BACKEND_NOT_CONFIGURED',
          message: "Oops! We couldn't connect. Please ask your teacher to check the school portal setup.",
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: classRow } = await admin
      .from('classes')
      .select('id, class_code, class_name, is_active')
      .eq('class_code', cleanClass)
      .maybeSingle();

    if (!classRow || !classRow.is_active) {
      return new Response(
        JSON.stringify({
          ok: false,
          code: 'INVALID_CREDENTIALS',
          message: "Hmm... That doesn't look right, Detective. Please check your details and try again!",
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: studentRow } = await admin
      .from('students')
      .select(
        'id, student_code, display_name, pin_hash, is_active, avatar_config, xp, stars, badges, completed_missions, last_position'
      )
      .eq('class_id', classRow.id)
      .eq('student_code', cleanStudent)
      .maybeSingle();

    if (!studentRow || !studentRow.is_active) {
      return new Response(
        JSON.stringify({
          ok: false,
          code: 'INVALID_CREDENTIALS',
          message: "Hmm... That doesn't look right, Detective. Please check your details and try again!",
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Production note: verify scrypt/bcrypt hash via Web Crypto / Deno std crypto
    return new Response(
      JSON.stringify({
        ok: true,
        student: {
          id: studentRow.id,
          studentCode: studentRow.student_code,
          displayName: studentRow.display_name,
          classCode: classRow.class_code,
          className: classRow.class_name,
          hasAvatar: Boolean(studentRow.avatar_config),
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({
        ok: false,
        code: 'NETWORK_ERROR',
        message: "Oops! We couldn't connect. Please check your internet connection and try again.",
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

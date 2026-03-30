import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action, companyId, adminName, adminEmail, adminPassword, userId } = body;

    // Admin client with service_role key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify caller is super_admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const callerRole = caller.app_metadata?.role || caller.user_metadata?.role;
    if (callerRole !== 'maestro') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: only maestro' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // UPDATE existing admin
    // =============================================
    if (action === 'update' && userId) {
      const updatePayload: Record<string, unknown> = {};
      
      if (adminEmail) updatePayload.email = adminEmail;
      if (adminPassword) updatePayload.password = adminPassword;
      
      const userMetaUpdate: Record<string, unknown> = {};
      if (adminName) userMetaUpdate.name = adminName;
      if (adminEmail) userMetaUpdate.email_verified = true;
      if (Object.keys(userMetaUpdate).length > 0) {
        updatePayload.user_metadata = userMetaUpdate;
      }

      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        updatePayload
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Update failed: ${updateError.message}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Sync profile
      const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (adminName) profileUpdate.name = adminName;
      if (adminEmail) profileUpdate.email = adminEmail;
      
      await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', userId);

      return new Response(
        JSON.stringify({ success: true, user: { id: updatedUser.user.id, email: updatedUser.user.email } }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // =============================================
    // CREATE new admin
    // =============================================
    if (!companyId || !adminEmail || !adminName || !adminPassword) {
      return new Response(
        JSON.stringify({ error: 'Missing: companyId, adminName, adminEmail, adminPassword' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create auth.users entry
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        name: adminName,
        role: 'admin',
        companyId: companyId,
      },
      app_metadata: {
        role: 'admin',
        companyId: companyId,
      },
    });

    if (createError) {
      return new Response(
        JSON.stringify({ error: `Create failed: ${createError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Ensure profile exists (trigger handle_new_user may handle this, but we do it explicitly)
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: newUser.user.id,
      email: adminEmail,
      name: adminName,
      role: 'admin',
      company_id: companyId,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile upsert warning:', profileError.message);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { id: newUser.user.id, email: newUser.user.email, companyId } 
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

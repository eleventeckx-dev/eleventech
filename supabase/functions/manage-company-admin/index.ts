import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const { action, companyId, adminName, adminEmail, adminPassword, userId, maestroPassword, userData } = body;

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const callerRole = caller.app_metadata?.role || caller.user_metadata?.role;
    if (callerRole !== 'maestro') {
      return new Response(JSON.stringify({ error: 'Forbidden: only maestro' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Função auxiliar para validar senha do Maestro
    const validateMaestroPassword = async () => {
      if (!maestroPassword) throw new Error('A Senha do Super Admin é obrigatória para esta ação crítica.');
      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: caller.email!,
        password: maestroPassword
      });
      if (signInError) throw new Error('Senha do Super Admin incorreta.');
    };

    // =============================================
    // UPDATE existing admin
    // =============================================
    if (action === 'update' && userId) {
      const updatePayload: Record<string, unknown> = {};
      // Pegamos data do root do body ou do nested 'userData' para retrocompatibilidade
      const mail = adminEmail || userData?.email;
      const pass = adminPassword || userData?.password;
      const name = adminName || userData?.name;

      if (mail) updatePayload.email = mail;
      if (pass) updatePayload.password = pass;
      
      const userMetaUpdate: Record<string, unknown> = {};
      if (name) userMetaUpdate.name = name;
      if (mail) userMetaUpdate.email_verified = true;
      if (Object.keys(userMetaUpdate).length > 0) {
        updatePayload.user_metadata = userMetaUpdate;
      }

      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, updatePayload);

      if (updateError) throw new Error(`Update failed: ${updateError.message}`);

      const profileUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (name) profileUpdate.name = name;
      if (mail) profileUpdate.email = mail;
      await supabaseAdmin.from('profiles').update(profileUpdate).eq('id', userId);

      return new Response(JSON.stringify({ success: true, user: { id: updatedUser.user.id, email: updatedUser.user.email } }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // =============================================
    // CREATE new admin
    // =============================================
    if (action === 'create') {
      const mail = adminEmail || userData?.email;
      const pass = adminPassword || userData?.password;
      const name = adminName || userData?.name;
      const compId = companyId || userData?.companyId;
      
      if (!compId || !mail || !name || !pass) {
        throw new Error('Missing: companyId, adminName, adminEmail, adminPassword');
      }

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: mail,
        password: pass,
        email_confirm: true,
        user_metadata: { name: name, role: 'admin', companyId: compId },
        app_metadata: { role: 'admin', companyId: compId },
      });

      if (createError) throw new Error(createError.message);

      await supabaseAdmin.from('profiles').upsert({
        id: newUser.user.id, email: mail, name: name, role: 'admin',
        company_id: compId, status: 'active',
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

      return new Response(JSON.stringify({ success: true, user: { id: newUser.user.id, email: newUser.user.email, companyId: compId } }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // =============================================
    // RESET COMPANY (Apagar dados, manter users/empresa)
    // =============================================
    if (action === 'reset_company') {
      if (!companyId) throw new Error('Company ID missing');
      await validateMaestroPassword();
      
      // Apaga produtores do Auth antes de apagar as linhas (Se aplicável)
      const { data: producers } = await supabaseAdmin.from('producers').select('id').eq('company_id', companyId);
      for (const prod of (producers || [])) {
        if (prod.id.includes('-')) {
          await supabaseAdmin.auth.admin.deleteUser(prod.id).catch(() => {});
        }
      }

      await supabaseAdmin.from('loads').delete().eq('company_id', companyId);
      await supabaseAdmin.from('products').delete().eq('company_id', companyId);
      await supabaseAdmin.from('producers').delete().eq('company_id', companyId);

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // =============================================
    // DELETE COMPANY (Apagar TODOS os dados, users, e a empresa)
    // =============================================
    if (action === 'delete_company') {
      if (!companyId) throw new Error('Company ID missing');
      await validateMaestroPassword();
      
      // Deleta todos os users da Auth vinculados à empresa (Profiles contém todos: admin, colaborador, produtor)
      const { data: profiles } = await supabaseAdmin.from('profiles').select('id').eq('company_id', companyId);
      for (const p of (profiles || [])) {
        if (p.id.includes('-')) {
          await supabaseAdmin.auth.admin.deleteUser(p.id).catch(() => {});
        }
      }
      
      // Apaga produtores extras que não estão em profiles (se houver)
      const { data: producers } = await supabaseAdmin.from('producers').select('id').eq('company_id', companyId);
      for (const prod of (producers || [])) {
        if (prod.id.includes('-')) {
          await supabaseAdmin.auth.admin.deleteUser(prod.id).catch(() => {});
        }
      }

      await supabaseAdmin.from('loads').delete().eq('company_id', companyId);
      await supabaseAdmin.from('products').delete().eq('company_id', companyId);
      await supabaseAdmin.from('producers').delete().eq('company_id', companyId);
      await supabaseAdmin.from('profiles').delete().eq('company_id', companyId);
      await supabaseAdmin.from('companies').delete().eq('id', companyId);

      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error('Ação não reconhecida (manage-company-admin)');

  } catch (error: any) {
    console.error('Edge Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});


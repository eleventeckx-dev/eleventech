import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const email = 'admin@trezaely.com';
    const reqBody = await req.json().catch(() => ({}));

    // 1. Find user in Auth
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = usersData.users.find(u => u.email === email);
    
    if (user) {
      if (reqBody.action === 'delete') {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
        await supabaseAdmin.from('profiles').delete().eq('email', email);
        return new Response(JSON.stringify({ success: true, message: 'Deleted user ' + email }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }

      // Update password and auto-confirm email
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        password: '123456',
        email_confirm: true,
      });
      // Upsert profile
      const { data: companies } = await supabaseAdmin.from('companies').select('id').ilike('name', 'trezaely');
      const compId = companies?.[0]?.id;
      if (compId) {
         await supabaseAdmin.from('profiles').upsert({
           id: user.id, email: email, name: 'TrezaEly Admin', role: 'admin',
           company_id: compId, status: 'active',
         }, { onConflict: 'id' });
      }

      return new Response(JSON.stringify({ success: true, message: 'Updated & confirmed user ' + email }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: false, message: 'User not found in Auth.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

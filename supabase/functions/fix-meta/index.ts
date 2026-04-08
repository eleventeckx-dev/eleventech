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

    // Find company TrezaEly
    const { data: companies } = await supabaseAdmin.from('companies').select('id').ilike('name', 'trezaely');
    const compId = companies?.[0]?.id;
    if (!compId) return new Response('Company missing');

    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (listError) throw listError;

    const user = usersData.users.find(u => u.email === email);
    
    if (user) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role: 'admin', companyId: compId },
        user_metadata: { ...user.user_metadata, role: 'admin', companyId: compId, name: 'TrezaEly Admin' }
      });
      return new Response(JSON.stringify({ success: true, message: 'Updated metadata for ' + email }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: false, message: 'User not found in Auth.' }), { status: 404, headers: { 'Content-Type': 'application/json' } });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});

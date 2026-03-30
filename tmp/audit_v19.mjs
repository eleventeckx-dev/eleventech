import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asasrhkajusmxlbtpcdn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYXNyaGthanVzbXhsYnRwY2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTcxMDgsImV4cCI6MjA5MDI5MzEwOH0.H1OxO2221SpuCtVElcZEixS3EA5Qe0aUw0yDXae2Rxw'
);

async function deepAudit() {
  console.log("=== VARREDURA PROFUNDA V19 ===\n");

  // Tentar fazer login para inspecionar o JWT real
  const passwords = ['Admin@2024', 'Sadmin@2024', 'sadmin@2024', 'admin@2024', 'Admin2024', 'ElevenTech@2024'];
  let session = null;

  for (const pwd of passwords) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'sadmin@eleventech.com',
      password: pwd
    });
    if (!error && data.session) {
      console.log(`✅ Login OK com senha: ${pwd.substring(0, 3)}***`);
      session = data.session;
      break;
    }
  }

  if (!session) {
    console.log("❌ Nenhuma senha funcionou. Tentando via getSession...");
    const { data } = await supabase.auth.getSession();
    session = data.session;
  }

  if (session) {
    // INSPECIONAR O JWT REAL
    console.log("\n--- JWT PAYLOAD REAL ---");
    const jwt = session.access_token;
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    console.log("JWT completo:", JSON.stringify(payload, null, 2));
    console.log("\nCampos críticos:");
    console.log("  jwt.role (top-level):", payload.role);
    console.log("  jwt.user_metadata:", JSON.stringify(payload.user_metadata));
    console.log("  jwt.user_metadata.role:", payload.user_metadata?.role);
    console.log("  jwt.user_metadata.companyId:", payload.user_metadata?.companyId);
    console.log("  jwt.app_metadata:", JSON.stringify(payload.app_metadata));

    // Testar visibilidade COM sessão
    console.log("\n--- DADOS COM AUTENTICAÇÃO ---");
    const { data: companies, error: cErr } = await supabase.from('companies').select('*');
    console.log("Companies:", companies?.length || 0, cErr?.message || "OK");
    
    const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
    console.log("Profiles:", profiles?.length || 0, pErr?.message || "OK");
    profiles?.forEach(p => console.log(`  - ${p.email} | ${p.role} | company: ${p.company_id}`));
  } else {
    console.log("❌ Sem sessão. Teste sem autenticação:");
    const { data: companies } = await supabase.from('companies').select('*');
    console.log("Companies (anon):", companies?.length || 0);
    const { data: profiles } = await supabase.from('profiles').select('*');
    console.log("Profiles (anon):", profiles?.length || 0);
  }

  console.log("\n=== FIM DA VARREDURA V19 ===");
}

deepAudit();

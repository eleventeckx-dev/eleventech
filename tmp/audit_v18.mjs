import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asasrhkajusmxlbtpcdn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYXNyaGthanVzbXhsYnRwY2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTcxMDgsImV4cCI6MjA5MDI5MzEwOH0.H1OxO2221SpuCtVElcZEixS3EA5Qe0aUw0yDXae2Rxw'
);

async function audit() {
  console.log("=== AUDITORIA COMPLETA V18 ===\n");

  // 1. Tabelas públicas - verificar dados
  const tables = ['companies', 'profiles', 'producers', 'products', 'loads'];
  
  for (const table of tables) {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact' });
    if (error) {
      console.log(`❌ ${table}: ERRO - ${error.message} (code: ${error.code})`);
    } else {
      console.log(`✅ ${table}: ${data?.length || 0} registros visíveis`);
      if (data && data.length > 0) {
        // Mostrar estrutura do primeiro registro
        console.log(`   Colunas: ${Object.keys(data[0]).join(', ')}`);
        data.forEach((row, i) => {
          if (table === 'profiles') {
            console.log(`   [${i}] email: ${row.email}, role: ${row.role}, company_id: ${row.company_id}, status: ${row.status}`);
          } else if (table === 'companies') {
            console.log(`   [${i}] id: ${row.id}, name: ${row.name}, status: ${row.status}`);
          }
        });
      }
    }
  }

  // 2. Tentar chamar a função check_is_super_admin via RPC
  console.log("\n--- FUNÇÕES RPC ---");
  const { data: rpcData, error: rpcError } = await supabase.rpc('check_is_super_admin');
  if (rpcError) {
    console.log(`❌ check_is_super_admin(): ERRO - ${rpcError.message}`);
  } else {
    console.log(`✅ check_is_super_admin(): retornou ${rpcData}`);
  }

  // 3. Verificar is_admin
  const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin');
  if (isAdminError) {
    console.log(`❌ is_admin(): ERRO - ${isAdminError.message}`);
  } else {
    console.log(`✅ is_admin(): retornou ${isAdminData}`);
  }

  // 4. Tentar login para ver se a sessão funciona
  console.log("\n--- TESTE DE LOGIN ---");
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: 'sadmin@eleventech.com',
    password: 'Admin@2024'
  });
  
  if (loginError) {
    console.log(`❌ Login: ERRO - ${loginError.message}`);
    console.log("   Tentando com outra senha...");
    const { data: loginData2, error: loginError2 } = await supabase.auth.signInWithPassword({
      email: 'sadmin@eleventech.com',
      password: 'Sadmin@2024'
    });
    if (loginError2) {
      console.log(`❌ Login (tentativa 2): ${loginError2.message}`);
    } else {
      console.log(`✅ Login OK com segunda senha`);
      await runAuthedAudit(supabase);
    }
  } else {
    console.log(`✅ Login OK`);
    await runAuthedAudit(supabase);
  }

  console.log("\n=== FIM DA AUDITORIA V18 ===");
}

async function runAuthedAudit(client) {
  const { data: { session } } = await client.auth.getSession();
  if (!session) {
    console.log("   ❌ Nenhuma sessão ativa após login");
    return;
  }
  
  const jwt = session.user;
  console.log(`   JWT user_id: ${jwt.id}`);
  console.log(`   JWT email: ${jwt.email}`);
  console.log(`   JWT role (meta): ${jwt.user_metadata?.role}`);
  console.log(`   JWT companyId (meta): ${jwt.user_metadata?.companyId}`);
  console.log(`   JWT app_metadata: ${JSON.stringify(jwt.app_metadata)}`);

  // Com sessão autenticada, re-testar tabelas
  console.log("\n--- DADOS COM AUTENTICAÇÃO ---");
  
  const { data: profilesAuth, error: pErr } = await client.from('profiles').select('*');
  if (pErr) {
    console.log(`   ❌ profiles (autenticado): ${pErr.message}`);
  } else {
    console.log(`   ✅ profiles (autenticado): ${profilesAuth?.length} registros`);
    profilesAuth?.forEach((p, i) => {
      console.log(`      [${i}] ${p.email} | role: ${p.role} | company: ${p.company_id}`);
    });
  }

  const { data: companiesAuth, error: cErr } = await client.from('companies').select('*');
  if (cErr) {
    console.log(`   ❌ companies (autenticado): ${cErr.message}`);
  } else {
    console.log(`   ✅ companies (autenticado): ${companiesAuth?.length} registros`);
    companiesAuth?.forEach((c, i) => {
      console.log(`      [${i}] ${c.name} | id: ${c.id} | status: ${c.status}`);
    });
  }

  // Testar check_is_super_admin COM autenticação
  const { data: rpcAuth, error: rpcAuthErr } = await client.rpc('check_is_super_admin');
  if (rpcAuthErr) {
    console.log(`   ❌ check_is_super_admin (autenticado): ${rpcAuthErr.message}`);
  } else {
    console.log(`   ✅ check_is_super_admin (autenticado): ${rpcAuth}`);
  }
}

audit();

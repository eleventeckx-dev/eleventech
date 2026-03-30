import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://asasrhkajusmxlbtpcdn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYXNyaGthanVzbXhsYnRwY2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTcxMDgsImV4cCI6MjA5MDI5MzEwOH0.H1OxO2221SpuCtVElcZEixS3EA5Qe0aUw0yDXae2Rxw'
);

async function checkV17() {
  console.log("--- TESTANDO VISIBILIDADE DE PERFIS V17 ---");
  
  // 1. Tentar ler todos os perfis (Como Super Admin)
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  
  if (pError) {
    console.error("ERRO EM PROFILES (RLS?):", pError.message);
  } else {
    console.log("Total de Perfis Visíveis:", profiles?.length);
    profiles?.forEach(p => {
      console.log(`- Email: ${p.email} | Role: ${p.role} | CompanyID: ${p.company_id}`);
    });
  }

  // 2. Tentar ler as empresas
  const { data: companies, error: cError } = await supabase.from('companies').select('*');
  console.log("Total de Empresas Visíveis:", companies?.length || 0);

  console.log("--- FIM DO DIAGNÓSTICO ---");
}

checkV17();

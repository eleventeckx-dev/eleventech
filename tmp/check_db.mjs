
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://asasrhkajusmxlbtpcdn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzYXNyaGthanVzbXhsYnRwY2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MTcxMDgsImV4cCI6MjA5MDI5MzEwOH0.H1OxO2221SpuCtVElcZEixS3EA5Qe0aUw0yDXae2Rxw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log("--- TESTANDO CONEXÃO REMOTA MAESTRO ---");
  const start = Date.now();
  
  // Testar leitura da tabela profiles
  const { data, error } = await supabase.from('profiles').select('*').limit(5);
  
  const end = Date.now();
  console.log(`Tempo de resposta: ${end - start}ms`);
  
  if (error) {
    console.error("ERRO NO BANCO:", error.message);
    if (error.message.includes('401')) console.log("DICA: A Anon Key pode estar errada ou expirada.");
  } else {
    console.log("DADOS RECEBIDOS:", data.length, "registros encontrados.");
    console.table(data);
  }

  // Testar tabelas de infra
  const { data: comp } = await supabase.from('companies').select('id, name').limit(1);
  console.log("CONEXÃO COM COMPANIES:", comp ? "OK" : "FALHA");
}

check();

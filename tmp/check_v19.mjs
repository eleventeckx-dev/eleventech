import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...values] = line.split('=');
  if (key && values.length > 0) {
    process.env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
  }
});

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*');
  if (error) {
    console.error("DB Error:", error);
  } else {
    fs.writeFileSync('tmp/clean_profiles.json', JSON.stringify(data, null, 2));
    console.log("Saved to clean_profiles.json");
  }
}

check();

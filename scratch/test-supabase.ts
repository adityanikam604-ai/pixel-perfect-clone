import { createClient } from '@supabase/supabase-js';

const url = 'https://gkuzbfhadkjvzmfhtszg.supabase.co';
const key = 'sb_publishable_d1Kb-DI6gKOZfWbSatmziw_VALXWa6z';

const supabase = createClient(url, key);

async function runTest() {
  const { data: u, error: errU } = await supabase.from('users').select('*');
  console.log('Users select:', { count: u?.length, error: errU });

  const { data: p, error: errP } = await supabase.from('patients').select('*');
  console.log('Patients select:', { count: p?.length, error: errP });

  const { data: a, error: errA } = await supabase.from('alerts').select('*');
  console.log('Alerts select:', { count: a?.length, error: errA });
}

runTest();

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gkuzbfhadkjvzmfhtszg.supabase.co',
  'sb_publishable_d1Kb-DI6gKOZfWbSatmziw_VALXWa6z'
);

async function checkTables() {
  const { data: u, error: uErr } = await supabase.from('users').select('*').limit(3);
  console.log('Select users:', { count: u?.length, error: uErr?.message });

  const { data: ins, error: insErr } = await supabase.from('users').insert({
    id: 'USR-TEST-' + Date.now(),
    name: 'Dr. Test Direct',
    email: `test.${Date.now()}@medguard.org`,
    role: 'Doctor',
    department: 'Cardiology'
  }).select();
  console.log('Insert user result:', { ins, error: insErr?.message });
}

checkTables();

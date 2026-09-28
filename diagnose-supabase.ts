import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gkuzbfhadkjvzmfhtszg.supabase.co';
const supabaseAnonKey = 'sb_publishable_d1Kb-DI6gKOZfWbSatmziw_VALXWa6z';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnose() {
  console.log('--- 1. Testing Supabase Connection & Users table ---');
  const { data: users, error: userErr } = await supabase.from('users').select('*').limit(5);
  console.log('Users Query Error:', userErr);
  console.log('Users Query Data:', users);

  console.log('\n--- 2. Testing Insert into public.users with Anon Key ---');
  const testId = `TEST-${Date.now()}`;
  const { data: insertData, error: insertErr } = await supabase.from('users').insert([{
    id: testId,
    name: 'Diagnostic Test User',
    email: `diagnostic.${Date.now()}@test.org`,
    role: 'Nurse',
    department: 'Neurology',
    status: 'Active',
  }]).select();
  console.log('Insert Result:', insertData);
  console.log('Insert Error:', insertErr);

  console.log('\n--- 3. Testing Supabase Auth SignUp ---');
  const authEmail = `diag.auth.${Date.now()}@test.org`;
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: authEmail,
    password: 'password123',
    options: {
      data: {
        name: 'Diag Auth User',
        role: 'Nurse',
        department: 'Neurology',
      },
    },
  });
  console.log('Auth SignUp User ID:', authData?.user?.id);
  console.log('Auth SignUp Error:', authErr);
  console.log('Auth Session:', authData?.session ? 'Session created (Email auto-confirmed)' : 'No session (Email confirmation required or rate limited)');

  if (authData?.user) {
    console.log('\n--- 4. Testing Insert with Authenticated Client (if session exists) ---');
    const { data: profileInsert, error: profileInsertErr } = await supabase.from('users').insert([{
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: 'Diag Auth User',
      email: authEmail,
      role: 'Nurse',
      department: 'Neurology',
      status: 'Active',
    }]).select();
    console.log('Profile Insert with Anon/Session Error:', profileInsertErr);
  }
}

diagnose().catch(console.error);

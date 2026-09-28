import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://gkuzbfhadkjvzmfhtszg.supabase.co',
  'sb_publishable_d1Kb-DI6gKOZfWbSatmziw_VALXWa6z'
);

async function test() {
  const testEmail = `doctor.test.${Date.now()}@medguard.org`;
  console.log('Testing SignUp with Supabase for:', testEmail);
  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'Password123!',
    options: {
      data: {
        name: 'Dr. Test Clinician',
        role: 'Doctor',
        department: 'Cardiology'
      }
    }
  });
  console.log('SignUp result:', { user: data?.user?.id, session: !!data?.session, error: error?.message });

  if (data?.user) {
    const { error: insertErr } = await supabase.from('users').upsert({
      id: data.user.id,
      name: 'Dr. Test Clinician',
      email: testEmail,
      role: 'Doctor',
      department: 'Cardiology',
      status: 'Active'
    });
    console.log('Insert to public.users result:', insertErr?.message || 'Success');

    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: 'Password123!'
    });
    console.log('SignIn test result:', { user: signInData?.user?.id, error: signInErr?.message });
  }
}

test().catch(console.error);

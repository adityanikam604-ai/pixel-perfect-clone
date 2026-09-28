import { createClient } from '@supabase/supabase-js';

const url = 'https://gkuzbfhadkjvzmfhtszg.supabase.co';
const key = 'sb_publishable_d1Kb-DI6gKOZfWbSatmziw_VALXWa6z';

const supabase = createClient(url, key);

async function seedDirectly() {
  const users = [
    { id: 'USR-001', name: 'Dr. Rahul Sharma', email: 'doctor@medguard.demo', role: 'Doctor', department: 'Cardiology', status: 'Active' },
    { id: 'USR-002', name: 'Neha Verma', email: 'nurse@medguard.demo', role: 'Nurse', department: 'Cardiology', status: 'Active' },
    { id: 'USR-003', name: 'Arjun Patel', email: 'security@medguard.demo', role: 'Security officer', department: 'Security', status: 'Active' },
    { id: 'USR-004', name: 'Kavita Shah', email: 'admin@medguard.demo', role: 'Administrator', department: 'Operations', status: 'Active' },
  ];

  const { data, error } = await supabase.from('users').upsert(users);
  console.log('Direct seed users result:', { error: error?.message || 'SUCCESS' });

  const { data: countData } = await supabase.from('users').select('*');
  console.log('Total users now in Supabase:', countData?.length);
}

seedDirectly();

import { registerWithSupabase, loginWithSupabase } from '../src/services/authService';

async function testFullFlow() {
  const email = `doctor.ayesha.${Date.now()}@hospital.org`;
  const pass = 'DoctorSecurePass123!';
  
  console.log('--- STEP 1: REGISTER WITH SUPABASE ---');
  const regRes = await registerWithSupabase(
    'Dr. Ayesha Sen',
    email,
    pass,
    'Doctor',
    'Cardiology'
  );
  console.log('Registration Result:', { success: regRes.success, accountId: regRes.account?.id, error: regRes.error });

  console.log('\n--- STEP 2: LOGIN WITH SUPABASE ---');
  const loginRes = await loginWithSupabase(email, pass);
  console.log('Login Result:', { success: loginRes.success, role: loginRes.account?.role, error: loginRes.error });

  console.log('\n--- STEP 3: DEMO ACCOUNT FALLBACK CHECK ---');
  const demoLogin = await loginWithSupabase('doctor@medguard.demo', 'doctor123');
  console.log('Demo Login Result:', { success: demoLogin.success, name: demoLogin.account?.name, role: demoLogin.account?.role });
}

testFullFlow().catch(console.error);

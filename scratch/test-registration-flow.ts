import { registerWithSupabase, loginWithSupabase } from '../src/services/authService';
import { supabase } from '../src/lib/supabase';

async function testFullRegistrationFlow() {
  console.log('=== TEST 1: Register Doctor with valid clinical department ===');
  const uniqueId = Date.now();
  const testEmail = `dr.cardio.${uniqueId}@medguard.org`;
  const testPassword = 'SecurePassword123!';
  const testName = 'Dr. Priya Nair';

  const regRes = await registerWithSupabase(
    testName,
    testEmail,
    testPassword,
    'Doctor',
    'Cardiology'
  );
  console.log('Registration Response:', { success: regRes.success, error: regRes.error, userId: regRes.account?.id });

  if (supabase && regRes.success && regRes.account) {
    const { data: userRow } = await supabase.from('users').select('*').eq('email', testEmail).maybeSingle();
    console.log('Database users table verification:', userRow ? {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role,
      department: userRow.department,
      created_at: userRow.created_at
    } : 'Not found in DB');
  }

  console.log('\n=== TEST 2: Reject Invalid Role-Department combo ===');
  const invalidCombo = await registerWithSupabase(
    'Dr. Invalid',
    `invalid.${uniqueId}@medguard.org`,
    'Password123!',
    'Doctor',
    'Security' // Invalid for Doctor
  );
  console.log('Invalid Combo Result (expected failure):', { success: invalidCombo.success, error: invalidCombo.error });

  console.log('\n=== TEST 3: Duplicate Email Prevention ===');
  const duplicate = await registerWithSupabase(
    'Dr. Duplicate',
    testEmail, // Same email
    'Password123!',
    'Doctor',
    'Cardiology'
  );
  console.log('Duplicate Email Result (expected failure):', { success: duplicate.success, error: duplicate.error });

  console.log('\n=== TEST 4: Weak Password Rejection ===');
  const weakPass = await registerWithSupabase(
    'Dr. Weak',
    `weak.${uniqueId}@medguard.org`,
    '123', // Under 6 characters
    'Doctor',
    'Cardiology'
  );
  console.log('Weak Password Result (expected failure):', { success: weakPass.success, error: weakPass.error });

  console.log('\n=== TEST 5: Login with newly created user ===');
  const loginRes = await loginWithSupabase(testEmail, testPassword);
  console.log('Login Response:', { success: loginRes.success, name: loginRes.account?.name, role: loginRes.account?.role });
}

testFullRegistrationFlow().catch(console.error);

import { registerWithSupabase } from '../src/services/authService';

async function testRoleDept() {
  console.log('Testing role-department combinations...');

  // Test 1: Doctor -> Cardiology
  const doc = await registerWithSupabase(
    'Dr. Test Cardio',
    `doc.cardio.${Date.now()}@medguard.org`,
    'Password123!',
    'Doctor',
    'Cardiology'
  );
  console.log('1. Doctor -> Cardiology:', { role: doc.account?.role, dept: doc.account?.department });

  // Test 2: Nurse -> Pediatrics
  const nurse = await registerWithSupabase(
    'Nurse Test Peds',
    `nurse.peds.${Date.now()}@medguard.org`,
    'Password123!',
    'Nurse',
    'Pediatrics'
  );
  console.log('2. Nurse -> Pediatrics:', { role: nurse.account?.role, dept: nurse.account?.department });

  // Test 3: Security Officer -> Security
  const sec = await registerWithSupabase(
    'Officer Test Sec',
    `sec.officer.${Date.now()}@medguard.org`,
    'Password123!',
    'Security officer',
    'Security'
  );
  console.log('3. Security Officer -> Security:', { role: sec.account?.role, dept: sec.account?.department });

  // Test 4: Administrator -> Operations
  const admin = await registerWithSupabase(
    'Admin Test Ops',
    `admin.ops.${Date.now()}@medguard.org`,
    'Password123!',
    'Administrator',
    'Operations'
  );
  console.log('4. Administrator -> Operations:', { role: admin.account?.role, dept: admin.account?.department });
}

testRoleDept().catch(console.error);

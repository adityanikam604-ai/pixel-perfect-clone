import { registerWithSupabase, loginWithSupabase } from './src/services/authService';
import { supabase } from './src/lib/supabase';
import { canAccessPage, hasPermission, normalizeRole, Permission } from './src/lib/rbac';
import { db } from './src/lib/db-store';

async function runIntegrationVerification() {
  console.log('===========================================================');
  console.log('MEDGUARD REGISTRATION & RBAC END-TO-END INTEGRATION TEST');
  console.log('===========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
      failed++;
    }
  }

  const timestamp = Date.now();

  // -------------------------------------------------------------
  // 1. DOCTOR REGISTRATION & RBAC VERIFICATION
  // -------------------------------------------------------------
  console.log('>>> 1. Testing DOCTOR Registration & RBAC Flow <<<');
  const doctorEmail = `dr.test.${timestamp}@hospital.med`;
  const doctorPass = 'medguard_pass123';
  const doctorName = 'Dr. Test Physician';
  const doctorDept = 'Cardiology';

  // Step 1: Register Doctor
  const docReg = await registerWithSupabase(doctorName, doctorEmail, doctorPass, 'Doctor', doctorDept);
  assert(docReg.success === true, 'Doctor registered via registerWithSupabase', docReg.error);
  assert(Boolean(docReg.account?.id), `Doctor assigned user ID: ${docReg.account?.id}`);

  // Step 2 & 3: Confirm user profile creation and attributes
  const docLocalUser = db.getUserByEmail(doctorEmail);
  assert(docLocalUser !== undefined, 'Doctor profile exists in local synchronized store');
  if (docLocalUser) {
    assert(docLocalUser.name === doctorName, `Profile name matches: '${docLocalUser.name}'`);
    assert(docLocalUser.email === doctorEmail, `Profile email matches: '${docLocalUser.email}'`);
    assert(docLocalUser.role === 'Doctor', `Profile role matches: '${docLocalUser.role}'`);
    assert(docLocalUser.department === doctorDept, `Profile department is valid clinical dept: '${docLocalUser.department}'`);
  }

  if (supabase) {
    const { data: docDbUser, error: docDbErr } = await supabase
      .from('users')
      .select('*')
      .eq('email', doctorEmail)
      .maybeSingle();

    if (docDbUser) {
      console.log(`ℹ️ Supabase remote row verified for ${doctorEmail}`);
    } else if (docDbErr) {
      console.log(`ℹ️ Supabase remote notice: ${docDbErr.message}`);
    }
  }

  // Step 4: Login with Doctor
  const docLogin = await loginWithSupabase(doctorEmail, doctorPass);
  assert(docLogin.success === true, 'Doctor logged in via loginWithSupabase', docLogin.error);
  assert(docLogin.account?.role === 'Doctor', 'Doctor account authenticated with role: Doctor');
  assert(docLogin.account?.department === doctorDept, `Doctor department retrieved: ${docLogin.account?.department}`);

  // Step 5: Verify authorized pages for Doctor
  assert(canAccessPage(docLogin.account?.role, 'dashboard'), 'Doctor can access Dashboard');
  assert(canAccessPage(docLogin.account?.role, 'patients'), 'Doctor can access Patients');
  assert(canAccessPage(docLogin.account?.role, 'patient-detail'), 'Doctor can access Patient Detail');
  assert(canAccessPage(docLogin.account?.role, 'activity'), 'Doctor can access My Activity');
  assert(canAccessPage(docLogin.account?.role, 'profile'), 'Doctor can access Profile');

  // Step 6: Verify Doctor CANNOT access restricted security & admin pages
  assert(!canAccessPage(docLogin.account?.role, 'security-dashboard'), 'Doctor CANNOT access Security Dashboard');
  assert(!canAccessPage(docLogin.account?.role, 'alerts'), 'Doctor CANNOT access Alerts');
  assert(!canAccessPage(docLogin.account?.role, 'logs'), 'Doctor CANNOT access Access Logs');
  assert(!canAccessPage(docLogin.account?.role, 'investigation'), 'Doctor CANNOT access Investigations');
  assert(!canAccessPage(docLogin.account?.role, 'users'), 'Doctor CANNOT access User Management');
  assert(!canAccessPage(docLogin.account?.role, 'rules'), 'Doctor CANNOT access Security Rules');


  // -------------------------------------------------------------
  // 2. NURSE REGISTRATION & RBAC VERIFICATION
  // -------------------------------------------------------------
  console.log('\n>>> 2. Testing NURSE Registration & RBAC Flow <<<');
  const nurseEmail = `nurse.test.${timestamp}@hospital.med`;
  const nursePass = 'medguard_pass123';
  const nurseName = 'Nurse Test Clinician';
  const nurseDept = 'Pediatrics';

  // Step 1: Register Nurse
  const nurseReg = await registerWithSupabase(nurseName, nurseEmail, nursePass, 'Nurse', nurseDept);
  assert(nurseReg.success === true, 'Nurse registered via registerWithSupabase', nurseReg.error);

  // Step 2 & 3: Confirm user profile creation and attributes
  const nurseLocalUser = db.getUserByEmail(nurseEmail);
  assert(nurseLocalUser !== undefined, 'Nurse profile exists in local synchronized store');
  if (nurseLocalUser) {
    assert(nurseLocalUser.name === nurseName, `Nurse name matches: '${nurseLocalUser.name}'`);
    assert(nurseLocalUser.email === nurseEmail, `Nurse email matches: '${nurseLocalUser.email}'`);
    assert(nurseLocalUser.role === 'Nurse', `Nurse role matches: '${nurseLocalUser.role}'`);
    assert(nurseLocalUser.department === nurseDept, `Nurse department is valid clinical dept: '${nurseLocalUser.department}'`);
  }

  // Step 4: Login with Nurse
  const nurseLogin = await loginWithSupabase(nurseEmail, nursePass);
  assert(nurseLogin.success === true, 'Nurse logged in via loginWithSupabase', nurseLogin.error);
  assert(nurseLogin.account?.role === 'Nurse', 'Nurse authenticated with role: Nurse');

  // Step 5: Verify authorized pages for Nurse
  assert(canAccessPage(nurseLogin.account?.role, 'dashboard'), 'Nurse can access Dashboard');
  assert(canAccessPage(nurseLogin.account?.role, 'patients'), 'Nurse can access Patients');
  assert(canAccessPage(nurseLogin.account?.role, 'patient-detail'), 'Nurse can access Patient Detail');
  assert(canAccessPage(nurseLogin.account?.role, 'activity'), 'Nurse can access My Activity');
  assert(canAccessPage(nurseLogin.account?.role, 'profile'), 'Nurse can access Profile');

  // Step 6: Verify Nurse CANNOT access restricted security & admin pages
  assert(!canAccessPage(nurseLogin.account?.role, 'security-dashboard'), 'Nurse CANNOT access Security Dashboard');
  assert(!canAccessPage(nurseLogin.account?.role, 'alerts'), 'Nurse CANNOT access Alerts');
  assert(!canAccessPage(nurseLogin.account?.role, 'logs'), 'Nurse CANNOT access Access Logs');
  assert(!canAccessPage(nurseLogin.account?.role, 'investigation'), 'Nurse CANNOT access Investigations');
  assert(!canAccessPage(nurseLogin.account?.role, 'users'), 'Nurse CANNOT access User Management');


  // -------------------------------------------------------------
  // 3. SECURITY OFFICER REGISTRATION & RBAC VERIFICATION
  // -------------------------------------------------------------
  console.log('\n>>> 3. Testing SECURITY OFFICER Registration & RBAC Flow <<<');
  const secEmail = `sec.test.${timestamp}@hospital.med`;
  const secPass = 'medguard_pass123';
  const secName = 'Officer Test Security';
  const secDept = 'Security';

  // Step 1: Register Security Officer
  const secReg = await registerWithSupabase(secName, secEmail, secPass, 'Security officer', secDept);
  assert(secReg.success === true, 'Security Officer registered via registerWithSupabase', secReg.error);

  // Step 2 & 3: Confirm user profile creation and attributes
  const secLocalUser = db.getUserByEmail(secEmail);
  assert(secLocalUser !== undefined, 'Security Officer profile exists in local synchronized store');
  if (secLocalUser) {
    assert(secLocalUser.name === secName, `Security Officer name matches: '${secLocalUser.name}'`);
    assert(secLocalUser.email === secEmail, `Security Officer email matches: '${secLocalUser.email}'`);
    assert(secLocalUser.role === 'Security officer', `Security Officer role matches: '${secLocalUser.role}'`);
    assert(secLocalUser.department === 'Security', `Security Officer department is Security: '${secLocalUser.department}'`);
  }

  // Step 4: Login with Security Officer
  const secLogin = await loginWithSupabase(secEmail, secPass);
  assert(secLogin.success === true, 'Security Officer logged in via loginWithSupabase', secLogin.error);
  assert(secLogin.account?.role === 'Security officer', 'Security Officer authenticated with role: Security officer');

  // Step 5: Verify authorized pages for Security Officer
  assert(canAccessPage(secLogin.account?.role, 'security-dashboard'), 'Security Officer can access Security Dashboard');
  assert(canAccessPage(secLogin.account?.role, 'alerts'), 'Security Officer can access Alerts');
  assert(canAccessPage(secLogin.account?.role, 'logs'), 'Security Officer can access Access Logs');
  assert(canAccessPage(secLogin.account?.role, 'investigation'), 'Security Officer can access Investigations');
  assert(canAccessPage(secLogin.account?.role, 'rules'), 'Security Officer can access Security Rules');
  assert(canAccessPage(secLogin.account?.role, 'profile'), 'Security Officer can access Profile');

  // Step 6: Verify Security Officer CANNOT access Admin-only or Clinical pages
  assert(!canAccessPage(secLogin.account?.role, 'users'), 'Security Officer CANNOT access User Management');
  assert(!canAccessPage(secLogin.account?.role, 'dashboard'), 'Security Officer CANNOT access Clinical Dashboard');
  assert(!canAccessPage(secLogin.account?.role, 'patients'), 'Security Officer CANNOT access Patients');


  // -------------------------------------------------------------
  // 4. ADMINISTRATOR REGISTRATION & RBAC VERIFICATION
  // -------------------------------------------------------------
  console.log('\n>>> 4. Testing ADMINISTRATOR Registration & RBAC Flow <<<');
  const adminEmail = `admin.test.${timestamp}@hospital.med`;
  const adminPass = 'medguard_pass123';
  const adminName = 'Admin Test Director';
  const adminDept = 'Operations';

  // Step 1: Register Administrator
  const adminReg = await registerWithSupabase(adminName, adminEmail, adminPass, 'Administrator', adminDept);
  assert(adminReg.success === true, 'Administrator registered via registerWithSupabase', adminReg.error);

  // Step 2 & 3: Confirm user profile creation and attributes
  const adminLocalUser = db.getUserByEmail(adminEmail);
  assert(adminLocalUser !== undefined, 'Administrator profile exists in local synchronized store');
  if (adminLocalUser) {
    assert(adminLocalUser.name === adminName, `Administrator name matches: '${adminLocalUser.name}'`);
    assert(adminLocalUser.email === adminEmail, `Administrator email matches: '${adminLocalUser.email}'`);
    assert(adminLocalUser.role === 'Administrator', `Administrator role matches: '${adminLocalUser.role}'`);
    assert(adminLocalUser.department === 'Operations', `Administrator department is Operations: '${adminLocalUser.department}'`);
  }

  // Step 4: Login with Administrator
  const adminLogin = await loginWithSupabase(adminEmail, adminPass);
  assert(adminLogin.success === true, 'Administrator logged in via loginWithSupabase', adminLogin.error);
  assert(adminLogin.account?.role === 'Administrator', 'Administrator authenticated with role: Administrator');

  // Step 5: Verify authorized pages for Administrator
  assert(canAccessPage(adminLogin.account?.role, 'users'), 'Administrator can access User Management');
  assert(canAccessPage(adminLogin.account?.role, 'security-dashboard'), 'Administrator can access Security Dashboard');
  assert(canAccessPage(adminLogin.account?.role, 'patients'), 'Administrator can access Patients');
  assert(canAccessPage(adminLogin.account?.role, 'patient-detail'), 'Administrator can access Patient Detail');
  assert(canAccessPage(adminLogin.account?.role, 'alerts'), 'Administrator can access Alerts');
  assert(canAccessPage(adminLogin.account?.role, 'logs'), 'Administrator can access Access Logs');
  assert(canAccessPage(adminLogin.account?.role, 'investigation'), 'Administrator can access Investigations');
  assert(canAccessPage(adminLogin.account?.role, 'rules'), 'Administrator can access Security Rules');
  assert(canAccessPage(adminLogin.account?.role, 'profile'), 'Administrator can access Profile');


  // -------------------------------------------------------------
  // 5. ROLE-DEPARTMENT COMBINATION VALIDATION INTEGRITY
  // -------------------------------------------------------------
  console.log('\n>>> 5. Testing Role-Department Validation Constraints <<<');
  const invalidDoc = await registerWithSupabase('Invalid Doc', `bad.doc.${timestamp}@hospital.med`, 'pass123', 'Doctor', 'Security');
  assert(invalidDoc.success === false, 'Doctor cannot register with Security department (rejected)');

  const invalidSec = await registerWithSupabase('Invalid Sec', `bad.sec.${timestamp}@hospital.med`, 'pass123', 'Security officer', 'Cardiology');
  assert(invalidSec.success === false, 'Security Officer cannot register with Cardiology department (rejected)');

  const invalidAdmin = await registerWithSupabase('Invalid Admin', `bad.admin.${timestamp}@hospital.med`, 'pass123', 'Administrator', 'Pediatrics');
  assert(invalidAdmin.success === false, 'Administrator cannot register with Pediatrics department (rejected)');


  // -------------------------------------------------------------
  // 6. SERVER-SIDE ROLE TRUST & TAMPER-RESISTANCE VERIFICATION
  // -------------------------------------------------------------
  console.log('\n>>> 6. Testing Server-Side RBAC Enforcement (No Client Trust) <<<');
  const baseUrl = 'http://localhost:5000/api';

  // Helper to authenticate against backend
  const authRes = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'doctor@medguard.demo', password: 'doctor123' }),
  });
  const authData = await authRes.json();
  const docToken = authData.token;

  // Doctor tries to call Admin-only endpoint /api/users, supplying a forged role in the payload
  const tamperRes = await fetch(`${baseUrl}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${docToken}`,
      'Content-Type': 'application/json',
    },
  });
  assert(tamperRes.status === 403, 'Backend rejects Doctor attempting to access Admin endpoint /api/users (HTTP 403)');

  const tamperPostRes = await fetch(`${baseUrl}/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${docToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Tampered Admin',
      email: 'tampered@medguard.demo',
      role: 'Administrator',
      department: 'Operations',
    }),
  });
  assert(tamperPostRes.status === 403, 'Backend rejects Doctor attempting to create user via POST /api/users (HTTP 403)');

  console.log('\n===========================================================');
  console.log(`TOTAL INTEGRATION TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('===========================================================');
}

runIntegrationVerification().catch(console.error);

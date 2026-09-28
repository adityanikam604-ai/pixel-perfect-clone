import { canAccessPage, hasPermission, normalizeRole, ROLE_PERMISSIONS } from './src/lib/rbac';
import { db } from './src/lib/db-store';

async function runTests() {
  console.log('========================================');
  console.log('MEDGUARD RBAC STEP 2 VERIFICATION SUITE');
  console.log('========================================\n');

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

  // 1. Role Normalization Tests
  console.log('--- 1. Role Normalization Tests ---');
  assert(normalizeRole('Doctor') === 'Doctor', 'Normalize Doctor');
  assert(normalizeRole('Nurse') === 'Nurse', 'Normalize Nurse');
  assert(normalizeRole('Security Officer') === 'Security officer', 'Normalize Security Officer');
  assert(normalizeRole('security_officer') === 'Security officer', 'Normalize security_officer');
  assert(normalizeRole('Admin') === 'Administrator', 'Normalize Admin');
  assert(normalizeRole('Administrator') === 'Administrator', 'Normalize Administrator');
  assert(normalizeRole('Hacker') === null, 'Invalid role returns null');

  // 2. Permission Matrix Tests
  console.log('\n--- 2. Permission Matrix Tests ---');
  assert(hasPermission('Doctor', 'view_patient_records'), 'Doctor has view_patient_records');
  assert(hasPermission('Doctor', 'access_patient_record'), 'Doctor has access_patient_record');
  assert(!hasPermission('Doctor', 'view_alerts'), 'Doctor does NOT have view_alerts');
  assert(!hasPermission('Doctor', 'investigate_alerts'), 'Doctor does NOT have investigate_alerts');
  assert(!hasPermission('Doctor', 'manage_users'), 'Doctor does NOT have manage_users');
  assert(!hasPermission('Doctor', 'view_access_logs'), 'Doctor does NOT have view_access_logs');

  assert(hasPermission('Nurse', 'view_patient_records'), 'Nurse has view_patient_records');
  assert(hasPermission('Nurse', 'access_patient_record'), 'Nurse has access_patient_record');
  assert(!hasPermission('Nurse', 'view_alerts'), 'Nurse does NOT have view_alerts');
  assert(!hasPermission('Nurse', 'manage_users'), 'Nurse does NOT have manage_users');

  assert(hasPermission('Security officer', 'view_security_dashboard'), 'Security Officer has view_security_dashboard');
  assert(hasPermission('Security officer', 'view_alerts'), 'Security Officer has view_alerts');
  assert(hasPermission('Security officer', 'view_access_logs'), 'Security Officer has view_access_logs');
  assert(hasPermission('Security officer', 'investigate_alerts'), 'Security Officer has investigate_alerts');
  assert(!hasPermission('Security officer', 'manage_users'), 'Security Officer does NOT have manage_users');
  assert(!hasPermission('Security officer', 'view_patient_records'), 'Security Officer does NOT have view_patient_records');

  assert(hasPermission('Administrator', 'manage_users'), 'Admin has manage_users');
  assert(hasPermission('Administrator', 'view_patient_records'), 'Admin has view_patient_records');
  assert(hasPermission('Administrator', 'view_alerts'), 'Admin has view_alerts');
  assert(hasPermission('Administrator', 'view_access_logs'), 'Admin has view_access_logs');

  // 3. Frontend Route Protection Tests
  console.log('\n--- 3. Frontend Route Access Tests ---');
  assert(canAccessPage('Doctor', 'dashboard'), 'Doctor can access dashboard');
  assert(canAccessPage('Doctor', 'patients'), 'Doctor can access patients');
  assert(canAccessPage('Doctor', 'patient-detail'), 'Doctor can access patient-detail');
  assert(canAccessPage('Doctor', 'activity'), 'Doctor can access activity');
  assert(canAccessPage('Doctor', 'profile'), 'Doctor can access profile');
  assert(!canAccessPage('Doctor', 'security-dashboard'), 'Doctor CANNOT access security-dashboard');
  assert(!canAccessPage('Doctor', 'alerts'), 'Doctor CANNOT access alerts');
  assert(!canAccessPage('Doctor', 'investigation'), 'Doctor CANNOT access investigation');
  assert(!canAccessPage('Doctor', 'logs'), 'Doctor CANNOT access logs');
  assert(!canAccessPage('Doctor', 'users'), 'Doctor CANNOT access users');

  assert(canAccessPage('Nurse', 'dashboard'), 'Nurse can access dashboard');
  assert(canAccessPage('Nurse', 'patients'), 'Nurse can access patients');
  assert(!canAccessPage('Nurse', 'alerts'), 'Nurse CANNOT access alerts');
  assert(!canAccessPage('Nurse', 'users'), 'Nurse CANNOT access users');

  assert(canAccessPage('Security officer', 'security-dashboard'), 'Security Officer can access security-dashboard');
  assert(canAccessPage('Security officer', 'alerts'), 'Security Officer can access alerts');
  assert(canAccessPage('Security officer', 'logs'), 'Security Officer can access logs');
  assert(canAccessPage('Security officer', 'investigation'), 'Security Officer can access investigation');
  assert(!canAccessPage('Security officer', 'users'), 'Security Officer CANNOT access users');
  assert(!canAccessPage('Security officer', 'dashboard'), 'Security Officer CANNOT access clinical dashboard');
  assert(!canAccessPage('Security officer', 'patients'), 'Security Officer CANNOT access patients');

  assert(canAccessPage('Administrator', 'users'), 'Admin can access users');
  assert(canAccessPage('Administrator', 'security-dashboard'), 'Admin can access security-dashboard');
  assert(canAccessPage('Administrator', 'patients'), 'Admin can access patients');
  assert(canAccessPage('Administrator', 'alerts'), 'Admin can access alerts');
  assert(canAccessPage('Administrator', 'logs'), 'Admin can access logs');

  // 4. Backend API RBAC Tests (HTTP Integration)
  console.log('\n--- 4. Backend API RBAC Middleware Tests ---');
  const baseUrl = 'http://localhost:5000/api';

  // Helper to authenticate against backend
  async function login(email: string, password: string = 'doctor123') {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    return { token: data.token, user: data.user, status: res.status };
  }

  // 4a. Unauthenticated tests (401)
  const unauthRes = await fetch(`${baseUrl}/patients`);
  assert(unauthRes.status === 401, 'Unauthenticated GET /api/patients returns 401');

  const unauthAlerts = await fetch(`${baseUrl}/alerts`);
  assert(unauthAlerts.status === 401, 'Unauthenticated GET /api/alerts returns 401');

  const unauthUsers = await fetch(`${baseUrl}/users`);
  assert(unauthUsers.status === 401, 'Unauthenticated GET /api/users returns 401');

  // 4b. Doctor RBAC tests
  const doctorAuth = await login('doctor@medguard.demo', 'doctor123');
  assert(doctorAuth.status === 200 && doctorAuth.user.role === 'Doctor', 'Doctor logged in successfully');
  
  const docPatients = await fetch(`${baseUrl}/patients`, {
    headers: { Authorization: `Bearer ${doctorAuth.token}` },
  });
  assert(docPatients.status === 200, 'Doctor GET /api/patients returns 200 OK');

  const docAlerts = await fetch(`${baseUrl}/alerts`, {
    headers: { Authorization: `Bearer ${doctorAuth.token}` },
  });
  assert(docAlerts.status === 403, 'Doctor GET /api/alerts returns 403 Forbidden');

  const docUsers = await fetch(`${baseUrl}/users`, {
    headers: { Authorization: `Bearer ${doctorAuth.token}` },
  });
  assert(docUsers.status === 403, 'Doctor GET /api/users returns 403 Forbidden');

  const docInvestigations = await fetch(`${baseUrl}/investigations`, {
    headers: { Authorization: `Bearer ${doctorAuth.token}` },
  });
  assert(docInvestigations.status === 403, 'Doctor GET /api/investigations returns 403 Forbidden');

  // 4c. Nurse RBAC tests
  const nurseAuth = await login('nurse@medguard.demo', 'nurse123');
  assert(nurseAuth.status === 200 && nurseAuth.user.role === 'Nurse', 'Nurse logged in successfully');

  const nursePatients = await fetch(`${baseUrl}/patients`, {
    headers: { Authorization: `Bearer ${nurseAuth.token}` },
  });
  assert(nursePatients.status === 200, 'Nurse GET /api/patients returns 200 OK');

  const nurseAlerts = await fetch(`${baseUrl}/alerts`, {
    headers: { Authorization: `Bearer ${nurseAuth.token}` },
  });
  assert(nurseAlerts.status === 403, 'Nurse GET /api/alerts returns 403 Forbidden');

  const nurseUsers = await fetch(`${baseUrl}/users`, {
    headers: { Authorization: `Bearer ${nurseAuth.token}` },
  });
  assert(nurseUsers.status === 403, 'Nurse GET /api/users returns 403 Forbidden');

  // 4d. Security Officer RBAC tests
  const secAuth = await login('security@medguard.demo', 'security123');
  assert(secAuth.status === 200 && secAuth.user.role === 'Security officer', 'Security Officer logged in successfully');

  const secAlerts = await fetch(`${baseUrl}/alerts`, {
    headers: { Authorization: `Bearer ${secAuth.token}` },
  });
  assert(secAlerts.status === 200, 'Security Officer GET /api/alerts returns 200 OK');

  const secLogs = await fetch(`${baseUrl}/access-logs`, {
    headers: { Authorization: `Bearer ${secAuth.token}` },
  });
  assert(secLogs.status === 200, 'Security Officer GET /api/access-logs returns 200 OK');

  const secInvestigations = await fetch(`${baseUrl}/investigations`, {
    headers: { Authorization: `Bearer ${secAuth.token}` },
  });
  assert(secInvestigations.status === 200, 'Security Officer GET /api/investigations returns 200 OK');

  const secUsers = await fetch(`${baseUrl}/users`, {
    headers: { Authorization: `Bearer ${secAuth.token}` },
  });
  assert(secUsers.status === 403, 'Security Officer GET /api/users returns 403 Forbidden');

  const secPatients = await fetch(`${baseUrl}/patients`, {
    headers: { Authorization: `Bearer ${secAuth.token}` },
  });
  assert(secPatients.status === 403, 'Security Officer GET /api/patients returns 403 Forbidden');

  // 4e. Admin RBAC tests
  const adminAuth = await login('admin@medguard.demo', 'admin123');
  assert(adminAuth.status === 200 && adminAuth.user.role === 'Administrator', 'Admin logged in successfully');

  const adminUsers = await fetch(`${baseUrl}/users`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  assert(adminUsers.status === 200, 'Admin GET /api/users returns 200 OK');

  const adminAlerts = await fetch(`${baseUrl}/alerts`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  assert(adminAlerts.status === 200, 'Admin GET /api/alerts returns 200 OK');

  const adminPatients = await fetch(`${baseUrl}/patients`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  assert(adminPatients.status === 200, 'Admin GET /api/patients returns 200 OK');

  const adminLogs = await fetch(`${baseUrl}/access-logs`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  assert(adminLogs.status === 200, 'Admin GET /api/access-logs returns 200 OK');

  // 4f. Tampered body role test (Backend must NOT trust role sent in body)
  const tamperedRes = await fetch(`${baseUrl}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${doctorAuth.token}`,
      'Content-Type': 'application/json',
    },
  });
  assert(tamperedRes.status === 403, 'Doctor cannot bypass RBAC by claiming Admin role (returns 403)');

  console.log('\n========================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('========================================');
}

runTests().catch(console.error);

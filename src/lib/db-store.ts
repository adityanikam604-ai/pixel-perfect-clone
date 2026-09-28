import {
  User,
  Patient,
  AccessLog,
  LoginAttempt,
  Alert,
  Investigation,
  AlertStatus,
} from './db-types';

// Initial synthetic seed data
const initialUsers: User[] = [
  { id: 'USR-001', name: 'Dr. Rahul Sharma', email: 'doctor@medguard.demo', role: 'Doctor', department: 'Cardiology', status: 'Active', createdAt: '2026-08-28T09:00:00Z', updatedAt: '2026-08-28T09:00:00Z' },
  { id: 'USR-002', name: 'Neha Verma', email: 'nurse@medguard.demo', role: 'Nurse', department: 'Cardiology', status: 'Active', createdAt: '2026-08-28T09:00:00Z', updatedAt: '2026-08-28T09:00:00Z' },
  { id: 'USR-003', name: 'Arjun Patel', email: 'security@medguard.demo', role: 'Security officer', department: 'Security', status: 'Active', createdAt: '2026-08-15T09:00:00Z', updatedAt: '2026-08-15T09:00:00Z' },
  { id: 'USR-004', name: 'Kavita Shah', email: 'admin@medguard.demo', role: 'Administrator', department: 'Operations', status: 'Active', createdAt: '2026-08-01T09:00:00Z', updatedAt: '2026-08-01T09:00:00Z' },
  { id: 'USR-005', name: 'Dr. Sameer Khan', email: 'sameer@medguard.demo', role: 'Doctor', department: 'Neurology', status: 'Review', createdAt: '2026-09-08T09:00:00Z', updatedAt: '2026-09-08T09:00:00Z' },
  { id: 'USR-006', name: 'Dr. Priya Nair', email: 'priya.nair@medguard.demo', role: 'Doctor', department: 'Emergency', status: 'Active', createdAt: '2026-09-13T09:00:00Z', updatedAt: '2026-09-13T09:00:00Z' },
  { id: 'USR-007', name: 'Dr. Anil Menon', email: 'anil.menon@medguard.demo', role: 'Doctor', department: 'Oncology', status: 'Active', createdAt: '2026-09-03T09:00:00Z', updatedAt: '2026-09-03T09:00:00Z' },
  { id: 'USR-008', name: 'Dr. Vikram Patel', email: 'vikram.patel@medguard.demo', role: 'Doctor', department: 'Orthopedics', status: 'Active', createdAt: '2026-09-18T09:00:00Z', updatedAt: '2026-09-18T09:00:00Z' },
];

const initialPatients: Patient[] = [
  { id: 'MG-10482', name: 'Aarav Mehta', initials: 'AM', age: 58, gender: 'Male', department: 'Cardiology', diagnosis: 'Hypertension', medicalHistory: 'Longstanding hypertension with regular cardiac monitoring.', treatment: 'Amlodipine 5mg daily; blood pressure review every 4 weeks.', assignedDoctor: 'Dr. Rahul Sharma', assignedDoctorId: 'USR-001', lastAccessAt: 'Today, 9:18 AM', createdAt: '2026-09-01T00:00:00Z' },
  { id: 'MG-10531', name: 'Priya Nair', initials: 'PN', age: 42, gender: 'Female', department: 'Cardiology', diagnosis: 'Atrial fibrillation', medicalHistory: 'Paroxysmal atrial fibrillation identified during routine screening.', treatment: 'Apixaban 5mg twice daily; rhythm observation.', assignedDoctor: 'Dr. Rahul Sharma', assignedDoctorId: 'USR-001', lastAccessAt: 'Today, 8:46 AM', createdAt: '2026-09-02T00:00:00Z' },
  { id: 'MG-10804', name: 'Vikram Singh', initials: 'VS', age: 67, gender: 'Male', department: 'Neurology', diagnosis: 'Transient ischemic attack', medicalHistory: 'Recent TIA with ongoing neurological observation.', treatment: 'Antiplatelet therapy; follow-up imaging scheduled.', assignedDoctor: 'Dr. Sameer Khan', assignedDoctorId: 'USR-005', lastAccessAt: 'Yesterday, 4:20 PM', createdAt: '2026-09-05T00:00:00Z' },
  { id: 'MG-10916', name: 'Sana Kapoor', initials: 'SK', age: 35, gender: 'Female', department: 'Oncology', diagnosis: 'Breast carcinoma', medicalHistory: 'Active treatment plan under oncology care.', treatment: 'Outpatient infusion cycle 3; oncology review next week.', assignedDoctor: 'Dr. Anil Menon', assignedDoctorId: 'USR-007', lastAccessAt: 'Yesterday, 2:05 PM', createdAt: '2026-09-08T00:00:00Z' },
  { id: 'MG-11044', name: 'Rohan Iyer', initials: 'RI', age: 51, gender: 'Male', department: 'Cardiology', diagnosis: 'Coronary artery disease', medicalHistory: 'Stable coronary artery disease after prior intervention.', treatment: 'Statin therapy and supervised cardiac rehabilitation.', assignedDoctor: 'Dr. Rahul Sharma', assignedDoctorId: 'USR-001', lastAccessAt: 'Mon, 11:30 AM', createdAt: '2026-09-10T00:00:00Z' },
  { id: 'MG-11102', name: 'Ananya Rao', initials: 'AR', age: 29, gender: 'Female', department: 'Pediatrics', diagnosis: 'Asthma', medicalHistory: 'Intermittent asthma with seasonal triggers.', treatment: 'Rescue inhaler as needed; trigger avoidance plan.', assignedDoctor: 'Kavita Shah', assignedDoctorId: 'USR-004', lastAccessAt: 'Mon, 10:12 AM', createdAt: '2026-09-12T00:00:00Z' },
  { id: 'MG-11218', name: 'Kabir Das', initials: 'KD', age: 73, gender: 'Male', department: 'Orthopedics', diagnosis: 'Osteoarthritis', medicalHistory: 'Bilateral knee osteoarthritis affecting mobility.', treatment: 'Physiotherapy and pain management review.', assignedDoctor: 'Dr. Vikram Patel', assignedDoctorId: 'USR-008', lastAccessAt: 'Sun, 3:42 PM', createdAt: '2026-09-15T00:00:00Z' },
  { id: 'MG-11308', name: 'Meera Kulkarni', initials: 'MK', age: 46, gender: 'Female', department: 'Cardiology', diagnosis: 'Heart failure', medicalHistory: 'Chronic heart failure with stable ejection fraction.', treatment: 'Diuretic titration and daily weight tracking.', assignedDoctor: 'Dr. Rahul Sharma', assignedDoctorId: 'USR-001', lastAccessAt: 'Sun, 1:08 PM', createdAt: '2026-09-18T00:00:00Z' },
  { id: 'MG-11420', name: 'Ramesh Sen', initials: 'RS', age: 62, gender: 'Male', department: 'Cardiology', diagnosis: 'Arrhythmia', medicalHistory: 'History of episodic palpitations and pacemaker checkup.', treatment: 'Metoprolol 25mg daily; ECG monitoring.', assignedDoctor: 'Dr. Rahul Sharma', assignedDoctorId: 'USR-001', lastAccessAt: '4 days ago', createdAt: '2026-09-20T00:00:00Z' },
  { id: 'MG-11590', name: 'Tara Bhatt', initials: 'TB', age: 38, gender: 'Female', department: 'Emergency', diagnosis: 'Acute chest trauma', medicalHistory: 'Motor vehicle accident triage, hemodynamically stable.', treatment: 'Continuous vitals monitoring; CT scan clearance.', assignedDoctor: 'Dr. Priya Nair', assignedDoctorId: 'USR-006', lastAccessAt: '5 hours ago', createdAt: '2026-09-22T00:00:00Z' },
];

const initialAccessLogs: AccessLog[] = [
  { id: 'LOG-8812', userId: 'USR-001', userName: 'Dr. Rahul Sharma', userRole: 'Doctor', userDepartment: 'Cardiology', patientId: 'MG-10482', patientName: 'Aarav Mehta', patientDepartment: 'Cardiology', action: 'VIEW_RECORD', emergencyMode: false, success: true, result: 'Allowed', reason: 'Authorized clinician scope match', ipAddress: '10.24.8.14', riskLevel: 'Low', timestamp: 'Today, 9:18 AM' },
  { id: 'LOG-8811', userId: 'USR-002', userName: 'Neha Verma', userRole: 'Nurse', userDepartment: 'Cardiology', patientId: 'MG-10531', patientName: 'Priya Nair', patientDepartment: 'Cardiology', action: 'VIEW_RECORD', emergencyMode: false, success: true, result: 'Allowed', reason: 'Department care assignment verified', ipAddress: '10.24.8.21', riskLevel: 'Low', timestamp: 'Today, 8:46 AM' },
  { id: 'LOG-8810', userId: 'USR-002', userName: 'Nurse Neha Verma', userRole: 'Nurse', userDepartment: 'Cardiology', patientId: 'MG-10804', patientName: 'Vikram Singh', patientDepartment: 'Neurology', action: 'REQUEST_ACCESS', emergencyMode: false, success: false, result: 'Denied', reason: 'Department mismatch: Cardiology user attempting Neurology record without emergency bypass', ipAddress: '10.24.8.21', riskLevel: 'High', timestamp: 'Today, 8:42 AM' },
  { id: 'LOG-8809', userId: 'USR-003', userName: 'Dr. Arjun Patel', userRole: 'Security officer', userDepartment: 'Security', patientName: '87 records', patientDepartment: 'General Medicine', action: 'BULK_ACCESS', emergencyMode: false, success: false, result: 'Flagged', reason: 'Mass record access threshold exceeded (87 records in 10 minutes)', ipAddress: '172.16.42.88', riskLevel: 'Critical', timestamp: 'Today, 10:29 AM' },
  { id: 'LOG-8808', userId: 'USR-006', userName: 'Dr. Priya Nair', userRole: 'Doctor', userDepartment: 'Emergency', patientId: 'MG-10916', patientName: 'Sana Kapoor', patientDepartment: 'Oncology', action: 'EMERGENCY_ACCESS', emergencyMode: true, success: true, result: 'Emergency', reason: 'Emergency mode activated by authorized ER doctor with clinical justification', ipAddress: '10.24.8.44', riskLevel: 'Low', timestamp: 'Yesterday, 7:20 PM' },
];

const initialLoginAttempts: LoginAttempt[] = [
  { id: 'LGN-9001', email: 'doctor@medguard.demo', userId: 'USR-001', success: true, ipAddress: '10.24.8.14', timestamp: 'Today, 9:18 AM' },
  { id: 'LGN-9002', email: 'nurse@medguard.demo', userId: 'USR-002', success: true, ipAddress: '10.24.8.21', timestamp: 'Today, 8:46 AM' },
  { id: 'LGN-9003', email: 'unknown.attacker@external.net', success: false, ipAddress: '198.51.100.24', failureReason: 'Invalid credentials', timestamp: 'Today, 8:12 AM' },
  { id: 'LGN-9004', email: 'unknown.attacker@external.net', success: false, ipAddress: '198.51.100.24', failureReason: 'Invalid credentials', timestamp: 'Today, 8:12 AM' },
  { id: 'LGN-9005', email: 'unknown.attacker@external.net', success: false, ipAddress: '198.51.100.24', failureReason: 'Invalid credentials', timestamp: 'Today, 8:13 AM' },
  { id: 'LGN-9006', email: 'unknown.attacker@external.net', success: false, ipAddress: '198.51.100.24', failureReason: 'Invalid credentials', timestamp: 'Today, 8:14 AM' },
  { id: 'LGN-9007', email: 'unknown.attacker@external.net', success: false, ipAddress: '198.51.100.24', failureReason: 'Invalid credentials', timestamp: 'Today, 8:15 AM' },
];

const initialAlerts: Alert[] = [
  {
    id: 'ALT-2048',
    alertType: 'MASS_RECORD_RETRIEVAL',
    typeDisplayName: 'Unusually high record access',
    userId: 'USR-003',
    userName: 'Dr. Arjun Patel',
    userRole: 'General Medicine',
    userDepartment: 'General Medicine',
    severity: 'Critical',
    status: 'Under Investigation',
    title: 'High volume record query exceeded safety threshold',
    detail: '87 patient records were accessed within 10 minutes. The configured threshold is 50 records within 10 minutes.',
    ruleId: 'RULE-02-MASS-ACCESS',
    evidence: { recordsAccessed: 87, threshold: 50, timeWindowMinutes: 10, departmentsAccessed: 4, emergencyMode: false, ipAddress: '172.16.42.88', trigger: 'Threshold exceeded' },
    timestamp: 'Today, 10:29 AM',
    createdAt: '2026-09-28T10:29:00Z',
    updatedAt: '2026-09-28T10:29:00Z',
  },
  {
    id: 'ALT-2047',
    alertType: 'ROLE_SCOPE_VIOLATION',
    typeDisplayName: 'Unauthorized department access',
    userId: 'USR-002',
    userName: 'Nurse Neha Verma',
    userRole: 'Nurse',
    userDepartment: 'Pediatrics',
    severity: 'High',
    status: 'New',
    title: 'Cross-department record access attempted without bypass',
    detail: "An attempt was made to view a cardiology record outside the user's assigned department.",
    ruleId: 'RULE-03-SCOPE-VIOLATION',
    evidence: { userRole: 'Nurse', userDepartment: 'Pediatrics', targetPatientId: 'MG-10482', targetDepartment: 'Cardiology', action: 'VIEW_RECORD', result: 'DENIED', ipAddress: '10.24.8.21' },
    timestamp: 'Today, 9:42 AM',
    createdAt: '2026-09-28T09:42:00Z',
    updatedAt: '2026-09-28T09:42:00Z',
  },
  {
    id: 'ALT-2046',
    alertType: 'REPEATED_FAILED_LOGIN',
    typeDisplayName: 'Multiple failed login attempts',
    userName: 'Unknown external device',
    severity: 'High',
    status: 'New',
    title: 'Potential brute-force authentication pattern',
    detail: 'Six failed sign-in attempts were recorded from an unrecognized device within five minutes.',
    ruleId: 'RULE-01-FAILED-LOGIN',
    evidence: { failedAttempts: 6, threshold: 5, timeWindowMinutes: 5, ipAddress: '198.51.100.24', targetEmails: ['admin@medguard.demo', 'root@medguard.demo'] },
    timestamp: 'Today, 8:12 AM',
    createdAt: '2026-09-28T08:12:00Z',
    updatedAt: '2026-09-28T08:12:00Z',
  },
  {
    id: 'ALT-2045',
    alertType: 'UNUSUAL_ACCESS_TIME',
    typeDisplayName: 'After-hours access',
    userId: 'USR-005',
    userName: 'Dr. Sameer Khan',
    userRole: 'Doctor',
    userDepartment: 'Neurology',
    severity: 'Medium',
    status: 'Resolved',
    title: 'Non-emergency record access during off-duty shift',
    detail: 'A patient record was accessed outside normal hours without an emergency access reason.',
    ruleId: 'RULE-04-OFF-HOURS',
    evidence: { accessTime: '23:48', shiftEnd: '20:00', emergencyMode: false, patientId: 'MG-10804' },
    timestamp: 'Yesterday, 11:48 PM',
    createdAt: '2026-09-27T23:48:00Z',
    updatedAt: '2026-09-27T23:48:00Z',
  },
  {
    id: 'ALT-2044',
    alertType: 'MASS_RECORD_RETRIEVAL',
    typeDisplayName: 'Emergency access used',
    userId: 'USR-006',
    userName: 'Dr. Priya Nair',
    userRole: 'Doctor',
    userDepartment: 'Emergency',
    severity: 'Low',
    status: 'Resolved',
    title: 'High-volume emergency triage access (False-Positive Filtered)',
    detail: 'Emergency access was correctly activated and securely logged for review without generating a mass-access alarm.',
    ruleId: 'RULE-05-EMERGENCY-EXCEPTION',
    evidence: { emergencyMode: true, userRole: 'Doctor', department: 'Emergency', recordsAccessed: 120, isFalsePositiveSuppressed: true },
    timestamp: 'Yesterday, 7:20 PM',
    createdAt: '2026-09-27T19:20:00Z',
    updatedAt: '2026-09-27T19:20:00Z',
  },
];

const initialInvestigations: Investigation[] = [
  {
    id: 'INV-5001',
    alertId: 'ALT-2048',
    assignedTo: 'USR-003',
    assignedOfficerName: 'Arjun Patel',
    status: 'Under Investigation',
    notes: 'Contacted Dr. Arjun Patel to verify whether bulk query was part of an authorized research batch or credential compromise. Account temporarily rate-limited.',
    createdAt: '2026-09-28T10:30:00Z',
    updatedAt: '2026-09-28T11:00:00Z',
  },
  {
    id: 'INV-5002',
    alertId: 'ALT-2045',
    assignedTo: 'USR-003',
    assignedOfficerName: 'Arjun Patel',
    status: 'Resolved',
    notes: 'Confirmed with Dr. Sameer Khan that he was called in for an urgent on-call neurology consultation.',
    resolutionSummary: 'Legitimate on-call consultation verified by department head.',
    createdAt: '2026-09-27T23:55:00Z',
    updatedAt: '2026-09-28T01:30:00Z',
  },
];

class DatabaseStore {
  private users: User[] = [...initialUsers];
  private patients: Patient[] = [...initialPatients];
  private accessLogs: AccessLog[] = [...initialAccessLogs];
  private loginAttempts: LoginAttempt[] = [...initialLoginAttempts];
  private alerts: Alert[] = [...initialAlerts];
  private investigations: Investigation[] = [...initialInvestigations];

  // Users
  getUsers(): User[] { return [...this.users]; }
  getUserById(id: string): User | undefined { return this.users.find(u => u.id === id); }
  getUserByEmail(email: string): User | undefined { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  addUser(user: Omit<User, 'createdAt' | 'updatedAt'> & { id?: string | undefined; createdAt?: string | undefined; updatedAt?: string | undefined }): User {
    const existingIndex = this.users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    const now = new Date().toISOString();
    const newUser: User = {
      id: user.id ?? `USR-${Math.floor(100 + Math.random() * 900)}`,
      name: user.name,
      email: user.email.toLowerCase(),
      role: user.role,
      department: user.department,
      status: user.status || 'Active',
      createdAt: user.createdAt || now,
      updatedAt: user.updatedAt || now,
    };
    if (existingIndex >= 0) {
      this.users[existingIndex] = newUser;
    } else {
      this.users.push(newUser);
    }
    return newUser;
  }

  // Patients
  getPatients(): Patient[] { return [...this.patients]; }
  getPatientById(id: string): Patient | undefined { return this.patients.find(p => p.id === id); }
  searchPatients(query: string, department?: string): Patient[] {
    const q = query.toLowerCase();
    return this.patients.filter(p => {
      const matchesDept = !department || department === 'All' || p.department.toLowerCase() === department.toLowerCase();
      const matchesText = !q || p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.diagnosis.toLowerCase().includes(q);
      return matchesDept && matchesText;
    });
  }

  // Access Logs
  getAccessLogs(): AccessLog[] { return [...this.accessLogs]; }
  addAccessLog(log: Omit<AccessLog, 'id' | 'timestamp'> & { id?: string | undefined; timestamp?: string | undefined }): AccessLog {
    const newLog: AccessLog = {
      id: log.id ?? `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: log.timestamp ?? 'Just now',
      userId: log.userId,
      userName: log.userName,
      userRole: log.userRole,
      userDepartment: log.userDepartment,
      patientId: log.patientId,
      patientName: log.patientName,
      patientDepartment: log.patientDepartment,
      action: log.action,
      emergencyMode: log.emergencyMode,
      success: log.success,
      result: log.result,
      reason: log.reason,
      ipAddress: log.ipAddress,
      riskLevel: log.riskLevel,
    };
    this.accessLogs.unshift(newLog);
    return newLog;
  }

  // Login Attempts
  getLoginAttempts(): LoginAttempt[] { return [...this.loginAttempts]; }
  addLoginAttempt(attempt: Omit<LoginAttempt, 'id' | 'timestamp'> & { id?: string | undefined; timestamp?: string | undefined }): LoginAttempt {
    const newAttempt: LoginAttempt = {
      id: attempt.id ?? `LGN-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: attempt.timestamp ?? 'Just now',
      email: attempt.email,
      userId: attempt.userId,
      success: attempt.success,
      ipAddress: attempt.ipAddress,
      userAgent: attempt.userAgent,
      failureReason: attempt.failureReason,
    };
    this.loginAttempts.unshift(newAttempt);
    return newAttempt;
  }

  // Alerts
  getAlerts(): Alert[] { return [...this.alerts]; }
  getAlertById(id: string): Alert | undefined { return this.alerts.find(a => a.id === id); }
  addAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'updatedAt'> & { id?: string | undefined }): Alert {
    const now = new Date().toISOString();
    const newAlert: Alert = {
      id: alert.id ?? `ALT-${Math.floor(2000 + Math.random() * 8000)}`,
      createdAt: now,
      updatedAt: now,
      alertType: alert.alertType,
      typeDisplayName: alert.typeDisplayName,
      userId: alert.userId,
      userName: alert.userName,
      userRole: alert.userRole,
      userDepartment: alert.userDepartment,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      detail: alert.detail,
      ruleId: alert.ruleId,
      evidence: alert.evidence,
      timestamp: alert.timestamp,
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }
  updateAlertStatus(id: string, status: AlertStatus): Alert | null {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = status;
      alert.updatedAt = new Date().toISOString();
      return { ...alert };
    }
    return null;
  }

  // Investigations
  getInvestigations(): Investigation[] { return [...this.investigations]; }
  getInvestigationByAlertId(alertId: string): Investigation | undefined { return this.investigations.find(i => i.alertId === alertId); }
  saveInvestigation(inv: { alertId: string; status: AlertStatus; notes?: string | undefined; assignedOfficerName?: string | undefined; resolutionSummary?: string | undefined }): Investigation {
    const existing = this.investigations.find(i => i.alertId === inv.alertId);
    const now = new Date().toISOString();
    if (existing) {
      existing.status = inv.status;
      if (inv.notes !== undefined) existing.notes = inv.notes;
      if (inv.assignedOfficerName !== undefined) existing.assignedOfficerName = inv.assignedOfficerName;
      if (inv.resolutionSummary !== undefined) existing.resolutionSummary = inv.resolutionSummary;
      existing.updatedAt = now;
      this.updateAlertStatus(inv.alertId, inv.status);
      return { ...existing };
    } else {
      const newInv: Investigation = {
        id: `INV-${Math.floor(5000 + Math.random() * 5000)}`,
        alertId: inv.alertId,
        status: inv.status,
        notes: inv.notes,
        assignedOfficerName: inv.assignedOfficerName ?? 'Arjun Patel',
        resolutionSummary: inv.resolutionSummary,
        createdAt: now,
        updatedAt: now,
      };
      this.investigations.unshift(newInv);
      this.updateAlertStatus(inv.alertId, inv.status);
      return newInv;
    }
  }

  // Reset database for test scenarios
  reset(): void {
    this.users = [...initialUsers];
    this.patients = [...initialPatients];
    this.accessLogs = [...initialAccessLogs];
    this.loginAttempts = [...initialLoginAttempts];
    this.alerts = [...initialAlerts];
    this.investigations = [...initialInvestigations];
  }
}

// Singleton database instance
export const db = new DatabaseStore();

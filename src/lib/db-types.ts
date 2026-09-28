export type UserRole = 'Doctor' | 'Nurse' | 'Security officer' | 'Administrator';
export type UserStatus = 'Active' | 'Review' | 'Suspended';
export type PatientGender = 'Male' | 'Female' | 'Other';
export type AccessAction = 'VIEW_RECORD' | 'SEARCH' | 'REQUEST_ACCESS' | 'EMERGENCY_ACCESS' | 'EXPORT_DATA' | 'BULK_ACCESS';
export type AccessResult = 'Allowed' | 'Denied' | 'Flagged' | 'Emergency';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertType = 'REPEATED_FAILED_LOGIN' | 'MASS_RECORD_RETRIEVAL' | 'ROLE_SCOPE_VIOLATION' | 'UNUSUAL_ACCESS_TIME';
export type AlertSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type AlertStatus = 'New' | 'Investigating' | 'Under Investigation' | 'Confirmed Suspicious' | 'Confirmed Legitimate' | 'Resolved';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  initials: string;
  age: number;
  gender: PatientGender;
  department: string;
  diagnosis: string;
  medicalHistory: string;
  treatment: string;
  assignedDoctor: string;
  assignedDoctorId?: string | undefined;
  lastAccessAt?: string | undefined;
  createdAt: string;
}

export interface AccessLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userDepartment: string;
  patientId?: string | undefined;
  patientName?: string | undefined;
  patientDepartment?: string | undefined;
  action: AccessAction;
  emergencyMode: boolean;
  success: boolean;
  result: AccessResult;
  reason?: string | undefined;
  ipAddress: string;
  riskLevel: RiskLevel;
  timestamp: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  userId?: string | undefined;
  success: boolean;
  ipAddress: string;
  userAgent?: string | undefined;
  failureReason?: string | undefined;
  timestamp: string;
}

export interface AlertEvidence {
  recordsAccessed?: number | undefined;
  threshold?: number | undefined;
  timeWindowMinutes?: number | undefined;
  departmentsAccessed?: number | undefined;
  emergencyMode?: boolean | undefined;
  ipAddress?: string | undefined;
  trigger?: string | undefined;
  userRole?: string | undefined;
  userDepartment?: string | undefined;
  targetPatientId?: string | undefined;
  targetDepartment?: string | undefined;
  action?: string | undefined;
  result?: string | undefined;
  failedAttempts?: number | undefined;
  targetEmails?: string[] | undefined;
  accessTime?: string | undefined;
  isFalsePositiveSuppressed?: boolean | undefined;
  [key: string]: unknown;
}

export interface Alert {
  id: string;
  alertType: AlertType;
  typeDisplayName: string;
  userId?: string | undefined;
  userName: string;
  userRole?: string | undefined;
  userDepartment?: string | undefined;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  detail: string;
  ruleId: string;
  evidence: AlertEvidence;
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface Investigation {
  id: string;
  alertId: string;
  assignedTo?: string | undefined;
  assignedOfficerName?: string | undefined;
  status: AlertStatus;
  notes?: string | undefined;
  resolutionSummary?: string | undefined;
  createdAt: string;
  updatedAt: string;
}

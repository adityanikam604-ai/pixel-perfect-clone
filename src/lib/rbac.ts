import { UserRole } from "./db-types";

export type Permission =
  | "view_patient_records"
  | "access_patient_record"
  | "view_security_dashboard"
  | "view_alerts"
  | "view_access_logs"
  | "investigate_alerts"
  | "manage_users"
  | "manage_security_rules"
  | "view_my_activity"
  | "view_profile";

/**
 * Standard Role to Permission Matrix (MedGuard Security Architecture)
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  Doctor: [
    "view_patient_records",
    "access_patient_record",
    "view_my_activity",
    "view_profile",
  ],
  Nurse: [
    "view_patient_records",
    "access_patient_record",
    "view_my_activity",
    "view_profile",
  ],
  "Security officer": [
    "view_security_dashboard",
    "view_alerts",
    "view_access_logs",
    "investigate_alerts",
    "view_profile",
  ],
  Administrator: [
    "view_patient_records",
    "access_patient_record",
    "view_access_logs",
    "manage_users",
    "manage_security_rules",
    "view_my_activity",
    "view_profile",
  ],
};

/**
 * Frontend Page to Required Permission Mapping
 */
export const PAGE_PERMISSIONS: Record<string, Permission> = {
  dashboard: "view_patient_records",
  patients: "view_patient_records",
  "patient-detail": "access_patient_record",
  activity: "view_my_activity",
  emergency: "access_patient_record",
  "security-dashboard": "view_security_dashboard",
  alerts: "view_alerts",
  investigation: "investigate_alerts",
  logs: "view_access_logs",
  users: "manage_users",
  rules: "manage_security_rules",
  profile: "view_profile",
};

/**
 * Check if a given role has a specific permission
 */
export function hasPermission(role: UserRole | string | undefined, permission: Permission): boolean {
  if (!role) return false;
  // Normalize role string (e.g. 'Security Officer' -> 'Security officer', 'Admin' -> 'Administrator')
  const normalizedRole = normalizeRole(role);
  if (!normalizedRole) return false;
  
  const permissions = ROLE_PERMISSIONS[normalizedRole];
  return Boolean(permissions && permissions.includes(permission));
}

/**
 * Check if a role can access a specific frontend page
 */
export function canAccessPage(role: UserRole | string | undefined, page: string): boolean {
  if (page === "login") return true;
  if (!role) return false;

  const requiredPermission = PAGE_PERMISSIONS[page];
  if (!requiredPermission) return true; // Default allowed if not explicitly guarded

  return hasPermission(role, requiredPermission);
}

/**
 * Normalize role strings safely across frontend, database, and backend
 */
export function normalizeRole(role: string): UserRole | null {
  const clean = role.trim().toLowerCase();
  if (clean === "doctor") return "Doctor";
  if (clean === "nurse") return "Nurse";
  if (clean === "security officer" || clean === "security" || clean === "security_officer") return "Security officer";
  if (clean === "administrator" || clean === "admin") return "Administrator";
  return null;
}

/**
 * Get default authorized landing page for a role
 */
export function getDefaultRouteForRole(role: UserRole | string | undefined): string {
  const norm = role ? normalizeRole(role) : null;
  if (norm === "Security officer") {
    return "/security/dashboard";
  }
  if (norm === "Administrator") {
    return "/security/users";
  }
  return "/doctor/dashboard";
}

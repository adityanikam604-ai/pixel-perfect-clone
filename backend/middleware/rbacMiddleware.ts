import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';
import { UserRole } from '../../src/lib/db-types';
import { db } from '../../src/lib/db-store';
import { Permission, hasPermission, normalizeRole } from '../../src/lib/rbac';

/**
 * Enforce RBAC permission check on backend routes
 */
export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!hasPermission(req.user.role, permission)) {
      // Log unauthorized access attempt to audit trail
      db.addAccessLog({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        userDepartment: req.user.department,
        action: 'VIEW_RECORD',
        emergencyMode: false,
        success: false,
        result: 'Denied',
        reason: `RBAC Violation: User with role '${req.user.role}' lacks required permission '${permission}'`,
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        riskLevel: 'High',
      });

      res.status(403).json({
        error: 'Forbidden: Insufficient permissions for this operation',
        requiredPermission: permission,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Enforce minimum Role required (e.g. ['Security officer', 'Administrator'])
 */
export function requireRoles(roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    const normUserRole = normalizeRole(req.user.role);
    const isAllowed = roles.some((r) => normalizeRole(r) === normUserRole);

    if (!isAllowed) {
      // Log unauthorized access attempt
      db.addAccessLog({
        userId: req.user.id,
        userName: req.user.name,
        userRole: req.user.role,
        userDepartment: req.user.department,
        action: 'VIEW_RECORD',
        emergencyMode: false,
        success: false,
        result: 'Denied',
        reason: `Role unauthorized: Requires [${roles.join(', ')}], user has role '${req.user.role}'`,
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1',
        riskLevel: 'High',
      });

      res.status(403).json({
        error: 'Forbidden: Insufficient permissions for this role',
        requiredRoles: roles,
        userRole: req.user.role,
      });
      return;
    }

    next();
  };
}

/**
 * Enforce Clinical Department Scope Check
 * Cardiology clinician cannot view Neurology patient unless Emergency mode is active
 */
export function checkPatientScope(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const patientId = req.params.id;
  const isEmergency = req.headers['x-emergency-access'] === 'true' || req.query.emergency === 'true';

  if (!patientId) {
    return next();
  }

  const patient = db.getPatientById(patientId);
  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  // Security officer and Administrator have administrative oversight
  if (req.user.role === 'Security officer' || req.user.role === 'Administrator') {
    return next();
  }

  // Same department match -> Allowed
  const isDepartmentMatch = req.user.department.toLowerCase() === patient.department.toLowerCase();

  if (isDepartmentMatch) {
    return next();
  }

  // Emergency Exception Handler (PRD Section 16 & Rule 4)
  if (isEmergency && req.user.role === 'Doctor') {
    // Authorized emergency access allowed but specifically tagged
    (req as any).isEmergencyAccess = true;
    return next();
  }

  // Otherwise: Role/Scope Violation (PRD FR-08 & Rule 3)
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '10.24.8.21';

  // Log denied attempt immediately
  db.addAccessLog({
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    userDepartment: req.user.department,
    patientId: patient.id,
    patientName: patient.name,
    patientDepartment: patient.department,
    action: 'REQUEST_ACCESS',
    emergencyMode: false,
    success: false,
    result: 'Denied',
    reason: `Department mismatch: ${req.user.role} in '${req.user.department}' attempted access to '${patient.department}' record`,
    ipAddress: clientIp,
    riskLevel: 'High',
  });

  // Trigger Scope Violation Alert
  db.addAlert({
    alertType: 'ROLE_SCOPE_VIOLATION',
    typeDisplayName: 'Unauthorized department access',
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    userDepartment: req.user.department,
    severity: 'High',
    status: 'New',
    title: 'Cross-department record access attempted without bypass',
    detail: `An attempt was made by ${req.user.name} (${req.user.role} - ${req.user.department}) to view patient ${patient.name} (${patient.id}) in ${patient.department}.`,
    ruleId: 'RULE-03-SCOPE-VIOLATION',
    evidence: {
      userRole: req.user.role,
      userDepartment: req.user.department,
      targetPatientId: patient.id,
      targetDepartment: patient.department,
      action: 'VIEW_RECORD',
      result: 'DENIED',
      ipAddress: clientIp,
    },
    timestamp: 'Just now',
  });

  res.status(403).json({
    error: 'Access Restricted: Department scope mismatch',
    patientDepartment: patient.department,
    userDepartment: req.user.department,
    emergencyEligible: req.user.role === 'Doctor',
    message: 'You can request emergency override if clinically indicated.',
  });
}

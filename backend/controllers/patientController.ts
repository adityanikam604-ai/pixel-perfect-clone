import { Response } from 'express';
import { db } from '../../src/lib/db-store';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const listPatients = (req: AuthenticatedRequest, res: Response): void => {
  const query = (req.query.q as string) || '';
  const department = (req.query.department as string) || 'All';
  const patients = db.searchPatients(query, department);

  // Log search query action if specified
  if (req.user && query) {
    db.addAccessLog({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      userDepartment: req.user.department,
      action: 'SEARCH',
      emergencyMode: false,
      success: true,
      result: 'Allowed',
      reason: `Patient search query: '${query}', department filter: '${department}'`,
      ipAddress: (req.headers['x-forwarded-for'] as string) || '10.24.8.14',
      riskLevel: 'Low',
    });
  }

  res.json({
    total: patients.length,
    patients,
  });
};

export const getPatientById = (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const patient = db.getPatientById(id);

  if (!patient) {
    res.status(404).json({ error: 'Patient not found' });
    return;
  }

  const isEmergency = (req as any).isEmergencyAccess || req.headers['x-emergency-access'] === 'true';
  const clientIp = (req.headers['x-forwarded-for'] as string) || '10.24.8.14';

  if (req.user) {
    // Record successful access in audit logs
    db.addAccessLog({
      userId: req.user.id,
      userName: req.user.name,
      userRole: req.user.role,
      userDepartment: req.user.department,
      patientId: patient.id,
      patientName: patient.name,
      patientDepartment: patient.department,
      action: isEmergency ? 'EMERGENCY_ACCESS' : 'VIEW_RECORD',
      emergencyMode: isEmergency,
      success: true,
      result: isEmergency ? 'Emergency' : 'Allowed',
      reason: isEmergency
        ? 'Emergency override activated by clinician with recorded justification'
        : 'Authorized clinical scope consultation',
      ipAddress: clientIp,
      riskLevel: 'Low',
    });
  }

  res.json({
    patient,
    accessGranted: true,
    emergencyOverrideUsed: isEmergency,
  });
};

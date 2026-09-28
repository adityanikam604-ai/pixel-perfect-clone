import { Response } from 'express';
import { db } from '../../src/lib/db-store';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const listLogs = (req: AuthenticatedRequest, res: Response): void => {
  const logs = db.getAccessLogs();
  const filter = req.query.filter as string;

  let filtered = logs;
  if (filter && filter !== 'All') {
    filtered = logs.filter(l => l.result === filter || l.riskLevel === filter || l.userRole === filter);
  }

  res.json({
    total: filtered.length,
    logs: filtered,
  });
};

export const getMyLogs = (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const logs = db.getAccessLogs().filter(l => l.userId === req.user?.id);
  res.json({
    total: logs.length,
    logs,
  });
};

export const createLog = (req: AuthenticatedRequest, res: Response): void => {
  const {
    patientId,
    patientName,
    patientDepartment,
    action,
    emergencyMode,
    success,
    result,
    reason,
    riskLevel,
  } = req.body;

  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const newLog = db.addAccessLog({
    userId: req.user.id,
    userName: req.user.name,
    userRole: req.user.role,
    userDepartment: req.user.department,
    patientId,
    patientName,
    patientDepartment,
    action: action || 'VIEW_RECORD',
    emergencyMode: Boolean(emergencyMode),
    success: success !== undefined ? success : true,
    result: result || 'Allowed',
    reason: reason || 'Monitored activity',
    ipAddress: (req.headers['x-forwarded-for'] as string) || '10.24.8.14',
    riskLevel: riskLevel || 'Low',
  });

  res.status(201).json({ log: newLog });
};

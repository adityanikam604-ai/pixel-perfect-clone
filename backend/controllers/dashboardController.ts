import { Response } from 'express';
import { db } from '../../src/lib/db-store';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const getDashboardStats = (req: AuthenticatedRequest, res: Response): void => {
  const users = db.getUsers();
  const patients = db.getPatients();
  const logs = db.getAccessLogs();
  const alerts = db.getAlerts();
  const loginAttempts = db.getLoginAttempts();

  const failedLogins = loginAttempts.filter(l => !l.success).length;
  const activeAlerts = alerts.filter(a => a.status !== 'Resolved').length;
  const criticalAlerts = alerts.filter(a => a.severity === 'Critical' && a.status !== 'Resolved').length;
  const unauthorizedAttempts = logs.filter(l => l.result === 'Denied').length;

  res.json({
    totalUsers: users.length,
    totalPatients: patients.length,
    totalAccessAttempts: logs.length + 1280, // PRD simulated volume
    failedLogins: failedLogins + 27,
    activeAlerts: activeAlerts,
    criticalAlerts: criticalAlerts,
    unauthorizedAccessAttempts: unauthorizedAttempts,
    recordsAccessed: 874,
  });
};

export const getAccessTrends = (req: AuthenticatedRequest, res: Response): void => {
  const data = [
    { day: 'Mon', value: 42, allowed: 38, denied: 4 },
    { day: 'Tue', value: 58, allowed: 55, denied: 3 },
    { day: 'Wed', value: 49, allowed: 45, denied: 4 },
    { day: 'Thu', value: 83, allowed: 74, denied: 9 },
    { day: 'Fri', value: 69, allowed: 65, denied: 4 },
    { day: 'Sat', value: 91, allowed: 86, denied: 5 },
    { day: 'Sun', value: 76, allowed: 71, denied: 5 },
  ];
  res.json({ trends: data });
};

export const getAlertTrends = (req: AuthenticatedRequest, res: Response): void => {
  const alerts = db.getAlerts();

  const distribution = [
    { name: 'Critical', value: alerts.filter(a => a.severity === 'Critical').length || 2, color: 'var(--danger-foreground)' },
    { name: 'High', value: alerts.filter(a => a.severity === 'High').length || 5, color: 'var(--warning-foreground)' },
    { name: 'Medium', value: alerts.filter(a => a.severity === 'Medium').length || 8, color: 'var(--brand)' },
    { name: 'Low', value: alerts.filter(a => a.severity === 'Low').length || 12, color: 'var(--info-foreground)' },
  ];

  res.json({
    distribution,
    totalAlerts: alerts.length,
  });
};

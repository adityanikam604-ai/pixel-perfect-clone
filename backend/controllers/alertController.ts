import { Response } from 'express';
import { db } from '../../src/lib/db-store';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AlertStatus } from '../../src/lib/db-types';

export const listAlerts = (req: AuthenticatedRequest, res: Response): void => {
  const alerts = db.getAlerts();
  const filter = req.query.filter as string;

  let filtered = alerts;
  if (filter && filter !== 'All') {
    filtered = alerts.filter(a => a.severity === filter || a.status === filter);
  }

  res.json({
    total: filtered.length,
    alerts: filtered,
  });
};

export const getAlertById = (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const alert = db.getAlertById(id);

  if (!alert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  const investigation = db.getInvestigationByAlertId(id);

  res.json({
    alert,
    investigation: investigation || null,
  });
};

export const updateAlert = (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { status, notes } = req.body;

  if (!status) {
    res.status(400).json({ error: 'Status is required' });
    return;
  }

  const updatedAlert = db.updateAlertStatus(id, status as AlertStatus);
  if (!updatedAlert) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  if (notes || status) {
    db.saveInvestigation({
      alertId: id,
      status: status as AlertStatus,
      notes,
      assignedOfficerName: req.user?.name || 'Arjun Patel',
    });
  }

  res.json({
    message: 'Alert updated successfully',
    alert: updatedAlert,
  });
};

export const exportAlertsCsv = (req: AuthenticatedRequest, res: Response): void => {
  const alerts = db.getAlerts();

  const headers = ['Alert ID', 'Type', 'User', 'Severity', 'Status', 'Timestamp', 'Rule ID', 'Detail'];
  const rows = alerts.map(a => [
    a.id,
    `"${a.typeDisplayName.replace(/"/g, '""')}"`,
    `"${a.userName.replace(/"/g, '""')}"`,
    a.severity,
    a.status,
    `"${a.timestamp}"`,
    a.ruleId,
    `"${a.detail.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="medguard-security-alerts.csv"');
  res.send(csv);
};

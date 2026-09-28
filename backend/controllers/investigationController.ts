import { Response } from 'express';
import { db } from '../../src/lib/db-store';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AlertStatus } from '../../src/lib/db-types';

export const listInvestigations = (req: AuthenticatedRequest, res: Response): void => {
  const investigations = db.getInvestigations();
  res.json({
    total: investigations.length,
    investigations,
  });
};

export const getInvestigationByAlertId = (req: AuthenticatedRequest, res: Response): void => {
  const { alertId } = req.params;
  const investigation = db.getInvestigationByAlertId(alertId);

  if (!investigation) {
    res.status(404).json({ error: 'Investigation case not found' });
    return;
  }

  res.json({ investigation });
};

export const saveInvestigation = (req: AuthenticatedRequest, res: Response): void => {
  const { alertId, status, notes, assignedOfficerName, resolutionSummary } = req.body;

  if (!alertId || !status) {
    res.status(400).json({ error: 'alertId and status are required' });
    return;
  }

  const investigation = db.saveInvestigation({
    alertId,
    status: status as AlertStatus,
    notes,
    assignedOfficerName: assignedOfficerName || req.user?.name || 'Arjun Patel',
    resolutionSummary,
  });

  res.json({
    message: 'Investigation case saved',
    investigation,
  });
};

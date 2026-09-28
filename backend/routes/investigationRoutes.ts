import { Router } from 'express';
import { listInvestigations, getInvestigationByAlertId, saveInvestigation } from '../controllers/investigationController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';

const router = Router();

router.get('/', authMiddleware, requirePermission('investigate_alerts'), listInvestigations);
router.get('/:alertId', authMiddleware, requirePermission('investigate_alerts'), getInvestigationByAlertId);
router.post('/', authMiddleware, requirePermission('investigate_alerts'), saveInvestigation);

export default router;

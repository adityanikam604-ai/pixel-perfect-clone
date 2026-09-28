import { Router } from 'express';
import { listAlerts, getAlertById, updateAlert, exportAlertsCsv } from '../controllers/alertController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';

const router = Router();

// Export CSV
router.get('/export', authMiddleware, requirePermission('view_alerts'), exportAlertsCsv);

// Alert list & details
router.get('/', authMiddleware, requirePermission('view_alerts'), listAlerts);
router.get('/:id', authMiddleware, requirePermission('view_alerts'), getAlertById);
router.patch('/:id', authMiddleware, requirePermission('investigate_alerts'), updateAlert);

export default router;

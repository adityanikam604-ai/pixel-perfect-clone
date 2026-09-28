import { Router } from 'express';
import { listLogs, getMyLogs, createLog } from '../controllers/logController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';

const router = Router();

router.get('/my', authMiddleware, getMyLogs);
router.get('/', authMiddleware, requirePermission('view_access_logs'), listLogs);
router.post('/', authMiddleware, createLog);

export default router;

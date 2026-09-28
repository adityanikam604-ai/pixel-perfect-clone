import { Router } from 'express';
import { getDashboardStats, getAccessTrends, getAlertTrends } from '../controllers/dashboardController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.get('/stats', authMiddleware, getDashboardStats);
router.get('/access-trends', authMiddleware, getAccessTrends);
router.get('/alert-trends', authMiddleware, getAlertTrends);

export default router;

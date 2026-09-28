import { Router } from 'express';
import { listUsers, getUserById, createUser } from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';

const router = Router();

// Only Administrators with 'manage_users' permission can access user management
router.get('/', authMiddleware, requirePermission('manage_users'), listUsers);
router.get('/:id', authMiddleware, requirePermission('manage_users'), getUserById);
router.post('/', authMiddleware, requirePermission('manage_users'), createUser);

export default router;

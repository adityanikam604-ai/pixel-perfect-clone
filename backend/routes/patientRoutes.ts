import { Router } from 'express';
import { listPatients, getPatientById } from '../controllers/patientController';
import { authMiddleware } from '../middleware/authMiddleware';
import { checkPatientScope, requirePermission } from '../middleware/rbacMiddleware';

const router = Router();

// Clinicians and Admins with 'view_patient_records' permission can search/list patients
router.get('/', authMiddleware, requirePermission('view_patient_records'), listPatients);

// Patient detail requires 'access_patient_record' permission
router.get('/:id', authMiddleware, requirePermission('access_patient_record'), getPatientById);

export default router;

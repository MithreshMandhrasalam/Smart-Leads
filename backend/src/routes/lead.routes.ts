import { Router } from 'express';
import { createLead, getLeads, getLeadById, updateLead, deleteLead, exportLeadsCSV } from '../controllers/lead.controller';
import { authenticate, authorizeRoles } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import { LeadStatus, LeadSource } from '../models/Lead';
import { UserRole } from '../models/User';

const router = Router();

router.use(authenticate);

router.get('/export', exportLeadsCSV);
router.get('/', getLeads);
router.get('/:id', getLeadById);

const leadValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('status').optional().isIn(Object.values(LeadStatus)).withMessage('Invalid status'),
  body('source').isIn(Object.values(LeadSource)).withMessage('Invalid source'),
];

router.post('/', leadValidation, createLead);
router.put('/:id', leadValidation, updateLead);
router.delete('/:id', authorizeRoles(UserRole.ADMIN), deleteLead); // Only admin can delete

export default router;

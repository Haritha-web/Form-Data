import express from 'express';
import { createEmployer, getEmployers, getEmployerById, updateEmployer, deleteEmployer, approveEmployer, usersByCategory } from '../controllers/employerController.js';
import { EmployerValidationRules } from '../validations/employerSignupValidations.js';
import { verifyEmployerToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create Employer
router.post('/create', EmployerValidationRules, createEmployer);

// Fetch All Employers
router.get('/get-all-employers', getEmployers);

// Fetch Single Employee On Id
router.get('/get-employer/:id', getEmployerById);

// Update Employer
router.put('/update-employer/:id', updateEmployer);

// Delete Employer
router.delete('/delete-employer/:id', deleteEmployer);

// Approved Employer by Super Admin
router.put('/approve/:id', approveEmployer);

// GET users by category (accessible only by logged-in Employer)
router.get('/users/:category', verifyEmployerToken, usersByCategory);

export default router;

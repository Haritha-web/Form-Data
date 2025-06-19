import express from 'express';
import { createEmployer, getEmployers, getEmployerById, updateEmployer, deleteEmployer, approveEmployer, usersByCategory } from '../controllers/employerController.js';
import { employerSignupValidations, updateEmployerValidations, deleteEmployerValidations, approveEmployerValidations, usersByCategoryValidations } from '../validations/employerValidations.js';
import { verifyEmployerToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create Employer
router.post('/create', employerSignupValidations, createEmployer);

// Fetch All Employers
router.get('/get-all-employers', verifyEmployerToken, getEmployers);

// Fetch Single Employee On Id
router.get('/get-employer/:id', verifyEmployerToken, getEmployerById);

// Update Employer
router.put('/update-employer/:id', verifyEmployerToken, updateEmployerValidations, updateEmployer);

// Delete Employer
router.delete('/delete-employer/:id', verifyEmployerToken, deleteEmployerValidations, deleteEmployer);

// Approved Employer by Super Admin
router.put('/approve/:id', verifyEmployerToken, approveEmployerValidations, approveEmployer);

// GET users by category (accessible only by logged-in Employer)
router.get('/users/:category', verifyEmployerToken, usersByCategoryValidations, verifyEmployerToken, usersByCategory);

export default router;

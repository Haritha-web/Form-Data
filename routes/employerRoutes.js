import express from 'express';
import { createEmployer, getEmployers, loginEmployer, approveEmployer, sendEmployerOtp, resetEmployerPasswordWithOtp, usersByCategory } from '../controllers/employerController.js';
import { EmployerLoginValidations, EmployerForgorPasswordValidations, EmployerResetPasswordValidations } from '../validations/employerLoginValidations.js';
import { EmployerValidationRules } from '../validations/employerSignupValidations.js';
import { verifyEmployerToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create Employer
router.post('/create', EmployerValidationRules, createEmployer);

// Fetch All Employers
router.get('/get', getEmployers);

// Employer Login
router.post('/login', EmployerLoginValidations, loginEmployer);

// Approved Employer by Super Admin
router.put('/approve/:id', approveEmployer);

router.post('/forgot-password', EmployerForgorPasswordValidations, sendEmployerOtp);
router.post('/reset-password', EmployerResetPasswordValidations, resetEmployerPasswordWithOtp);

// GET users by category (accessible only by logged-in Employer)
router.get('/users/:category', verifyEmployerToken, usersByCategory);

export default router;

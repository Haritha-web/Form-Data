import express from 'express';
import { loginApi, sendOtp, resetPasswordWithOtp } from '../controllers/loginController.js';
import { loginValidations, forgotPasswordValidations, resetPasswordValidations } from '../validations/loginValidations.js';

const router = express.Router();

router.post('/login', loginValidations, loginApi);
router.post('/forgot-password', forgotPasswordValidations, sendOtp);
router.post('/reset-password', resetPasswordValidations, resetPasswordWithOtp);

export default router;

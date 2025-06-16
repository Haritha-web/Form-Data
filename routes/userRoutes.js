import express from 'express';
import multer from 'multer';
import { createUser, getUsers, getUserById, downloadExcel, downloadPDF, downloadUserPDF, loginUser, sendUserOtp, resetUserPasswordWithOtp} from '../controllers/userController.js';
import { userSignupValidations, resumeValidator } from '../validations/UserSignupValidations.js';
import { userLoginValidations, userForgotPasswordValidations, userResetPasswordValidations } from '../validations/userLoginValidations.js';

const router = express.Router();

// Multer Setup Inline (like your style)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Handle multiple fields (image and resume)
const uploadFields = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'resume', maxCount: 1 }
]);

// Create User
router.post('/create', uploadFields, resumeValidator, userSignupValidations, createUser);

// Fetch All Users
router.get('/get-all-users', getUsers);

// Fetch Single User By Id
router.get('/get-user/:id', getUserById);

// Login User
router.post('/login', userLoginValidations, loginUser);

router.post('/forgot-password', userForgotPasswordValidations, sendUserOtp);
router.post('/reset-password', userResetPasswordValidations, resetUserPasswordWithOtp);

// Download Excel
router.get('/download/excel', downloadExcel);

// Download PDF
router.get('/download/pdf', downloadPDF);
router.get('/download/pdf/:id', downloadUserPDF);

export default router;

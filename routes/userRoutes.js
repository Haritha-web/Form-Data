import express from 'express';
import multer from 'multer';
import { createUser, getUsers, downloadExcel, downloadPDF, downloadUserPDF, loginUser, sendUserOtp, resetUserPasswordWithOtp} from '../controllers/userController.js';
import { userValidationRules, resumeValidator } from '../validations/userSignupValidations.js';
import userLoginValidations from '../validations/userLoginValidations.js';

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
router.post('/create', uploadFields, resumeValidator, userValidationRules, createUser);

// Fetch All Users
router.get('/', getUsers);

// Login User
router.post('/login', userLoginValidations, loginUser);

router.post('/forgot-password', sendUserOtp);
router.post('/reset-password', resetUserPasswordWithOtp);

// Download Excel
router.get('/download/excel', downloadExcel);

// Download PDF
router.get('/download/pdf', downloadPDF);
router.get('/download/pdf/:id', downloadUserPDF);

export default router;

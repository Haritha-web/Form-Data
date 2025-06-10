import express from 'express';
import multer from 'multer';
import { createUser, getUsers, downloadExcel, downloadPDF, downloadUserPDF, loginWithEmail } from '../controllers/userController.js';
import { userValidationRules } from '../validations/userValidations.js';
import loginValidation from '../validations/loginVlidations.js';

const router = express.Router();

// Multer Setup Inline (like your style)
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Create User
router.post('/create', upload.single('image'), userValidationRules, createUser);

router.post('/login-email',loginValidation, loginWithEmail);

// Fetch All Users
router.get('/', getUsers);

// Download Excel
router.get('/download/excel', downloadExcel);

// Download PDF
router.get('/download/pdf', downloadPDF);
router.get('/download/pdf/:id', downloadUserPDF);

export default router;

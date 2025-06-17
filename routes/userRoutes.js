import express from 'express';
import multer from 'multer';
import { createUser, getUsers, getUserById, updateUser, downloadExcel, downloadPDF, downloadUserPDF } from '../controllers/userController.js';
import { userSignupValidations, userUpdateValidations } from '../validations/UserSignupValidations.js';
import { verifyUserToken } from '../middlewares/authMiddleware.js';

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
router.post('/create', uploadFields, userSignupValidations, createUser);

// Fetch All Users
router.get('/get-all-users', getUsers);

// Update User
router.put(
  '/update-user/:id',
  verifyUserToken, 
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'resume', maxCount: 1 }
  ]),
  userUpdateValidations,
  updateUser
);

// Fetch Single User By Id
router.get('/get-user/:id', getUserById);

// Download Excel
router.get('/download/excel', downloadExcel);

// Download PDF
router.get('/download/pdf', downloadPDF);
router.get('/download/pdf/:id', downloadUserPDF);

export default router;

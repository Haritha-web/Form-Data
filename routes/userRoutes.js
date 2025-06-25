import express from 'express';
import multer from 'multer';
import { createUser, getUsers, getUserById, updateUser, deleteUser, downloadExcel, downloadPDF, downloadUserPDF, bookmarkJob, getBookmarkedJobs, removeBookmarkedJob } from '../controllers/userController.js';
import { userSignupValidations, userUpdateValidations, userDeleteValidations } from '../validations/userValidations.js';
import { verifyToken, verifyUserToken } from '../middlewares/authMiddleware.js';

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
router.get('/get-all-users', verifyToken, getUsers);

// Fetch Single User By Id
router.get('/get-user/:id', verifyToken, getUserById);

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

// Delete User
router.delete('/delete-user/:id', userDeleteValidations, deleteUser);

// Download Excel
router.get('/download/excel', verifyToken, downloadExcel);

// Download PDF
router.get('/download/pdf', verifyToken, downloadPDF);
router.get('/download/pdf/:id', verifyToken, downloadUserPDF);

// Bookmark Jobs
router.post('/bookmark-job/:jobId', verifyUserToken, bookmarkJob);
router.get('/get-bookmarked-jobs', verifyUserToken, getBookmarkedJobs);
router.delete('/remove-bookmarked-job/:jobId', verifyUserToken, removeBookmarkedJob);

export default router;

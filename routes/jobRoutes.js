import express from 'express';
import {
  createJob,
  getJobById,
  getAllJobs,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  filterJobs
} from '../controllers/jobController.js';
import { validateCreateJob, validateUpdateJob, deleteJobValidation, getJobsByEmployerValidation } from '../validations/jobValidations.js';
import { applyToJob, getApplicantsForJob, getJobsAppliedByUser, checkIfUserAppliedToJob } from '../controllers/jobApplicationController.js';
import { verifyUserToken, verifyEmployerToken, verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes
router.post('/post-job', verifyEmployerToken, validateCreateJob, createJob);         // Create job
router.put('/update-job/:id', verifyEmployerToken, validateUpdateJob, updateJob);       // Update job
router.delete('/delete-job/:id', verifyEmployerToken, deleteJobValidation, deleteJob);    // Delete job
router.get('/get-jobs-by-employer/:employerId', verifyEmployerToken, getJobsByEmployerValidation, getJobsByEmployer);

router.post('/apply-job', verifyUserToken, applyToJob);
router.get('/applied-jobs/:userId', verifyUserToken, getJobsAppliedByUser);
router.get('/get-all-jobs', getAllJobs);         // Get all jobs
router.post('/check-applied-jobs/:jobId', verifyUserToken, checkIfUserAppliedToJob);
router.get('/filter-jobs', verifyUserToken, filterJobs);

router.get('/get-job/:id', getJobById);
router.get('/applicants/:jobId', verifyToken, getApplicantsForJob);

export default router;

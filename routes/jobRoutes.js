import express from 'express';
import {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
  getJobsByEmployer
} from '../controllers/jobController.js';
import { validateCreateJob, validateUpdateJob } from '../validations/jobValidations.js';
import { applyToJob, getApplicantsForJob, getJobsAppliedByUser } from '../controllers/jobApplicationController.js';
import { verifyUserToken, verifyEmployerToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes
router.post('/post-job', verifyEmployerToken, validateCreateJob, createJob);         // Create job
router.put('/update-job/:id', verifyEmployerToken, validateUpdateJob, updateJob);       // Update job
router.delete('/delete-job/:id', verifyEmployerToken, deleteJob);    // Delete job
router.get('/get-jobs-by-employer/:employerId', verifyEmployerToken, getJobsByEmployer);

router.post('/apply-job', verifyUserToken, applyToJob);
router.get('/applied-jobs/:userId', verifyUserToken, getJobsAppliedByUser);

router.get('/get-all-jobs', getAllJobs);         // Get all jobs
router.get('/applicants/:jobId', getApplicantsForJob);

export default router;

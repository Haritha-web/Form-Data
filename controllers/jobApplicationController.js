// controllers/jobApplicationController.js
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';

const applyToJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).send({ message: 'Job not found' });

    // Check for duplicate application
    const existing = await JobApplication.findOne({ user: userId, job: jobId });
    if (existing)
      return res.status(400).send({ message: 'You have already applied to this job' });

    const application = new JobApplication({
      user: userId,
      job: jobId,
    });

    await application.save();
    res.status(201).send({ message: 'Applied to job successfully', application });
  } catch (error) {
    res.status(500).send({ message: 'Error applying to job', error: error.message });
  }
};

const getApplicantsForJob = async (req, res) => {
  const { jobId } = req.params;

  try {
    const applications = await JobApplication.find({ job: jobId })
      .populate('user', 'firstName lastName email mobile') // fetch applicant info
      .populate('job', 'title companyName'); // fetch job info

    res.status(200).send({
      message: `Found ${applications.length} applicants`,
      applications,
    });
  } catch (err) {
    res.status(500).send({
      message: 'Failed to fetch applicants for this job',
      error: err.message,
    });
  }
};

const getJobsAppliedByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const applications = await JobApplication.find({ user: userId })
      .populate('job'); // Get full job details

    const appliedJobs = applications.map(app => ({
      appliedAt: app.appliedAt,
      status: app.status,
      job: app.job,
    }));

    res.status(200).send({
      message: `Found ${appliedJobs.length} jobs applied by user`,
      jobs: appliedJobs,
    });
  } catch (error) {
    res.status(500).send({
      message: 'Failed to fetch jobs applied by user',
      error: error.message,
    });
  }
};

const checkIfUserAppliedToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.body;

    if (!jobId || !userId) {
      return res.status(400).send({ message: 'Job ID and User ID are required' });
    }

    const alreadyApplied = await JobApplication.findOne({ job: jobId, user: userId });

    if (alreadyApplied) {
      return res.status(200).send({
        applied: true,
        message: 'User has already applied for this job',
      });
    } else {
      return res.status(200).send({
        applied: false,
        message: 'User has not applied for this job yet',
      });
    }
  } catch (error) {
    console.error('Job Apply Check Error:', error);
    res.status(500).send({ message: 'Server error while checking job application status' });
  }
};

export {
    applyToJob,
    getApplicantsForJob,
    getJobsAppliedByUser,
    checkIfUserAppliedToJob
};
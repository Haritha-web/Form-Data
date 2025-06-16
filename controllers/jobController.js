import Job from '../models/Job.js';
import logger from '../utils/loggers.js';

// Create Job
const createJob = async (req, res) => {
  try {
    const {
      jobTitle,
      companyName,
      location,
      employmentType,
      jobDescription,
      skills,
      experienceRequired,
      education,
      salaryRange,
      applicationDeadline,
      numberOfOpenings,
      applyMode,
      workMode,
      benefits,
    } = req.body;

    const createdBy = req.employer?.id || req.user?.id;

    if (!createdBy) {
      return res.status(400).send({ error: 'Invalid or missing creator identity' });
    }

    const newJob = new Job({
      jobTitle,
      companyName,
      location,
      employmentType,
      jobDescription,
      skills,
      experienceRequired,
      education,
      salaryRange,
      applicationDeadline,
      numberOfOpenings,
      applyMode,
      workMode,
      benefits,
      createdBy,
    });

    await newJob.save();
    res.status(201).send({ message: 'Job posted successfully', job: newJob });
  } catch (error) {
    logger.error('Job Post Error: ' + error.message);
    res.status(500).send({ error: 'Failed to post job' });
  }
};

// Get All Jobs
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).send(jobs);
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ error: 'Failed to fetch jobs' });
  }
};

// Update Job
const updateJob = async (req, res) => {
  try {
    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedJob) return res.status(404).send({ error: 'Job not found' });

    res.status(200).send({ message: 'Job updated successfully', updatedJob });
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ error: 'Failed to update job' });
  }
};

// Delete Job
const deleteJob = async (req, res) => {
  try {
    const deletedJob = await Job.findByIdAndDelete(req.params.id);
    if (!deletedJob) return res.status(404).send({ error: 'Job not found' });

    res.status(200).send({ message: 'Job deleted successfully' });
  } catch (error) {
    logger.error(error.message);
    res.status(500).send({ error: 'Failed to delete job' });
  }
};

export {
  createJob,
  getAllJobs,
  updateJob,
  deleteJob,
};

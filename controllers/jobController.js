import mongoose from 'mongoose';
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

// Get All Jobs (Only non-deleted)
const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.status(200).send(jobs);
  } catch (error) {
    logger.error('Get All Jobs Error: ' + error.message);
    res.status(500).send({ error: 'Failed to fetch jobs' });
  }
};

// Get Job by ID
const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ error: 'Invalid Job ID' });
    }

    const job = await Job.findOne({ _id: id, isDeleted: false });

    if (!job) {
      return res.status(404).send({ error: 'Job not found' });
    }

    res.status(200).send({ job });
  } catch (error) {
    logger.error('Get Job by ID Error: ' + error.message);
    console.error('Full Error:', error); // For debugging during development
    res.status(500).send({ error: 'Failed to fetch job details' });
  }
};

// Update Job (Only if created by the employer)
const updateJob = async (req, res) => {
  try {
    const employerId = req.employer?.id;
    if (!employerId) {
      return res.status(401).send({ error: 'Unauthorized: Employer ID missing' });
    }

    const job = await Job.findById(req.params.id);
    if (!job || job.isDeleted) {
      return res.status(404).send({ error: 'Job not found' });
    }

    if (job.createdBy.toString() !== employerId.toString()) {
      return res.status(403).send({ error: 'Forbidden: You can only update your own jobs' });
    }

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).send({ message: 'Job updated successfully', updatedJob });
  } catch (error) {
    logger.error('Update Job Error: ' + error.message);
    res.status(500).send({ error: 'Failed to update job' });
  }
};

// Soft Delete Job
const deleteJob = async (req, res) => {
  try {
    const employerId = req.employer?.id;
    if (!employerId) {
      return res.status(401).send({ error: 'Unauthorized: Employer ID missing' });
    }

    const job = await Job.findById(req.params.id);
    if (!job || job.isDeleted) {
      return res.status(404).send({ error: 'Job not found' });
    }

    if (job.createdBy.toString() !== employerId.toString()) {
      return res.status(403).send({ error: 'Forbidden: You can only delete your own jobs' });
    }

    job.isDeleted = true;
    await job.save();

    res.status(200).send({ message: 'Job soft-deleted successfully' });
  } catch (error) {
    logger.error('Soft Delete Job Error: ' + error.message);
    res.status(500).send({ error: 'Failed to delete job' });
  }
};

// Get Jobs by Employer ID
const getJobsByEmployer = async (req, res) => {
  try {
    const { employerId } = req.params;

    const jobs = await Job.find({
      createdBy: employerId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    if (jobs.length === 0) {
      return res.status(404).send({ message: 'No jobs found for this employer' });
    }

    res.status(200).send({ total: jobs.length, jobs });
  } catch (error) {
    logger.error('Get Jobs by Employer Error: ' + error.message);
    res.status(500).send({ error: 'Failed to fetch jobs' });
  }
};

const filterJobs = async (req, res) => {
  try {
    const { search } = req.query;

    const matchStage = {
      isDeleted: false,
    };

    const pipeline = [];

    if (search) {
      const regex = new RegExp(search, 'i'); // case-insensitive match
      matchStage.$or = [
        { jobTitle: { $regex: regex } },
        { companyName: { $regex: regex } },
        { location: { $regex: regex } },
        { employmentType: { $regex: regex } },
        { workMode: { $regex: regex } },
        { skills: { $in: [search] } }
      ];
    }

    pipeline.push({ $match: matchStage });
    pipeline.push({ $sort: { createdAt: -1 } });

    const jobs = await Job.aggregate(pipeline);

    if (jobs.length === 0) {
      return res.status(404).send({ message: 'No jobs found matching your search' });
    }

    res.status(200).send({ total: jobs.length, jobs });
  } catch (error) {
    logger.error('Aggregation Search Error: ' + error.message);
    res.status(500).send({ error: 'Failed to search jobs using aggregation' });
  }
};


export {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  filterJobs
};

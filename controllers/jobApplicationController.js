import path from 'path';
import ejs from 'ejs';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import Job from '../models/Job.js';
import JobApplication from '../models/JobApplication.js';

// 1. Apply to Job
const applyToJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).send({ message: 'Job not found' });

    const existing = await JobApplication.findOne({ user: userId, job: jobId });
    if (existing)
      return res.status(400).send({ message: 'You have already applied to this job' });

    const application = new JobApplication({ user: userId, job: jobId });
    await application.save();

    const user = await User.findById(userId);
    if (!user) return res.status(404).send({ message: 'User not found' });

    const templatePath = path.join(process.cwd(), 'templates', 'jobApplicationConfirmationTemplate.ejs');
    const html = await ejs.renderFile(templatePath, {
      firstName: user.firstName,
      jobTitle: job.jobTitle,
      companyName: job.companyName || 'Our Company'
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Application Received: ${job.jobTitle}`,
      html
    });

    res.status(201).send({ message: 'Applied to job successfully', application });

  } catch (error) {
    res.status(500).send({ message: 'Error applying to job', error: error.message });
  }
};

// 2. Get Applicants for a Job
const getApplicantsForJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const applications = await JobApplication.find({ job: jobId })
      .populate('user', 'firstName lastName email mobile')
      .populate('job', 'jobTitle companyName');

    res.status(200).send({
      message: `Found ${applications.length} applicants`,
      applications,
    });

  } catch (err) {
    res.status(500).send({
      message: 'Failed to fetch applicants',
      error: err.message,
    });
  }
};

// 3. Get Jobs Applied by User
const getJobsAppliedByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const applications = await JobApplication.find({ user: userId })
      .populate('job');

    const jobs = applications.map(app => ({
      appliedAt: app.appliedAt,
      status: app.status,
      job: app.job
    }));

    res.status(200).send({
      message: `Found ${jobs.length} jobs applied by user`,
      jobs,
    });

  } catch (error) {
    res.status(500).send({
      message: 'Failed to fetch jobs',
      error: error.message,
    });
  }
};

// 4. Check if User Applied to Job
const checkIfUserAppliedToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.body;

    if (!jobId || !userId) {
      return res.status(400).send({ message: 'Job ID and User ID required' });
    }

    const existing = await JobApplication.findOne({ job: jobId, user: userId });

    return res.status(200).send({
      applied: !!existing,
      message: existing ? 'User has already applied' : 'User has not applied',
    });

  } catch (error) {
    res.status(500).send({ message: 'Error checking application', error: error.message });
  }
};

// 5. Employer Updates Application Status
const updateApplicationStatusByEmployer = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const employerId = req.employer.id.toString(); // Ensure string comparison

    const validStatuses = ['Selected', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({ message: 'Status must be Selected or Rejected' });
    }

    const application = await JobApplication.findById(applicationId)
      .populate('user')
      .populate({ path: 'job', select: 'jobTitle companyName createdBy' });

    if (!application || !application.job) {
      return res.status(404).send({ message: 'Application or Job not found' });
    }

    const jobCreatedBy = application.job.createdBy?.toString();

    if (jobCreatedBy !== employerId) {
      return res.status(403).send({ message: 'Unauthorized: Not your job posting' });
    }

    application.status = status;
    await application.save();

    const templatePath = path.join(process.cwd(), 'templates', 'applicationStatusUpdateByEmployerTemplate.ejs');
    const html = await ejs.renderFile(templatePath, {
      firstName: application.user.firstName,
      jobTitle: application.job.jobTitle,
      companyName: application.job.companyName,
      newStatus: status
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: application.user.email,
      subject: `Update: Your Application for ${application.job.jobTitle}`,
      html
    });

    res.status(200).send({ message: `Application status updated to ${status}`, application });

  } catch (error) {
    res.status(500).send({ message: 'Server error updating status', error: error.message });
  }
};

export {
  applyToJob,
  getApplicantsForJob,
  getJobsAppliedByUser,
  checkIfUserAppliedToJob,
  updateApplicationStatusByEmployer
};

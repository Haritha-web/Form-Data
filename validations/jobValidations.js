import { body, param, validationResult } from 'express-validator';

// Create Job
const validateCreateJob = [
  body('jobTitle').notEmpty().withMessage('Job title is required'),
  body('companyName').notEmpty().withMessage('Company name is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('employmentType')
    .notEmpty().withMessage('Employment type is required')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'])
    .withMessage('Invalid employment type'),
  body('jobDescription')
    .notEmpty().withMessage('Job description is required'),
  body('skills')
    .isArray({ min: 1 }).withMessage('At least one skill is required'),
  body('experienceRequired')
    .notEmpty().withMessage('Experience is required'),
  body('education').notEmpty().withMessage('Education is required'),
  body('applyMode')
    .notEmpty().withMessage('Apply mode is required')
    .isIn(['Portal', 'Email', 'ExternalLink']),
  body('workMode')
    .notEmpty().withMessage('Work mode is required')
    .isIn(['On-site', 'Remote', 'Hybrid']),
  body('numberOfOpenings')
    .isInt({ min: 1 }).withMessage('Number of openings must be at least 1'),
  async (req, res, next) => {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
              const firstError = errors.array()[0]
              return res.status(400).json({errors: firstError.msg })
          }
          next();
      },
];

// Get Job By ID & Delete Job
const validateJobId = [
  param('id').isMongoId().withMessage('Invalid job ID'),
  async (req, res, next) => {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
              const firstError = errors.array()[0]
              return res.status(400).json({errors: firstError.msg })
          }
          next();
      },
];

// Update Job (partial validation — only if fields are sent)
const validateUpdateJob = [
  param('id').isMongoId().withMessage('Invalid job ID'),
  body('employmentType')
    .optional()
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance']),
  body('applyMode')
    .optional()
    .isIn(['Portal', 'Email', 'ExternalLink']),
  body('workMode')
    .optional()
    .isIn(['On-site', 'Remote', 'Hybrid']),
  body('numberOfOpenings')
    .optional()
    .isInt({ min: 1 }).withMessage('Number of openings must be at least 1'),
    async (req, res, next) => {
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                const firstError = errors.array()[0]
                return res.status(400).json({errors: firstError.msg })
            }
            next();
        },
];

export {
    validateCreateJob,
    validateJobId,
    validateUpdateJob
};
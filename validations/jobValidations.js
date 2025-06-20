import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Create Job
const validateCreateJob = [
  body('jobTitle')
    .notEmpty()
    .withMessage('Job title is required'),
  body('companyName')
    .notEmpty()
    .withMessage('Company name is required'),
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  body('employmentType')
    .notEmpty()
    .withMessage('Employment type is required')
    .isIn(['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'])
    .withMessage('Invalid employment type'),
  body('jobDescription')
    .notEmpty()
    .withMessage('Job description is required'),
  body('skills')
    .isArray({ min: 1 })
    .withMessage('At least one skill is required'),
  body('experienceRequired')
    .notEmpty()
    .withMessage('Experience is required'),
  body('education')
    .notEmpty()
    .withMessage('Education is required'),
  body('applyMode')
    .notEmpty()
    .withMessage('Apply mode is required')
    .isIn(['Portal', 'Email', 'ExternalLink']),
  body('workMode')
    .notEmpty()
    .withMessage('Work mode is required')
    .isIn(['On-site', 'Remote', 'Hybrid']),
  body('numberOfOpenings')
    .isInt({ min: 1 })
    .withMessage('Number of openings must be at least 1'),
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

const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid MongoDB ObjectId');
  }
  return true;
};

const deleteJobValidation = [
  param('id')
    .custom(isValidObjectId)
    .withMessage('Invalid Job ID format'),
    (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }
    next();
  }
];
const getJobsByEmployerValidation = [
  param('employerId')
    .custom(isValidObjectId)
    .withMessage('Invalid Employer ID format'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(422).json({
            errors: errors.array().map(err => ({
              field: err.param,
              message: err.msg
            }))
          });
        }
        next();
      }
];

export {
    validateCreateJob,
    validateUpdateJob,
    deleteJobValidation,
    getJobsByEmployerValidation
};
import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

const employerSignupValidations = [
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isAlpha()
    .withMessage('First name must be a String')
    .isLength({ min: 4 })
    .withMessage('First name must be at least 4 characters length'),

  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isAlpha()
    .withMessage('Last name must be an alphabets only'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Valid email required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({min:8})
    .withMessage('Password must be atleast 8 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must include atleast one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must include atleast one lowercase letter')
    .matches(/\d/)
    .withMessage('Password must include atleast one number')
    .matches(/[!@#$%^&*(),.?:{}|<>]/)
    .withMessage('Password must include atleast one special character'),

  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number. Must be 10 digits starting with 6.'),

  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender'),

  body('dob')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Valid DOB required'),

  body('companyName')
    .notEmpty()
    .withMessage('Company name is required'),

  body('companyAddress.city')
    .notEmpty()
    .withMessage('City is required'),

  body('companyAddress.state')
    .notEmpty()
    .withMessage('State is required'),

  body('companyAddress.country')
    .notEmpty()
    .withMessage('Country is required'),

  body('companyAddress.pincode')
    .notEmpty()
    .withMessage('Pincode is required')
    .isPostalCode('any')
    .withMessage('Invalid pincode format'),
    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const firstError = errors.array()[0]
            return res.status(400).json({errors: firstError.msg })
        }
        next();
    },
];

// Utility to check for a valid MongoDB ObjectId
const isValidObjectId = (value) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw new Error('Invalid MongoDB ID');
  }
  return true;
};

const updateEmployerValidations = [
  // Validate ID
  param('id').custom(isValidObjectId),

  // Block email and password updates
  body('email')
    .not().exists()
    .withMessage('Email cannot be updated'),
  body('password')
    .not().exists()
    .withMessage('Password cannot be updated'),

  // Optional fields (validate if present)
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  body('mobile')
    .optional()
    .isMobilePhone()
    .withMessage('Valid mobile number required'),
  body('gender')
    .optional()
    .notEmpty()
    .withMessage('Gender cannot be empty'),
  body('dob')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be in ISO format (YYYY-MM-DD)'),
  body('companyName')
    .optional()
    .notEmpty()
    .withMessage('Company name cannot be empty'),
  body('companyAddress.city')
    .optional()
    .notEmpty()
    .withMessage('City cannot be empty'),
  body('companyAddress.state')
    .optional()
    .notEmpty()
    .withMessage('State cannot be empty'),
  body('companyAddress.country')
    .optional().notEmpty()
    .withMessage('Country cannot be empty'),
  body('companyAddress.pincode')
    .optional().isPostalCode('IN')
    .withMessage('Valid pincode required'),
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

// Delete Employer Validation
const deleteEmployerValidations = [
  param('id').custom(isValidObjectId),
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

// Approve Employer Validation
const approveEmployerValidations = [
  param('id')
    .custom(isValidObjectId),
  body('action')
    .isIn(['Approved', 'Rejected'])
    .withMessage('Action must be Approved or Rejected'),
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

// Get Users by Category Validation
const usersByCategoryValidations = [
  param('category')
    .isIn(['Nurse', 'Plumber', 'Electrician', 'Office boy', 'House Keeping', 'HVAC Mevhanic'])
    .withMessage('Invalid category'),
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
     employerSignupValidations,
     updateEmployerValidations,
     deleteEmployerValidations,
     approveEmployerValidations,
     usersByCategoryValidations
};
import { body, validationResult } from 'express-validator';

const userSignupValidations = [
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
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender'),

  body('dob')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Valid DOB required'),

  body('lati')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be valid'),

  body('longi')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be valid'),
    
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn( [ 'Nurse', 'Plumber', 'Electrician', 'Office boy', 'House Keeping', 'HVAC Mevhanic' ] )
    .withMessage('Category is not valid. please select with in categories only'),

  body('experienceRange')
    .optional()
    .isIn(['0-1', '1-2', '2-3', '3-4', '4-5', '5+'])
    .withMessage('Invalid experience range'),
    
  body('keySkills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one key skill is required')
    .custom(skills => skills.every(skill => typeof skill === 'string')).withMessage('All key skills must be strings'),
    
  body('role')
    .optional()
    .isString().withMessage('Role must be a string')
    .isLength({ min: 2 }).withMessage('Role must be at least 2 characters'),

  body('currentDesignation')
    .optional()
    .isString().withMessage('Current designation must be a string')
    .isLength({ min: 2 }).withMessage('Designation must be at least 2 characters'),

  body('platform')
    .optional()
    .isString().withMessage('Platform must be a string'),

  body('model')
    .optional()
    .isString().withMessage('Model must be a string'),

  body('os_version')
    .optional()
    .isString().withMessage('OS version must be a string'),
  
    body('resume')
    .optional()
    .custom((value, { req }) => {
      const resumeFile = req.files?.['resume']?.[0];
      if (!resumeFile) return true; // optional

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.mimetype)) {
        throw new Error('Only PDF, DOC, or DOCX files are allowed for resume');
      }

      return true;
    }),
    async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const firstError = errors.array()[0]
            return res.status(400).json({errors: firstError.msg })
        }
        next();
    },
];

const userUpdateValidations = [
  body('firstName')
    .optional()
    .isAlpha()
    .withMessage('First name must be a String')
    .isLength({ min: 4 })
    .withMessage('First name must be at least 4 characters length'),

  body('lastName')
    .optional()
    .isAlpha()
    .withMessage('Last name must be an alphabets only'),

  body('mobile')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number. Must be 10 digits starting with 6.'),

  body('gender')
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Invalid gender'),

  body('dob')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Valid DOB required'),

  body('lati')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be valid'),

  body('longi')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be valid'),
    
  body('category')
    .optional()
    .isIn( [ 'Nurse', 'Plumber', 'Electrician', 'Office boy', 'House Keeping', 'HVAC Mevhanic' ] )
    .withMessage('Category is not valid. please select with in categories only'),

  body('experienceRange')
    .optional()
    .isIn(['0-1', '1-2', '2-3', '3-4', '4-5', '5+'])
    .withMessage('Invalid experience range'),
    
  body('keySkills')
    .optional()
    .isArray({ min: 1 })
    .withMessage('At least one key skill is required')
    .custom(skills => skills.every(skill => typeof skill === 'string')).withMessage('All key skills must be strings'),
    
  body('role')
    .optional()
    .isString().withMessage('Role must be a string')
    .isLength({ min: 2 }).withMessage('Role must be at least 2 characters'),

  body('currentDesignation')
    .optional()
    .isString().withMessage('Current designation must be a string')
    .isLength({ min: 2 }).withMessage('Designation must be at least 2 characters'),

  body('platform')
    .optional()
    .isString().withMessage('Platform must be a string'),

  body('model')
    .optional()
    .isString().withMessage('Model must be a string'),

  body('os_version')
    .optional()
    .isString().withMessage('OS version must be a string'),
  
    body('resume')
    .optional()
    .custom((value, { req }) => {
      const resumeFile = req.files?.['resume']?.[0];
      if (!resumeFile) return true; // optional

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(resumeFile.mimetype)) {
        throw new Error('Only PDF, DOC, or DOCX files are allowed for resume');
      }

      return true;
    }),
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
     userSignupValidations,
     userUpdateValidations
};
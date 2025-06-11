import { body, validationResult } from 'express-validator';

const vendorValidationRules = [
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
    .notEmpty()
    .withMessage('Date of Birth is required')
    .isISO8601()
    .toDate()
    .withMessage('Valid DOB required'),
    (req,res,next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const firstError = errors.array()[0]
            return res.status(400).json({errors: firstError.msg })
        }
        next();
    },
];

export {
     vendorValidationRules
};
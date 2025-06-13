import { body,validationResult } from 'express-validator';

const vendorLoginValidations = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),

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

    async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const firstError = errors.array()[0]
            return res.status(400).json({errors: firstError.msg })
        }
        next();
    },
];

const vendorForgorPasswordValidations = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),
    async (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const firstError = errors.array()[0]
            return res.status(400).json({errors: firstError.msg })
        }
        next();
    },
];

const vendorResetPasswordValidations = [
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email format'),
    
    body('otp')
        .notEmpty()
        .withMessage('Verification Code is required')
        .isString()
        .withMessage('Verification Code is in String Format Only'),

    body('newPassword')
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
    vendorLoginValidations,
    vendorForgorPasswordValidations,
    vendorResetPasswordValidations
};
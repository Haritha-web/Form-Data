import { body,validationResult } from 'express-validator';

const userLoginValidations = [
    body('email')
        .isEmail()
        .withMessage('Invalid email format'),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    (req,res,next)=>{
            const errors = validationResult(req);
            if(!errors.isEmpty()){
                const firstError = errors.array()[0]
                return res.status(400).json({errors: firstError.msg })
            }
            next();
        },
];

export default userLoginValidations;
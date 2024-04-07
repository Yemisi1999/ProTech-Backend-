// const Joi = require('joi');
import Joi from 'joi';



// Register Validation
const registerValidation = data => {
    const schema = Joi.object({
        username: Joi.string()
            .min(6)
            .required(),
        email: Joi.string()
            .email()
            .min(6)
            .required(),
        password: Joi.string()
            .min(8)
            .required(), 
    });

    return schema.validate(data);
}


// Login Validation
const loginValidation = data => {
    const schema = Joi.object({
        email: Joi.string()
            .email()
            .min(6)
            .required(),
        password: Joi.string()
            .min(6)
            .required(),
    })
    return schema.validate(data);
};

export {registerValidation, loginValidation}

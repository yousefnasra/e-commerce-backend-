import joi from "joi"

// Register
export const register = joi.object({
    userName: joi.string().min(3).max(20).required(),
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi.string().min(6).max(20).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
}).required();

// Activate Account
export const activateAccount = joi.object({
    token: joi.string().required(),
}).required();

// Login
export const login = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi.string().min(6).max(20).required(),
}).required();

// Forget Code
export const forgetCode = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
}).required();

// Reset Password
export const resetPassword = joi.object({
    email: joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }).required(),
    password: joi.string().min(6).max(20).required(),
    confirmPassword: joi.string().valid(joi.ref("password")).required(),
    forgetCode: joi.string().length(6).required(),
}).required();
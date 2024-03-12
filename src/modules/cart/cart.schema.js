import joi from "joi"
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

// add to cart
export const addToCart = joi.object({
    productId: joi.string().custom(ObjectIdValidation).required(),
    quantity: joi.number().integer().min(1).required(),
}).required();

// get user cart
export const getUserCart = joi.object({
    cartId: joi.string().custom(ObjectIdValidation),
}).required();

// update user cart
export const updateUserCart = joi.object({
    productId: joi.string().custom(ObjectIdValidation).required(),
    quantity: joi.number().integer().min(1).required(),
}).required();

// remove from cart
export const removeFromCart = joi.object({
    productId: joi.string().custom(ObjectIdValidation).required(),
}).required();

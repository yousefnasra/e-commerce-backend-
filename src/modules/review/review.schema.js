import joi from "joi"
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

export const addReview = joi.object({
    productId: joi.string().custom(ObjectIdValidation).required(),
    comment: joi.string().max(150).required(),
    rating: joi.number().integer().min(1).max(5).required(),
}).required();

export const updateReview = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
    productId: joi.string().custom(ObjectIdValidation).required(),
    comment: joi.string().max(150),
    rating: joi.number().integer().min(1).max(5),
}).required();
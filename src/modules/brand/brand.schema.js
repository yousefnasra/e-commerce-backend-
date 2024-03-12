import joi from "joi"
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

// create brand
export const createBrand = joi.object({
    name: joi.string().min(2).max(20).required(),
    categories: joi.array().items(joi.string().custom(ObjectIdValidation).required()).required(),
}).required();

// update brand
export const updateBrand = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
    name: joi.string().min(2).max(20),
}).required();

// delete brand
export const deleteBrand = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();
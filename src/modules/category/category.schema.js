import joi from "joi"
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

// create category
export const createCategory = joi.object({
    name: joi.string().min(5).max(20).required(),
}).required();

// update category
export const updateCategory = joi.object({
    name: joi.string().min(5).max(20),
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();

// delete category
export const deleteCategory = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();
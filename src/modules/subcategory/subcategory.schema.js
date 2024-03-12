import joi from "joi"
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

// create subcategory
export const createSubcategory = joi.object({
    name: joi.string().min(5).max(20).required(),
    categoryId: joi.string().custom(ObjectIdValidation).required(),
}).required();

// update subcategory
export const updateSubcategory = joi.object({
    name: joi.string().min(5).max(20),
    categoryId: joi.string().custom(ObjectIdValidation).required(),
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();

// delete subcategory
export const deleteSubcategory = joi.object({
    categoryId: joi.string().custom(ObjectIdValidation).required(),
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();

// all subcategory
export const allSubcategory = joi.object({
    categoryId: joi.string().custom(ObjectIdValidation),
}).required();
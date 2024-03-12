import joi from "joi"
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

// create product
export const createProduct = joi.object({
    name: joi.string().min(2).max(20).required(),
    description: joi.string().min(3).max(20).required(),
    availableItems: joi.number().integer().min(1).required(),
    price: joi.number().integer().min(1).required(),
    discount: joi.number().integer().min(1).max(70),
    category: joi.string().custom(ObjectIdValidation).required(true),
    subcategory: joi.string().custom(ObjectIdValidation).required(true),
    brand: joi.string().custom(ObjectIdValidation).required(true),
}).required();

// delete product
export const deleteProduct = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();
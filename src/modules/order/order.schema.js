import joi from "joi"
import { ObjectIdValidation } from "../../middleware/validation.middleware.js";

export const createOrder = joi.object({
    phone: joi.string().pattern(new RegExp('^(20)?01[0-25][0-9]{8}$')).required(),
    address: joi.string().min(3).required(),
    payment: joi.string().valid("cash", "visa"),
    coupon: joi.string().length(6),
}).required();

export const cancelOrder = joi.object({
    id: joi.string().custom(ObjectIdValidation).required(),
}).required();
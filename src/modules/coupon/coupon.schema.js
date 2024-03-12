import joi from "joi"

// create coupon
export const createCoupon = joi.object({
    discount: joi.number().integer().options({ convert: false }).min(1).max(70).required(),
    expiredAt: joi.date().greater(Date.now()).required(),
}).required();

// update coupon
export const updateCoupon = joi.object({
    code: joi.string().length(6).required(),
    discount: joi.number().integer().options({ convert: false }).min(1).max(70),
    expiredAt: joi.date().greater(Date.now()),
}).or("discount", "expiredAt").required();

// delete coupon
export const deleteCoupon = joi.object({
    code: joi.string().length(6).required(),
}).required();
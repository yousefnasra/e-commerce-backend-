import { Types } from "mongoose";

export const ObjectIdValidation = (value, helper) => {
    if (Types.ObjectId.isValid(value)) return true; //mongoose validation
    return helper.message("invalid objectId!");
}

export const validation = (schema) => {
    return (req, res, next) => {
        // data
        const data = { ...req.body, ...req.params, ...req.query };
        // validate data
        const validationResult = schema.validate(data, { abortEarly: false });
        // send errors if exist
        if (validationResult.error) {
            const errorMessages = validationResult.error.details.map((errorObj) => errorObj.message);
            return next(new Error(errorMessages, { cause: 400 }))
        }

        return next(); //next controller
    }
}
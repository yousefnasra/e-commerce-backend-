export const isAuthorized = (...roles) => {
    return (req, res, next) => {
        // check user role
        if (!roles.includes(req.user.role))
            return next(new Error("not authorized!", { cause: 401 }));
        // call next controller
        return next();
    }
}
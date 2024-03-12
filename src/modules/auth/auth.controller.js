import { User } from "../../../DB/models/user.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../utils/sendEmails.js";
import { resetPassTemp, signUpTemp } from "../../utils/htmlTemplates.js";
import { Token } from "../../../DB/models/token.model.js";
import Randomstring from "randomstring";
import { Cart } from "../../../DB/models/cart.model.js";

// Register
export const register = asyncHandler(async (req, res, next) => {
    // data from request
    const { email } = req.body;
    // check user existence
    const user = await User.findOne({ email });
    if (user)
        return next(new Error("user already exist!", { cause: 409 }));
    // generate token
    const token = jwt.sign({ email }, process.env.TOKEN_SECRET);
    // create user + hash password (using hash password hook)
    await User.create({ ...req.body });
    // create confirmationLink
    const confirmationLink = `http://localhost:3000/auth/activate_account/${token}`;
    // send email
    const messageSent = await sendEmail({
        to: email,
        subject: "Activate Account",
        html: signUpTemp(confirmationLink)
    });
    // check if email does not send
    if (!messageSent)
        return next(new Error("something went wrong!", { cause: 400 }));
    // send Response
    return res.status(201).json({ success: true, message: "check your email!" });
});

// Activate Account
export const activateAccount = asyncHandler(async (req, res, next) => {
    // data from request
    const { email } = jwt.verify(req.params.token, process.env.TOKEN_SECRET);
    // find user and update isConfirmed
    const user = await User.findOneAndUpdate({ email }, { isConfirmed: true });
    // check if the user does not exist
    if (!user)
        return next(new Error("user not found!", { cause: 404 }));
    // create a cart 
    await Cart.create({ user: user._id });
    // send response
    return res.json({ success: true, message: "you can login now!" });
});

// Login 
export const login = asyncHandler(async (req, res, next) => {
    // data from request
    const { email } = req.body;
    // check user existence
    const user = await User.findOne({ email });
    if (!user)
        return next(new Error("invalid email!", { cause: 404 }));
    // check user email isConfirmed
    if (!user.isConfirmed)
        return next(new Error("you must activate your email first!", { cause: 401 }));
    // check user password
    const match = bcryptjs.compareSync(req.body.password, user.password)
    if (!match)
        return next(new Error("invalid password!", { cause: 400 }));
    // generate token
    const token = jwt.sign({ email, id: user._id }, process.env.TOKEN_SECRET);
    // Save token in token model
    await Token.create({ token, user: user._id, agent: req.headers['user-agent'] });
    // send response
    return res.json({ success: true, rseults: { token } });
});

// Forget Code 
export const forgetCode = asyncHandler(async (req, res, next) => {
    // data from request
    const { email } = req.body;
    // check user existence
    const user = await User.findOne({ email });
    if (!user)
        return next(new Error("invalid email!", { cause: 404 }));
    //check activation code
    if (!user.isConfirmed)
        return next(new Error("you must activate your account first!", { cause: 401 }));
    // generate forget code
    const forgetCode = Randomstring.generate({
        charset: "numeric",
        length: 6,
    });
    // send email
    const messageSent = await sendEmail({
        to: email,
        subject: "Reset Password",
        html: resetPassTemp(forgetCode)
    });
    // check if email does not send
    if (!messageSent)
        return next(new Error("something went wrong!", { cause: 400 }));
    // save forget code in user model
    user.forgetCode = forgetCode;
    await user.save();
    // send Response
    return res.json({ success: true, message: "check your email!" });
});

// Reset Password 
export const resetPassword = asyncHandler(async (req, res, next) => {
    // data from request
    const { email, forgetCode, password } = req.body;
    // check user existence
    const user = await User.findOne({ email });
    if (!user)
        return next(new Error("invalid email!", { cause: 404 }));
    // check the forget code
    if (forgetCode !== user.forgetCode)
        return next(new Error("invalid code!", { cause: 400 }));
    // hash password (using hook) and save in user model
    user.password = password;
    await user.save();
    // find all token of the user 
    const tokens = await Token.find({ user: user._id });
    // invalidate all token
    tokens.forEach(async (token) => {
        token.isValid = false;
        await token.save();
    });
    // send Response
    return res.json({ success: true, message: "you can login now!" });
});
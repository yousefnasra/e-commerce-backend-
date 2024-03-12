import { Coupon } from "../../../DB/models/coupon.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import voucher_codes from "voucher-code-generator";

// create coupon
export const createCoupon = asyncHandler(async (req, res, next) => {
    // generate code 
    const code = voucher_codes.generate({ length: 6 });
    // create coupon in db
    const coupon = await Coupon.create({
        name: code[0],
        createdBy: req.user._id,
        discount: req.body.discount,
        expiredAt: new Date(req.body.expiredAt).getTime()
    });
    // send response
    return res.status(201).json({ success: true, message: "created successfully!", results: { coupon } });
});

// update coupon
export const updateCoupon = asyncHandler(async (req, res, next) => {
    // check coupon
    const coupon = await Coupon.findOne({
        name: req.params.code,
        expiredAt: { $gt: Date.now() },
    });
    if (!coupon)
        return next(new Error("invalid coupon!", { cause: 404 }));
    // check coupon seller owner
    if (req.user.id !== coupon.createdBy.toString())
        return next(new Error("not authorized!", { cause: 401 }));
    // update coupon + save in db
    coupon.discount = req.body.discount ? req.body.discount : coupon.discount;
    coupon.expiredAt = req.body.expiredAt ? new Date(req.body.expiredAt).getTime() : coupon.expiredAt;
    await coupon.save();
    // send response
    return res.json({ success: true, message: "coupon updated successfully!" });
});

// delete coupon
export const deleteCoupon = asyncHandler(async (req, res, next) => {
    // check coupon
    const coupon = await Coupon.findOne({ name: req.params.code });
    if (!coupon)
        return next(new Error("invalid coupon!", { cause: 404 }));
    // check coupon seller owner
    if (req.user.id !== coupon.createdBy.toString())
        return next(new Error("not authorized!", { cause: 401 }));
    // delete coupon + save in db
    await coupon.deleteOne();
    // send response
    return res.json({ success: true, message: "coupon deleted successfully!" });
});

// all coupons
export const allCoupons = asyncHandler(async (req, res, next) => {
    // admin == all coupons
    if (req.user.role === "admin") {
        const coupons = await Coupon.find();
        if (coupons.length == 0)
            return next(new Error("no coupons found!", { cause: 404 }));
        return res.json({ success: true, results: { coupons } });
    };
    // seller == his coupons
    if (req.user.role === "seller") {
        const coupons = await Coupon.find({ createdBy: req.user._id });
        if (coupons.length == 0)
            return next(new Error("no coupons found!", { cause: 404 }));
        return res.json({ success: true, results: { coupons } });
    };
});
import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as couponController from "./coupon.controller.js"
import * as couponSchema from "./coupon.schema.js"
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";

const router = Router();

// create coupon
router.post("/", isAuthenticated, isAuthorized("seller"), validation(couponSchema.createCoupon), couponController.createCoupon);

// update coupon
router.patch("/:code", isAuthenticated, isAuthorized("seller"), validation(couponSchema.updateCoupon), couponController.updateCoupon);

// delete coupon
router.delete("/:code", isAuthenticated, isAuthorized("seller"), validation(couponSchema.deleteCoupon), couponController.deleteCoupon);

// all coupon
router.get("/", isAuthenticated, isAuthorized("seller", "admin"), couponController.allCoupons);

export default router;
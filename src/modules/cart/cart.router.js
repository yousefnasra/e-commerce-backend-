import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as cartController from "./cart.controller.js"
import * as cartSchema from "./cart.schema.js"
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";

const router = Router();

// cart created when user activate his account 
// add to cart
router.post("/", isAuthenticated, isAuthorized("user"), validation(cartSchema.addToCart), cartController.addToCart);

// get user cart
router.get("/", isAuthenticated, isAuthorized("user", "admin"), validation(cartSchema.getUserCart), cartController.getUserCart);

// update user cart
router.patch("/", isAuthenticated, isAuthorized("user"), validation(cartSchema.updateUserCart), cartController.updateUserCart);

// remove product from cart
router.patch("/:productId", isAuthenticated, isAuthorized("user"), validation(cartSchema.removeFromCart), cartController.removeFromCart);

// remove product from cart
router.put("/", isAuthenticated, isAuthorized("user"), cartController.clearCart);

export default router;
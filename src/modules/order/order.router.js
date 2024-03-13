import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as orderController from "./order.controller.js";
import * as orderSchema from "./order.schema.js";
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import express from "express";

const router = Router();

// create order
router.post("/", isAuthenticated, isAuthorized("user"), validation(orderSchema.createOrder), orderController.createOrder);

// cancel order
router.patch("/:id", isAuthenticated, isAuthorized("user"), validation(orderSchema.cancelOrder), orderController.cancelOrder);

// webhook end >>> stripe
router.post('/webhook', express.raw({ type: 'application/json' }), orderController.orderWebhook); //req.body >> buffer

export default router;

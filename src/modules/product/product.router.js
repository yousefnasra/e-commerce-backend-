import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as productController from "./product.controller.js"
import * as productSchema from "./product.schema.js"
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";
import reviewRouter from "./../review/review.router.js"

const router = Router();

// reveiw
router.use("/:productId/review", reviewRouter);

// create product
router.post(
    "/",
    isAuthenticated,
    isAuthorized("seller"),
    fileUpload().fields([
        { name: "defaultImage", maxCount: 1 },
        { name: "subImages", maxCount: 3 }
    ]),
    validation(productSchema.createProduct),
    productController.createProduct
);

// delete product
router.delete(
    "/:id",
    isAuthenticated,
    isAuthorized("seller"),
    validation(productSchema.deleteProduct),
    productController.deleteProduct
);

// all products + search + sort + pagination + filter
router.get(
    "/",
    productController.allProducts
);

export default router;

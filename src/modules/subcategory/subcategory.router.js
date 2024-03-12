import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as subcategoryController from "./subcategory.controller.js"
import * as subcategorySchema from "./subcategory.schema.js"
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";

const router = Router({ mergeParams: true });

// create subcategory
router.post("/", isAuthenticated, isAuthorized("admin"), fileUpload().single("subcategory"), validation(subcategorySchema.createSubcategory), subcategoryController.createSubcategory);

// update subcategory
router.patch("/:id", isAuthenticated, isAuthorized("admin"), fileUpload().single("subcategory"), validation(subcategorySchema.updateSubcategory), subcategoryController.updateSubcategory);

// delete subcategory
router.delete("/:id", isAuthenticated, isAuthorized("admin"), validation(subcategorySchema.deleteSubcategory), subcategoryController.deleteSubcategory);

// all subcategory
router.get("/", validation(subcategorySchema.allSubcategory), subcategoryController.allSubcategory);

export default router;
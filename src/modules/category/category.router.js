import { Router } from "express";
import { validation } from "../../middleware/validation.middleware.js";
import * as categoryController from "./category.controller.js"
import * as categorySchema from "./category.schema.js"
import { isAuthenticated } from "../../middleware/authentication.middleware.js";
import { isAuthorized } from "../../middleware/authorization.middleware.js";
import { fileUpload } from "../../utils/fileUpload.js";
import subcategoryRouter from "./../subcategory/subcategory.router.js"

const router = Router();

// subcategory
router.use("/:categoryId/subcategory", subcategoryRouter);

// create category
router.post("/", isAuthenticated, isAuthorized("admin"), fileUpload().single("category"), validation(categorySchema.createCategory), categoryController.createCategory);

// update category
router.patch("/:id", isAuthenticated, isAuthorized("admin"), fileUpload().single("category"), validation(categorySchema.updateCategory), categoryController.updateCategory);

// delete category
router.delete("/:id", isAuthenticated, isAuthorized("admin"), validation(categorySchema.deleteCategory), categoryController.deleteCategory);

// all category
router.get("/", categoryController.allCategory);

export default router;
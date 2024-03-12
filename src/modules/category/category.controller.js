import slugify from "slugify";
import { Category } from "../../../DB/models/category.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";

// create category
export const createCategory = asyncHandler(async (req, res, next) => {
    // check image file
    if (!req.file)
        return next(new Error("category image is required!", { cause: 400 }));
    // check category name existence
    const isExist = await Category.findOne({ name: req.body.name });
    if (isExist)
        return next(new Error("category name already exist!", { cause: 409 }));
    // upload image in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: `${process.env.CLOUD_FOLDER_NAME}/category`,
        }
    );
    // save category in db
    await Category.create({
        name: req.body.name,
        slug: slugify(req.body.name),
        createdBy: req.user._id,
        image: { id: public_id, url: secure_url }
    });
    // send response
    return res.status(201).json({ success: true, message: "category created successfully!" });
});

// update category
export const updateCategory = asyncHandler(async (req, res, next) => {
    // check category in db
    const category = await Category.findById(req.params.id);
    if (!category)
        return next(new Error("category not found!", { cause: 404 }));
    // check category owner
    if (req.user._id.toString() !== category.createdBy.toString())
        return next(new Error("not allowed to update this category!", { cause: 401 }));
    // check file and update image in cloudinary
    if (req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { public_id: category.image.id });
        category.image = { id: public_id, url: secure_url };
    };
    // update category + save in db
    category.name = req.body.name ? req.body.name : category.name;
    category.slug = req.body.name ? slugify(req.body.name) : category.slug;
    await category.save();
    // send response 
    return res.json({ success: true, message: "category updated successfully!" });
});

// delete category
export const deleteCategory = asyncHandler(async (req, res, next) => {
    // check category in db
    const category = await Category.findById(req.params.id);
    if (!category)
        return next(new Error("category not found!", { cause: 404 }));
    // check category owner
    if (req.user._id.toString() !== category.createdBy.toString())
        return next(new Error("not allowed to update this category!", { cause: 401 }));
    // delete category from db
    await category.deleteOne();
    // delete image from cloudinary
    await cloudinary.uploader.destroy(category.image.id);
    // send response 
    return res.json({ success: true, message: "category deleted successfully!" });
});

// all category
export const allCategory = asyncHandler(async (req, res, next) => {
    const results = await Category.find().populate("subcategory");
    if (results.length == 0)
        return next(new Error("categories not found!", { cause: 404 }));
    // send response 
    return res.json({ success: true, results });
});
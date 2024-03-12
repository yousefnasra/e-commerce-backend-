import { asyncHandler } from "../../utils/asyncHandler.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { Category } from "../../../DB/models/category.model.js";
import cloudinary from "../../utils/cloud.js";
import slugify from "slugify";

// create subcategory
export const createSubcategory = asyncHandler(async (req, res, next) => {
    // check category in db
    const category = await Category.findById(req.params.categoryId);
    if (!category)
        return next(new Error("category not found!", { cause: 404 }));
    // check image file
    if (!req.file)
        return next(new Error("subcategory image is required!", { cause: 400 }));
    // check subcategory name existence
    const isExist = await Subcategory.findOne({ name: req.body.name });
    if (isExist)
        return next(new Error("subcategory name already exist!", { cause: 409 }));
    // upload image in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.file.path,
        {
            folder: `${process.env.CLOUD_FOLDER_NAME}/subcategory`,
        }
    );
    // save category in db
    await Subcategory.create({
        name: req.body.name,
        slug: slugify(req.body.name),
        createdBy: req.user._id,
        image: { id: public_id, url: secure_url },
        categoryId: req.params.categoryId
    });
    // send response
    return res.status(201).json({ success: true, message: "subcategory created successfully!" });
});

// update subcategory
export const updateSubcategory = asyncHandler(async (req, res, next) => {
    // check category in db
    const category = await Category.findById(req.params.categoryId);
    if (!category)
        return next(new Error("category not found!", { cause: 404 }));
    // check subcategory in db
    const subcategory = await Subcategory.findOne({ _id: req.params.id, categoryId: req.params.categoryId });
    if (!subcategory)
        return next(new Error("subcategory not found!", { cause: 404 }));
    // check subcategory owner
    if (req.user._id.toString() !== subcategory.createdBy.toString())
        return next(new Error("not allowed to update this subcategory!", { cause: 401 }));
    // check file and update image in cloudinary
    if (req.file) {
        const { public_id, secure_url } = await cloudinary.uploader.upload(req.file.path, { public_id: subcategory.image.id });
        subcategory.image = { id: public_id, url: secure_url };
    };
    // update subcategory + save in db
    subcategory.name = req.body.name ? req.body.name : subcategory.name;
    subcategory.slug = req.body.name ? slugify(req.body.name) : subcategory.slug;
    await subcategory.save();
    // send response 
    return res.json({ success: true, message: "subcategory updated successfully!" });
});

// delete subcategory
export const deleteSubcategory = asyncHandler(async (req, res, next) => {
    // check category in db
    const category = await Category.findById(req.params.categoryId);
    if (!category)
        return next(new Error("category not found!", { cause: 404 }));
    // check subcategory in db
    const subcategory = await Subcategory.findOne({ _id: req.params.id, categoryId: req.params.categoryId });
    if (!subcategory)
        return next(new Error("subcategory not found!", { cause: 404 }));
    // check subcategory owner
    if (req.user._id.toString() !== subcategory.createdBy.toString())
        return next(new Error("not allowed to update this subcategory!", { cause: 401 }));
    // delete subcategory from db
    await subcategory.deleteOne();
    // delete image from cloudinary
    await cloudinary.uploader.destroy(subcategory.image.id);
    // send response 
    return res.json({ success: true, message: "subcategory deleted successfully!" });
});

// all subcategory
export const allSubcategory = asyncHandler(async (req, res, next) => {
    // all subcategories of certain category if category id exist
    if (req.params.categoryId) {
        // check category in db
        const category = await Category.findById(req.params.categoryId);
        if (!category)
            return next(new Error("category not found!", { cause: 404 }));
        // all subcategories of certain category 
        const results = await Subcategory.find({ categoryId: req.params.categoryId });
        if (results.length == 0)
            return next(new Error("subcategories not found!", { cause: 404 }));
        // send response 
        return res.json({ success: true, results });
    }
    // all subcategories 
    // multiple populate
    const results = await Subcategory.find().populate([
        // nested populate
        { path: "categoryId", populate: { path: "createdBy", select: "email userName" } },
        { path: "createdBy", select: "userName -_id" }
    ]);
    if (results.length == 0)
        return next(new Error("subcategories not found!", { cause: 404 }));
    // send response 
    return res.json({ success: true, results });
});
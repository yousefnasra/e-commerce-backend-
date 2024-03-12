import slugify from "slugify";
import { Brand } from "../../../DB/models/brand.model.js";
import { Category } from "../../../DB/models/category.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";

// create brand 
export const createBrand = asyncHandler(async (req, res, next) => {
    // data from req
    const { categories, name } = req.body;
    // check categories
    categories.forEach(async (categoryId) => {
        const category = await Category.findById(categoryId);
        if (!category)
            return next(new Error(`category ${categoryId} not found!`, { cause: 404 }));
    });
    // check file
    if (!req.file)
        return next(new Error('brand image is required!', { cause: 400 }));
    // upload file in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: `${process.env.CLOUD_FOLDER_NAME}/brands`
    });
    const brand = await Brand.create({
        name,
        slug: slugify(name),
        createdBy: req.user._id,
        image: { url: secure_url, id: public_id },
    });
    // save brand in each category
    categories.forEach(async (categoryId) => {
        await Category.findByIdAndUpdate(categoryId, { $push: { brands: brand._id } });
    });
    // send response
    return res.status(201).json({ success: true, message: "brand created successfully!" });
});

// update brand 
export const updateBrand = asyncHandler(async (req, res, next) => {
    // check brand
    const brand = await Brand.findById(req.params.id);
    if (!brand)
        return next(new Error("brand not found!", { cause: 404 }));
    // check if image updated
    if (req.file) {
        // update image in cloudinary and db
        const { secure_url, public_id } = await cloudinary.uploader.upload(brand.image.id);
        brand.image = { url: secure_url, id: public_id };
    }
    // check if name updated and update in db
    brand.name = req.body.name ? req.body.name : brand.name;
    brand.slug = req.body.name ? slugify(req.body.name) : brand.slug;
    // save in db
    await brand.save();
    // send response
    return res.json({ success: true, message: "brand updated successfully!" });
});

// delte brand 
export const deleteBrand = asyncHandler(async (req, res, next) => {
    // check brand and delete
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand)
        return next(new Error("brand not found!", { cause: 404 }));
    // delete image from cloudinary
    await cloudinary.uploader.destroy(brand.image.id);
    // delete brand from categories
    await Category.updateMany({}, { $pull: { brands: brand._id } })
    // send response
    return res.json({ success: true, message: "brand deleted successfully!" });
});

// get all Brands
export const getBrands = asyncHandler(async (req, res, next) => {
    const results = await Brand.find();
    if (results.length == 0)
        return next(new Error("brands not found!", { cause: 404 }));
    // send response 
    return res.json({ success: true, results });
});

// TODO subcategories + name existence 
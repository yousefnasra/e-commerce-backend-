import { asyncHandler } from "../../utils/asyncHandler.js";
import { Subcategory } from "../../../DB/models/subcategory.model.js";
import { Category } from "../../../DB/models/category.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { Brand } from "../../../DB/models/brand.model.js";
import cloudinary from "../../utils/cloud.js";
import { nanoid } from "nanoid";

// create product
export const createProduct = asyncHandler(async (req, res, next) => {
    // check category
    const category = await Category.findById(req.body.category);
    if (!category) return next(new Error("category not found!", { casue: 404 }));
    // check subcategory
    const subcategory = await Subcategory.findById(req.body.subcategory);
    if (!subcategory) return next(new Error("subcategory not found!", { casue: 404 }));
    // check brand
    const brand = await Brand.findById(req.body.brand);
    if (!brand) return next(new Error("brand not found!", { casue: 404 }));
    // check files
    if (!req.files) return next(new Error("product images are required!", { casue: 400 }));
    // create folder name
    const cloudFolder = nanoid();
    let images = [];
    // upload sub images
    for (const file of req.files.subImages) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
            file.path,
            { folder: `${process.env.CLOUD_FOLDER_NAME}/products/${cloudFolder}/subImages` },
        );
        images.push({ id: public_id, url: secure_url })
    };
    // upload default image
    const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.defaultImage[0].path,
        { folder: `${process.env.CLOUD_FOLDER_NAME}/products/${cloudFolder}/defaultImage` },
    );
    // create product
    await Product.create({
        ...req.body,
        cloudFolder,
        createdBy: req.user._id,
        defaultImage: { url: secure_url, id: public_id },
        images,
    })
    // send response
    return res.status(201).json({ success: true, message: "product created successfully!" });
});

// delete product
export const deleteProduct = asyncHandler(async (req, res, next) => {
    // check product
    const product = await Product.findById(req.params.id);
    if (!product) return next(new Error("product not found!", { cause: 404 }));
    // check product seller owner
    if (req.user.id !== product.createdBy.toString()) return next(new Error("not authorized!", { cause: 401 }));
    // delete product from db
    await product.deleteOne();
    // delete product images (images + default image) from cloudinary
    const ids = product.images.map((image) => image.id);
    ids.push(product.defaultImage.id);
    await cloudinary.api.delete_resources(ids);
    // delete product folder from cloudinary
    await cloudinary.api.delete_folder(`${process.env.CLOUD_FOLDER_NAME}/products/${product.cloudFolder}`);
    // return response
    return res.json({ success: true, message: "product deleted successfully!" });
});

// all products + search + sort + pagination + filter
export const allProducts = asyncHandler(async (req, res, next) => {
    // data from request
    const { sort, keyword, category, subcategory, brand } = req.query
    let { page } = req.query
    // check category existence 
    if (category && !await Category.findById(category))
        return next(new Error("category not found!", { casue: 404 }));
    // check subcategory existence 
    if (subcategory && !await Subcategory.findById(subcategory))
        return next(new Error("subcategory not found!", { casue: 404 }));
    // check brand existence 
    if (brand && !await Brand.findById(brand))
        return next(new Error("brand not found!", { casue: 404 }));
    // find products with filters
    const results = await Product.find({ ...req.query })
        .sort(sort)
        .paginate(page) // only two products per page
        .search(keyword); 
    // check if there is no products
    if (results.length == 0)
        return next(new Error("no products found!", { cause: 404 }));
    // send response
    return res.json({ success: true, message: "products found successfully!", results });
});


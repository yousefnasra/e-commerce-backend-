import { Order } from "../../../DB/models/order.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { Review } from "../../../DB/models/review.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

export const addReview = asyncHandler(async (req, res, next) => {
    // data from request 
    const { productId } = req.params;
    const { comment, rating } = req.body;
    // check product in order
    const order = await Order.findOne({
        user: req.user._id,
        status: "delivered",
        "products.productId": productId,
    });
    if (!order) return next(new Error("can not review this product", { cause: 400 }));
    // check past review
    if (await Review.findOne({ createdBy: req.user._id, productId }))
        return next(new Error("already reviewed by you!", { cause: 400 }));
    // craete review
    const review = await Review.create({ comment, rating, createdBy: req.user._id, productId, orderId: order._id })
    //  calculate average rate
    let calcRate = 0;
    const product = await Product.findById(productId);
    const reviews = await Review.find({ productId });

    for (let i = 0; i < reviews.length; i++) {
        calcRate += reviews[i].rating;
    }
    product.averageRate = calcRate / reviews.length;
    await product.save();
    // send response
    return res.status(201).json({ success: true, results: { review } });
});

export const updateReview = asyncHandler(async (req, res, next) => {
    // data from request 
    const { id, productId } = req.params;
    // update
    await Review.updateOne({ _id: id, productId }, { ...req.body });
    if (req.body.rating) {
        //  calculate average rate and update in product model
        let calcRate = 0;
        const product = await Product.findById(productId);
        const reviews = await Review.find({ productId });

        for (let i = 0; i < reviews.length; i++) {
            calcRate += reviews[i].rating;
        }
        product.averageRate = calcRate / reviews.length;
        await product.save();
    }
    // send response
    return res.json({ success: true, message: "review updated successfully!" });
});
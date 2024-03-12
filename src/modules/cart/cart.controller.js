import { Cart } from "../../../DB/models/cart.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

// add to cart
export const addToCart = asyncHandler(async (req, res, next) => {
    // data from request
    const { productId, quantity } = req.body;
    // check product
    const product = await Product.findById(productId);
    if (!product) return next(new Error("product not found!", { cause: 404 }));
    // check quantity in stock from custom method inStock in product model
    if (!product.inStock(quantity)) return next(new Error(`sorry, only ${product.availableItems} items are available!`, { cause: 400 }));
    // check product existence in the cart
    const isProductInCart = await Cart.findOne({
        user: req.user._id,
        "products.productId": productId
    });
    if (isProductInCart) {
        const theProduct = isProductInCart.products.find(
            (prd) => prd.productId.toString() === productId.toString()
        );
        // CHECK STOCK
        if (product.inStock(theProduct.quantity + quantity)) {
            theProduct.quantity += quantity;
            await isProductInCart.save();
            return res.json({ success: true, results: { cart: isProductInCart } })
        } else {
            return next(new Error(`sorry, only ${product.availableItems} items are available!`, { cause: 400 }));
        }
    };
    // add product in products array in cart
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $push: { products: { productId, quantity } } },
        { new: true }
    );
    // send response
    return res.json({ success: true, results: { cart } });
});

// get user cart
export const getUserCart = asyncHandler(async (req, res, next) => {
    if (req.user.role === "user") {
        const cart = await Cart.findOne({ user: req.user._id });
        return res.json({ success: true, results: { cart } });
    }

    if (req.user.role === "admin" && !req.body.cartId) return next(new Error("cart id is required!", { cause: 400 }));

    const cart = await Cart.findById(req.body.cartId);
    return res.json({ success: true, results: { cart } });
});

// update user cart
export const updateUserCart = asyncHandler(async (req, res, next) => {
    // data from request
    const { productId, quantity } = req.body;
    // check product
    const product = await Product.findById(productId);
    if (!product) return next(new Error("product not found!", { cause: 404 }));
    // check quantity in stock from custom method inStock in product model
    if (!product.inStock(quantity)) return next(new Error(`sorry, only ${product.availableItems} items are available!`, { cause: 400 }));
    // update cart 
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id, "products.productId": productId },
        { "products.$.quantity": quantity },
        { new: true }
    );
    // send response
    return res.json({ success: true, results: { cart } });
});

// remove from cart
export const removeFromCart = asyncHandler(async (req, res, next) => {
    // data from request
    const { productId } = req.params;
    // check product
    const product = await Product.findById(productId);
    if (!product) return next(new Error("product not found!", { cause: 404 }));
    // remove product from cart 
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $pull: { products: { productId } } },
        { new: true }
    );
    // send response
    return res.json({ success: true, results: { cart } });
});

// clear cart
export const clearCart = asyncHandler(async (req, res, next) => {
    // clear cart
    const cart = await Cart.findOneAndUpdate(
        { user: req.user._id },
        { products: [] },
        { new: true }
    );
    // send response
    return res.json({ success: true, results: { cart } });
});


import path from "path";
import { fileURLToPath } from "url";
import { Cart } from "../../../DB/models/cart.model.js";
import { Coupon } from "../../../DB/models/coupon.model.js";
import { Order } from "../../../DB/models/order.model.js";
import { Product } from "../../../DB/models/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import cloudinary from "../../utils/cloud.js";
import createInvoice from "../../utils/pdfInvoice.js";
import { sendEmail } from "../../utils/sendEmails.js";
import { clearCart, updateStock } from "./order.service.js";
import Stripe from "stripe";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const createOrder = asyncHandler(async (req, res, next) => {
    // data from request
    const { phone, address, coupon, payment } = req.body;
    // check coupon
    let checkCoupon;
    if (coupon) {
        checkCoupon = await Coupon.findOne({
            name: coupon,
            expiredAt: { $gt: Date.now() }
        });
    };
    if (!checkCoupon) return next(new Error("invalid coupon!", { cause: 400 }));
    // get products from cart
    const cart = await Cart.findOne({ user: req.user._id });
    const products = cart.products;
    if (products.length < 1) return next(new Error("empty cart!", { cause: 400 }));
    // check products
    let orderProducts = [];
    let orderPrice = 0;
    for (let i = 0; i < products.length; i++) {
        const product = await Product.findById(products[i].productId);
        // check product existence
        if (!product)
            return next(new Error(`${products[i].productId} product not found!`, { cause: 404 }));
        // check product in stock
        if (!product.inStock(products[i].quantity))
            return next(new Error(`product out of stock, only ${product.availableItems} are available!`, { cause: 400 }));
        orderProducts.push({
            name: product.name,
            quantity: products[i].quantity,
            itemPrice: product.finalPrice,
            totalPrice: product.finalPrice * products[i].quantity,
            productId: product._id,
        });
        orderPrice += product.finalPrice * products[i].quantity;
    };
    // create order in db
    const order = await Order.create({
        user: req.user._id,
        address,
        payment,
        phone,
        products: orderProducts,
        price: orderPrice,
        coupon: {
            id: checkCoupon?._id,
            name: checkCoupon?.name,
            discount: checkCoupon?.discount,
        },
    });
    // create invoice
    const invoice = {
        shipping: {
            name: req.user.userName,
            address: order.address,
            country: "Egypt",
        },
        items: orderProducts,
        subtotal: orderPrice, // before discount
        paid: order.finalPrice, // after discount
        invoice_nr: order._id,
    };
    const pdfPath = path.join(__dirname, `./../../tempInvoices/${order._id}.pdf`);
    createInvoice(invoice, pdfPath);
    // upload invoice to cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(pdfPath,
        { folder: `${process.env.CLOUD_FOLDER_NAME}/order/invoices` }
    );
    // add invoice in db "file" id,url
    order.invoice = { id: public_id, url: secure_url };
    await order.save();
    // send email to user "invoice"
    const isSent = sendEmail({
        to: req.user.email,
        subject: "Order Invoice",
        attachments: [{ path: secure_url, contentType: "application/pdf" }],
    });
    if (!isSent) return next(new Error("something went wrong!"));
    // update stock
    updateStock(order.products, true);
    // clear cart
    clearCart(req.user._id);
    // check if payment = visa
    if (payment === 'visa') {
        // stripe gateway
        const stripe = new Stripe(process.env.STRIPE_KEY);
        // coupon stripe
        let couponExisted;
        if (order.coupon.name !== undefined) {
            couponExisted = await stripe.coupons.create({
                percent_off: order.coupon.discount,
                duration: 'once',
            });
        };
        // create stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            success_url: process.env.SUCCESS_URL,
            cancel_url: process.env.CANCEL_URL,
            line_items: order.products.map((product) => {
                return {
                    price_data: {
                        currency: "egp",
                        product_data: {
                            name: product.name,
                            // images: [product.productId.defaultImage.url],
                        },
                        unit_amount: product.itemPrice * 100,
                    },
                    quantity: product.quantity,
                };
            }),
            discounts: couponExisted ? [{ coupon: couponExisted.id }] : [],
        });
        // send response
        return res.json({ success: true, results: { url: session.url } });
    };
    // send response
    return res.status(201).json({ success: true, results: { order } });
});

export const cancelOrder = asyncHandler(async (req, res, next) => {
    // check order
    const order = await Order.findById(req.params.id);
    if (!order) return next(new Error("invalid order id!", { cause: 400 }));
    // check status
    if (!order.status === "placed")
        return next(new Error("can not cancel the order!", { cause: 400 }));
    // cancel order
    order.status = "canceled";
    await order.save();
    // update stock
    updateStock(order.products, false);
    // send response
    return res.json({ success: true, message: "order canceled successfully!" })
});
const razorpayInstance = require("../config/razorpayInstance");
const crypto = require('crypto')
const Cart = require("../model/CartModel");
const Order = require("../model/OrderModel");
const Product = require("../model/productModel");
const User = require("../model/userSchema");
const Variant = require("../model/variantModel");
const Wallet = require("../model/walletModel");
require('dotenv').config()

const orderProducts = async (req, res) => {
  try {
    const {
      userId,
      paymentMethod,
      totalAmount,
      shippingAddress,
      couponDetails,
      discount,
      originalAmount,
      items,
    } = req.body;

    const orderProduct = await Order.create({
      userId,
      shippingAddress,
      paymentMethod,
      totalAmount,
      couponDetails,
      discount,
      originalAmount,
      items,
    });
    if (!orderProduct) {
      return res.status(403).json("product cannot be ordered");
    }
    const manageQuantity = items.map(async (item) => {
      const updateQuantity = await Variant.findByIdAndUpdate(
        item?.variantId,
        { $inc: { quantity: -item?.quantity } },
        { new: true }
      );
      console.log(updateQuantity, "wwwwwww");
    });
    const cartRemove = await Cart.findOneAndUpdate(
      { userId },
      { items: [] },
      { new: true }
    );

    res.status(200).json("order placed successfully");
  } catch (error) {
    console.log("order products", error.message);
    res.status(500).json("some thing went wrong");
  }
};

const fetchOrderDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const orderDetails = await Order.find({ userId }).sort({ createdAt: -1 });

    if (!orderDetails) {
      return res.status(403).json("no orders found");
    }

    const orders = orderDetails
      .map((item) => {
        return item?.items.map((product) => {
          return {
            product,
            shippingAddress: item?.shippingAddress,
            paymentMethod: item?.paymentMethod,
            _id: item?._id,
            totalAmount:item?.totalAmount,
            couponDetails:item?.couponDetails,
            discount:item?.discount,
            originalAmount:item?.originalAmount
          };

        });
      })
      .flat();

    const productDetails = await Promise.all(
      orders.map(async (item) => {
        const product = await Product.findById(
          item?.product?.productId
        ).populate("brandId", "brand");
        const variant = await Variant.findById(item?.product?.variantId);
        return {
          productId: product,
          variantId: variant,
          quantity: item?.product?.quantity,
          status: item?.product?.status,
          shippingAddress: item?.shippingAddress,
          paymentMethod: item?.paymentMethod,
          orderId: item?._id,
          productOrderId: item?.product?._id,
          totalAmount:item?.totalAmount,
            couponDetails:item?.couponDetails,
            discount:item?.discount,
            originalAmount:item?.originalAmount

        };
      })
    );
    console.log("23333", productDetails[0]);
    res.status(200).json(productDetails);
  } catch (error) {
    console.log("fetch order product", error.message);
    res.status(500).json("something went wrong");
  }
};

const cancelProduct = async (req, res) => {
  try {
    const {orderId,productOrderId,paymentMethod,productId,variantId,quantity,userId,totalAmount} = req.body;
    const updateQuantity = await Variant.findByIdAndUpdate(variantId,{$inc:{"quantity":quantity}},{new:true})
    const cancelOrder = await Order.findOne({ _id: orderId });
    if (!cancelOrder) {
      return res.status(404).json("order not found");
    }
    cancelOrder.items = cancelOrder.items.map((item) =>
      item._id.toString() === productOrderId
        ? { ...item, status: "Cancelled" }
        : item
    );
    console.log(cancelOrder);
    await cancelOrder.save();


    if (paymentMethod === "online") {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        await Wallet.create({
          userId,
          transactionDetails: [
            {
              type: "credit",
              amount: totalAmount,
              description: `refund for cancelling product, product orderId ${productOrderId}`,
            },
          ],
        });
      } 
      else {
        let details = {
          type: "credit",
          amount: totalAmount,
          description: `refund for cancelling product, product orderId ${productOrderId}`,
        };

        wallet.transactionDetails.push(details);
        await wallet.save();
        return res.status(200).json({ message: "product cancelled" });
      }
    }
    //  else {
    //   const updateQuantity = await Variant.findByIdAndUpdate(
    //     variantId,
    //     { $inc: { quantity: quantity } },
    //     { new: true }
    //   );

    //   // change order status
    //   const order = await Order.findById(orderId);

    //   order.items = order.items.map((item) =>
    //     item._id.toString() === productOrderId
    //       ? { ...item.toObject(), status: "Returned" }
    //       : item
    //   );
    //   await order.save();
    //   return res.status(200).json({ message: "product returned successfull" });
    // }
    res
      .status(200)
      .json({
        message: "product cancelled successfully",
        updatedOrder: cancelOrder,
      });
  } catch (error) {
    console.log("cancel product", error.message);
    res.status(500).json("something went wrong");
  }
};

const getOrders = async (req, res) => {
  try {
    const orderDetails = await Order.find().sort({ createdAt: -1 });

    if (!orderDetails) {
      return res.status(403).json("no orders found");
    }

    const orders = await Promise.all(
      orderDetails.map(async (item) => {
        const userDetails = await User.findById(
          item?.userId,
          "firstName lastName email phone"
        );

        return item?.items.map((product) => {
          return {
            product,
            userDetails,
            shippingAddress: item?.shippingAddress,
            paymentMethod: item?.paymentMethod,
            _id: item?._id,
          };
        });
      })
    );
    const allOrders = orders.flat();
    console.log(allOrders);

    const productDetails = await Promise.all(
      allOrders.map(async (item) => {
        const product = await Product.findById(
          item?.product?.productId
        ).populate("brandId", "brand");
        const variant = await Variant.findById(item?.product?.variantId);
        return {
          productId: product,
          variantId: variant,
          quantity: item?.product?.quantity,
          status: item?.product?.status,
          userDetails: item?.userDetails,
          shippingAddress: item?.shippingAddress,
          paymentMethod: item?.paymentMethod,
          orderId: item?._id,
          productOrderId: item?.product?._id,
        };
      })
    );

    res.status(200).json(productDetails);
  } catch (error) {
    console.log("get orders", error.message);
    res.status(500).json("something went wrong");
  }
};

const changeStatus = async (req, res) => {
  try {
    const { status, orderId, productOrderId } = req.params;
    console.log(status, orderId, productOrderId);
    const order = await Order.findById(orderId);
    order.items = order.items.map((item) =>
      item._id.toString() === productOrderId ? { ...item, status } : item
    );
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.log("changeStatus", error.message);
    res.status(500).json("something went wrong");
  }
};

const razorpayCreateOrder = async (req, res) => {
  const { amount, currency, receipt } = req.body;

  try {
    const order = await razorpayInstance.orders.create({
      amount: amount * 100, // Amount in paisa
      currency,
      receipt,
    });
    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const verifyRazorpayPayment = async(req,res)=>{
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    res.status(200).json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ success: false, message: "Invalid payment signature" });
  }
}

module.exports = {
  orderProducts,
  fetchOrderDetails,
  cancelProduct,
  getOrders,
  changeStatus,
  razorpayCreateOrder,
  verifyRazorpayPayment,
};

const razorpayInstance = require("../config/razorpayInstance");
const crypto = require("crypto");
const Cart = require("../model/CartModel");
const Order = require("../model/OrderModel");
const Product = require("../model/productModel");
const User = require("../model/userSchema");
const Variant = require("../model/variantModel");
const Wallet = require("../model/walletModel");
const SubCategory = require("../model/subCategories");
require("dotenv").config();

const orderProducts = async (req, res) => {
  try {
    const {
      userId,
      paymentMethod,
      paymentStatus,
      totalAmount,
      shippingAddress,
      couponDetails,
      discount,
      originalAmount,
      items,
    } = req.body;

    const verifyQuantity = await Promise.all(
      items.map(async (item) => {
        return {
          quantity: item.quantity,
          actualQuantity: await Variant.findById(item.variantId, "quantity"),
        };
      })
    );
    console.log("quantity managment", verifyQuantity);
    for (const item of verifyQuantity) {
      if (item.quantity > item.actualQuantity.quantity) {
        return res.status(409).json({ message: "quantity missmatch" });
      }
    }

    let orderProduct = await Order.create({
      userId,
      shippingAddress,
      paymentMethod,
      paymentStatus,
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
    const orderedProducts = {
      shippingAddress: orderProduct.shippingAddress,
      paymentMethod: orderProduct.paymentMethod,
      totalAmount: orderProduct.totalAmount,
      couponDetails: orderProduct.couponDetails,
      discount: orderProduct.discount,
      originalAmount: orderProduct.originalAmount,
      _id: orderProduct._id,
      createdAt: orderProduct.createdAt,
      items: await Promise.all(
        orderProduct?.items.map(async (item) => {
          // const products = await Product.findById(
          //   item.productId,
          //   "productName aciteOffer aciteOfferType"
          // ).populate("subCategoryId", "subCategory").populate("brandId","brand");
          // item.productId = products

          // return { ...item,productId : products };

          return {
            ...item.toObject(),
            productId: await Product.findById(
              item.productId,
              "productName aciteOffer aciteOfferType images"
            )
              .populate("subCategoryId", "subCategory")
              .populate("brandId", "brand"),
          };
        })
      ),
    };
    console.log("mmmmmmmmmmmmmmmmmmnnnnnnnnnn", orderProduct);
    console.log("lllllllllllllllllllllllllllll", orderedProducts);

    res
      .status(200)
      .json({ orderedProducts, message: "order placed successfully" });
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
            paymentStatus: item?.paymentStatus,
            _id: item?._id,
            totalAmount: item?.totalAmount,
            couponDetails: item?.couponDetails,
            discount: item?.discount,
            originalAmount: item?.originalAmount,
            orderDate: item?.createdAt,
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
          message: item?.product?.message,
          shippingAddress: item?.shippingAddress,
          paymentMethod: item?.paymentMethod,
          paymentStatus: item?.paymentStatus,
          orderId: item?._id,
          productOrderId: item?.product?._id,
          totalAmount: item?.totalAmount,
          couponDetails: item?.couponDetails,
          discount: item?.discount,
          originalAmount: item?.originalAmount,
          orderDate: item?.orderDate,
        };
      })
    );
    // console.log("23333", productDetails[0]);
    res.status(200).json(productDetails);
  } catch (error) {
    console.log("fetch order product", error.message);
    res.status(500).json("something went wrong");
  }
};

const cancelProduct = async (req, res) => {
  try {
    const {
      orderId,
      productOrderId,
      paymentMethod,
      productId,
      variantId,
      quantity,
      userId,
      totalAmount,
      message,
    } = req.body;
    console.log("qwertyuiop", req.body);
    const updateQuantity = await Variant.findByIdAndUpdate(
      variantId,
      { $inc: { quantity: quantity } },
      { new: true }
    );
    let cancelOrder = await Order.findOne({ _id: orderId });

    if (!cancelOrder) {
      return res.status(404).json("order not found");
    }

    if (
      cancelOrder.totalAmount - totalAmount + cancelOrder.discount <
      cancelOrder.couponDetails.minPurchaseAmmount
    ) {
      if (paymentMethod === "online") {
        const wallet = await Wallet.findOne({ userId });
        if (!wallet) {
          await Wallet.create({
            userId,
            transactionDetails: [
              {
                type: "credit",
                amount: totalAmount - cancelOrder.discount,
                description: `refund for cancelling product, product orderId ${productOrderId}`,
              },
            ],
          });
        } else {
          let details = {
            type: "credit",
            amount: totalAmount - cancelOrder.discount,
            description: `refund for cancelling product, product orderId ${productOrderId}`,
          };

          wallet.transactionDetails.push(details);
          await wallet.save();
        }
      }

      cancelOrder = {
        ...cancelOrder.toObject(),
        totalAmount:
          cancelOrder.totalAmount - totalAmount + cancelOrder.discount,
        couponDetails: {
          couponCode: "",
          couponOffer: 0,
          couponType: "",
          maxDiscountAmmount: 0,
          minPurchaseAmmount: 0,
        },
        discount: 0,
      };
    } else {
      cancelOrder = {
        ...cancelOrder.toObject(),

        totalAmount: cancelOrder.totalAmount - totalAmount,
      };

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
        } else {
          let details = {
            type: "credit",
            amount: totalAmount,
            description: `refund for cancelling product, product orderId ${productOrderId}`,
          };

          wallet.transactionDetails.push(details);
          await wallet.save();
        }
      }
    }
    cancelOrder.items = cancelOrder.items.map((item) =>
      item._id.toString() === productOrderId
        ? { ...item, status: "Cancelled", message }
        : item
    );
    console.log("kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk", cancelOrder);

    await Order.findByIdAndUpdate(orderId, { $set: cancelOrder });

    res.status(200).json({
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
    console.log(orderDetails[0]);
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
            paymentStatus: item?.paymentStatus,
            _id: item?._id,
            discount: item?.discount,
            totalAmount: item?.totalAmount,
            couponDetails: item?.couponDetails,
          };
        });
      })
    );
    const allOrders = orders.flat();
    // console.log(allOrders[0]);

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
          message: item?.product?.message,
          userDetails: item?.userDetails,
          shippingAddress: item?.shippingAddress,
          paymentMethod: item?.paymentMethod,
          paymentStatus: item?.paymentStatus,
          orderId: item?._id,
          productOrderId: item?.product?._id,
          discount: item?.discount,
          totalAmount: item?.totalAmount,
          couponDetails: item?.couponDetails,
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
    const { status, orderId, productOrderId, variantId, quantity } = req.params;
    const { message } = req.body;
    console.log(status, orderId, productOrderId, variantId, quantity, message);
    const order = await Order.findById(orderId);
    console.log("order for change status", order);
    order.items = order.items.map((item) =>
      item._id.toString() === productOrderId
        ? { ...item, status, message }
        : item
    );

    await order.save();
    if (order.paymentMethod === "COD" && status === "Delivered") {
      const updatePaymentStatus = await Order.findByIdAndUpdate(
        orderId,
        { $set: { paymentStatus: "paid" } },
        { new: true }
      );
      console.log("order payment status updated", updatePaymentStatus);
    }

    if (status === "Cancelled") {
      const updateQuantity = await Variant.findByIdAndUpdate(
        variantId,
        { $inc: { quantity } },
        { new: true }
      );
    }

    res.status(200).json(order);
  } catch (error) {
    console.log("changeStatus", error);
    res.status(500).json("something went wrong");
  }
};

const razorpayCreateOrder = async (req, res) => {
  console.log("jjfggywh", req.body);
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

const verifyRazorpayPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature === razorpay_signature) {
    res
      .status(200)
      .json({ success: true, message: "Payment verified successfully" });
  } else {
    res
      .status(400)
      .json({ success: false, message: "Invalid payment signature" });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    // Fetch all orders
    let orders = await Order.find();

    // Process each order asynchronously
    orders = await Promise.all(
      orders.map(async (order) => {
        // Fetch user details
        const user = await User.findById(order.userId, "firstName");
        // Fetch product and variant details for each item
        const items = await Promise.all(
          order.items.map(async (item) => {
            const product = await Product.findById(item.productId); // Fetch full product details
            const variant = await Variant.findById(item.variantId); // Fetch full variant details

            return {
              ...item.toObject(), // Retain original item properties
              productDetails: product || {}, // Add full product details
              variantDetails: variant || {}, // Add full variant details
            };
          })
        );

        // Return the enriched order object
        return {
          ...order.toObject(), // Retain original order properties
          userName: user?.firstName || "Unknown User", // Add user name
          items, // Replace items with enriched items
        };
      })
    );
    // Respond with the enriched orders
    res.status(200).json(orders);
  } catch (error) {
    console.error("get order details", error.message);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const fetchToplist = async (req, res) => {
  try {
    const topTenProducts = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    const topTenDetails = await Promise.all(
      topTenProducts.map(async (item) => {
        return {
          productDetails: await Product.findById(item._id, "productName ")
            .populate("subCategoryId", "subCategory")
            .populate("brandId", "brand"),
          count: item.count,
        };
      })
    );
    console.log(
      "jjjjjjjjjjjjjjhhhhhhhhhhhhhgggggggggggfffffffff",
      topTenProducts
    );
    console.log("jjjjjjjjjjjjjjjhhhhhhhhhhhhhhhhgggggggggggggg", topTenDetails);
    res.status(200).json({ topTenDetails });
  } catch (error) {
    console.log("fetch top list ", error.message);
    res.status(500).json("something went wrong");
  }
};

const changePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const changeStatus = await Order.findByIdAndUpdate(
      orderId,
      { $set: { paymentStatus: "paid" } },
      { new: true }
    );
    console.log("online payment changed status", changeStatus);
    res.status(200).json({ message: "payment status changed" });
  } catch (error) {
    console.log("change payment status", error.message);
    res.status(500).json({ message: "something went wrong" });
  }
};

const moreOrderDetails =  async (req, res) => {
  try {
    const {orderId} = req.params;
    const order = await Order.findById(orderId);
   let details = await Promise.all(order.items.map(async(item)=>{
    const product = await Product.findById(item.productId,"productName").populate("brandId","brand");
    const variant = await Variant.findById(item.variantId,"attributes salePrice");
    console.log("moreproduct details dertails",product,variant)
    return{...item.toObject(),
     productId: product,
     variantId: variant
      
    }
   }
   
  ))
    console.log("more order details",details)
    return res.status(200).json({details,message:"more order details"})
  } catch (error) {
    console.log("moreOrder details",error.message);
    res.status(500).json({message:"something went wrong"});
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
  getOrderDetails,
  fetchToplist,
  changePaymentStatus,
  moreOrderDetails
};

const Cart = require("../model/CartModel");
const Order = require("../model/OrderModel");

const orderProducts = async (req, res) => {
  try {
    const { userId, paymentMethod, totalAmount, shippingAddress, items } =
      req.body;

    const orderProduct = await Order.create({
      userId,
      shippingAddress,
      paymentMethod,
      totalAmount,
      items,
    });
    if (!orderProduct) {
      return res.status(403).json("product cannot be ordered");
    }
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

module.exports = { orderProducts };

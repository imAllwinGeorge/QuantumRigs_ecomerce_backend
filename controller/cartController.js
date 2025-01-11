const Cart = require("../model/CartModel");
const Product = require("../model/productModel");
const Variant = require("../model/variantModel");

const addToCart = async (req, res) => {
  try {
    const { productId, variantId, userId } = req.body;
    const productDetails = [{ productId, variantId }];
    const cart = await Cart.findOne({ userId });
    // console.log(cart)
    if (!cart) {
      const newCart = await Cart.create({
        userId,
        items: productDetails,
      });

      return res.status(200).json("product added to cart");
    } else {
      const existingItem = await cart.items.find(
        (item) => item.productId == productId && item.variantId == variantId
      );
      console.log(existingItem);
      if (existingItem) {
        // existingItem.quantity += 1;
        return res.status(200).json('product added to cart')
      } else {
        cart.items.push({ productId, variantId });
      }
      await cart.save();
    }
  } catch (error) {
    console.log("addToCart", error.message);
    res.status(500).json("something went wrong");
  }
};

const getCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      let productInfo = []
      return res.status(200).json(productInfo);
    }
  

    // Fetch product and variant details for all items
    const productInfo = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.findOne({
          _id: item.productId,
          isListed: true,
        }).populate("brandId", "brand");
        const variant = await Variant.findOne({ _id: item.variantId });
        return !product || !variant
          ? null
          : {
              product,
              variant,
              quantity: item.quantity,
            };
      })
    );
    // console.log(productInfo)
    const validProductInfo = productInfo.filter((item) => {
      if (item !== null) {
        return item;
      }
    });
    console.log(validProductInfo);
    res.status(200).json(validProductInfo);
  } catch (error) {
    console.log("getCart", error.message);
    res.status(500).json("some thing went wrong");
  }
};




const quantityManagement = async (req, res) => {
    try {
      const { productId, variantId, userId, value } = req.params;
      const cart = await Cart.findOne({ userId });
  
      if (!cart) {
        return res.status(404).json("Cart not found for the user.");
      }
  
      // Find the item and update its quantity
      let itemFound = false;
      cart.items = cart.items.map((item) => {
        if (
          item.productId.toString() === productId.toString() &&
          item.variantId.toString() === variantId.toString()
        ) {
          // Convert value to number and add to current quantity
          item.quantity = parseInt(item.quantity) + parseInt(value);
          itemFound = true;
        }
        return item;
      });
  
      if (!itemFound) {
        return res.status(404).json("Item not found in cart.");
      }
  
      // Save the updated cart
      await cart.save();
      
      // Send back the updated cart
      return res.status(200).json(cart);
    } catch (error) {
      console.log("quantity management", error.message);
      return res.status(500).json("Something went wrong");
    }
  };
  
  const removeProduct = async(req,res)=>{
    try {
        const {productId,variantId,userId} = req.params;
        const updatedCart = await Cart.findOneAndUpdate({userId},{$pull:{items:{productId,variantId}}},{new:true});
        console.log(updatedCart)
        return res.status(200).json('product removed from cart')
    } catch (error) {
        console.log('remove product',error.message);
        res.status(500).json('something went wrong')
    }
  };

module.exports = {
  addToCart,
  getCart,
  quantityManagement,
  removeProduct,
};

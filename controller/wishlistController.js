const Product = require("../model/productModel");
const Variant = require("../model/variantModel");
const Wishlist = require("../model/wishlistModel");


const getWishlist = async(req,res)=>{
    try {
        const { userId } = req.params;
        const wishlist = await Wishlist.findOne({ userId });
        if (!wishlist || wishlist.items.length === 0) {
          let productInfo = []
          return res.status(200).json(productInfo);
        }
      
    
        // Fetch product and variant details for all items
        const productInfo = await Promise.all(
          wishlist.items.map(async (item) => {
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
        console.log("get  wishlist", error.message);
        res.status(500).json("some thing went wrong");
      }
};

const addToWishlist = async(req,res)=>{
    try {
        const {productId,variantId,userId} = req.params;
        const productDetails = [{ productId, variantId }];
    const wishlist = await Wishlist.findOne({ userId });
    // console.log(cart)
    if (!wishlist) {
      const wishlist = await Wishlist.create({
        userId,
        items: productDetails,
      });

      return res.status(200).json({message:"product added to wishlist"});
    } else {
      const existingItem = await wishlist.items.find(
        (item) => item.productId == productId && item.variantId == variantId
      );
      console.log(existingItem);
      if (existingItem) {
        // existingItem.quantity += 1;
        return res.status(200).json('product added to wishlist')
      } else {
        wishlist.items.push({ productId, variantId });
      }
      await wishlist.save();
      return res.status(200).json({message:"product added to wishlist"});
    }
    } catch (error) {
        console.log('add to wishlist',error.message);
        res.status(500).json({message:'something went wrong'})
    }
}

const removeProduct = async(req,res)=>{
    try {
        const {productId,variantId,userId} = req.params;
        console.log(productId,variantId,userId)
        const updatedWishlist = await Wishlist.findOneAndUpdate({userId},{$pull:{items:{productId,variantId}}},{new:true});
        console.log(updatedWishlist);
        res.status(200).json({message:'product removed from wishlist'})
    } catch (error) {
        console.log('remove product',error.message);
        res.status(500).json({message:'something went wrong'})
    }
}

module.exports = {getWishlist, addToWishlist, removeProduct}
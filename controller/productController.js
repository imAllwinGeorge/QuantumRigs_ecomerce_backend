const SubCategories = require("../model/subCategories");
const Brand = require("../model/brandModel");
const Product = require("../model/productModel");
const Variant = require("../model/variantModel");
const fs = require("fs");
const path = require("path");
const Category = require("../model/categorySchema");
const Order = require("../model/OrderModel");
const Wallet = require("../model/walletModel");

const getProductPage = async (req, res) => {
  try {
    const subCategories = await SubCategories.find({ isListed: true });

    const brands = await Brand.find({ isListed: true });

    if (subCategories && brands) {
      return res.status(200).json({ subCategories, brands });
    }
  } catch (error) {
    console.log("addproducts", error);
  }
};

const getProductDetails = async (req, res) => {
  try {
    const product = await Product.find();

    return res.status(200).json(product);
  } catch (error) {
    console.log("getProductdetailse", error);
  }
};

const moreProdctDetails = async (req, res) => {
  try {
    const productId = req.params.productId;
    console.log(productId);
    const productInfo = await Product.findById(productId)
      .populate("brandId", "brand")
      .populate(
        "subCategoryId",
        "subCategory categoryId subCategoryOffer subCategoryOfferType"
      );
    const variantInfo = await Variant.find({ productId });
    const categoryInfo = await Category.findById(
      productInfo?.subCategoryId?.categoryId
    );

    if (productInfo && variantInfo && categoryInfo) {
      return res.status(200).json({ productInfo, variantInfo, categoryInfo });
    }
    return res.status(404).json("user not found");
  } catch (error) {
    console.log("moreproductdetails", error);
  }
};

const addProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      brandId,
      subCategoryId,
      productOffer,
      productOfferType,
    } = req.body;
    let filename = [];
    if (req.files) {
      filename = req.files.map((images) => images.filename);
    }

    const isExist = await Product.findOne({
      productName: { $regex: new RegExp(`^${productName}$`, "i") },
    });
    if (isExist) {
      return res.status(404).json({ message: "produt already exist" });
    }
    const productDetails = await Product.create({
      productName,
      description,
      brandId,
      subCategoryId,
      productOffer,
      productOfferType,
      images: filename,
    });
    console.log(productDetails);
    if (productDetails) {
      return res.status(201).json({ productDetails });
    }
    return res.status(500).json("something went wrong");
  } catch (error) {
    console.log("addproductspost", error);
  }
};

const addVariant = async (req, res) => {
  try {
    const { attributes, quantity, regularPrice, productId, subCategoryId } =
      req.body;

    console.log(req.salePrice);
    await Variant.create({
      attributes,
      quantity,
      regularPrice,
      salePrice: req.salePrice.price,
      productId,
    });
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        activeOfferType: req.salePrice.offerType,
        activeOffer: req.salePrice.offerValue,
      },
      { new: true }
    );
    req.salePrice = null;
    return res.status(201).json("product details added");
  } catch (error) {
    console.log("addvariant ", error);
  }
};

const fetchBrands = async (req, res) => {
  try {
    const brands = await Brand.find();
    if (brands) {
      return res.status(200).json(brands);
    }
  } catch (error) {
    console.log("fetcbrands", error);
  }
};

const AddBrands = async (req, res) => {
  try {
    const { brand, description } = req.body;
    console.log(brand, description);
    const isExist = await Brand.findOne({
      brand: { $regex: new RegExp(`^${brand}$`, "i") },
    });
    console.log(isExist);
    if (!isExist) {
      await Brand.create({ brand, description });
      return res.status(201).json("brnad addedsuccessfully");
    }
    return res.status(404).json("brand already exist");
  } catch (error) {
    console.log("addbrands", error);
  }
};

const deleteImage = async (req, res) => {
  try {
    console.log(req.body);
    const { image, productId } = req.body;
    console.log(image, productId);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $pull: { images: image } },
      { new: true }
    );
    console.log(updatedProduct);
    const filePath = path.join("uploads/images", image);
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Failed to delete file" });
      }

      return res.status(200).json(updatedProduct);
    });
  } catch (error) {
    console.log("deleteImage", error);
  }
};

const editProduct = async (req, res) => {
  try {
    // Extract fields from request body
    const {
      _id,
      productName,
      description,
      brandId,
      subCategoryId,
      productOffer,
      productOfferType,
      isListed,
    } = req.body;

    // Ensure files are processed
    const newImages = req.files ? req.files.map((file) => file.filename) : [];

    // Fetch the current product from the database
    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).json("Product not found");
    }

    // Combine existing images with new images
    const updatedImages = [...product.images, ...newImages];
    console.log(req.salePrice);
    // Prepare updated data
    const updateData = {
      productName,
      description,
      brandId,
      subCategoryId,
      productOffer,
      productOfferType,
      activeOffer: req.salePrice.offerValue,
      activeOfferType: req.salePrice.offerType,
      isListed: isListed === "true", // Convert to boolean
      images: updatedImages, // Append new images
    };
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true }
    );

    req.salePrice = null;

    console.log(updatedProduct, "qwertyuio");
    if (updatedProduct) {
      console.log("success");
      return res.status(200).json("product updated successfully");
    }
    return res.status(404).json("prduct doesnot found");
  } catch (error) {
    console.log("edit product", error);
  }
};

const updateVariant = async (req, res) => {
  try {
    const { variantToUpdate, productId } = req.body;
    const variantId = req.params.variantId;
    const updatedVariant = await Variant.findByIdAndUpdate(
      variantId,
      { $set: { ...variantToUpdate, salePrice: req.salePrice.price } },
      { new: true }
    );
    const product = await Product.findByIdAndUpdate(
      productId,
      {
        activeOfferType: req.salePrice.offerType,
        activeOffer: req.salePrice.offerValue,
      },
      { new: true }
    );
    console.log(product);
    req.salePrice = null;
    if (updatedVariant) {
      return res.status(200).json("variant updated successfully");
    }
    return res.status(404).json("varaint not found");
  } catch (error) {
    console.log("updatevariant", error);
  }
};

const returnProduct = async (req, res) => {
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
    } = req.body;

    const updateQuantity = await Variant.findByIdAndUpdate(
      variantId,
      { $inc: { quantity: quantity } },
      { new: true }
    );

    // change order status
    const order = await Order.findById(orderId);

    order.items = order.items.map((item) =>
      item._id.toString() === productOrderId
        ? { ...item.toObject(), status: "Returned" }
        : item
    );
    await order.save();

    // save wallet transaction

    // if (paymentMethod === "online") {
      const wallet = await Wallet.findOne({ userId });
      if (!wallet) {
        await Wallet.create({
          userId,
          transactionDetails: [
            {
              type: "credit",
              amount: totalAmount,
              description: `refund for returning product, product orderId ${productOrderId}`,
            },
          ],
        });
      } 
      else {
        let details = {
          type: "credit",
          amount: totalAmount,
          description: `refund for returning product, product orderId ${productOrderId}`,
        };

        wallet.transactionDetails.push(details);
        await wallet.save();
        return res.status(200).json({ message: "product returned" });
      }
    // }
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
  } catch (error) {
    console.log("return product", error.message);
    res.status(500).json({ message: "something went wrong" });
  }
};

module.exports = {
  getProductPage,
  addProduct,
  addVariant,
  AddBrands,
  fetchBrands,
  getProductDetails,
  moreProdctDetails,
  deleteImage,
  editProduct,
  updateVariant,
  returnProduct,
};

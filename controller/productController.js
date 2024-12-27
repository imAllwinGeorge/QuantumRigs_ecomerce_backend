const SubCategories = require("../model/subCategories");
const Brand = require("../model/brandModel");
const Product = require("../model/productModel");
const Variant = require("../model/variantModel");
const fs = require("fs");
const path = require("path");

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
      .populate("subCategoryId", "subCategory");
    const variantInfo = await Variant.find({ productId });
    console.log(variantInfo);
    if (productInfo && variantInfo) {
      return res.status(200).json({ productInfo, variantInfo });
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

    const isExist = await Product.findOne({ productName });
    if (isExist) {
      return res.status(404).json("produt already exist");
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
    const { attributes, quantity, regularPrice, salePrice, productId } =
      req.body;
    await Variant.create({
      attributes,
      quantity,
      regularPrice,
      salePrice,
      productId,
    });

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
    const isExist = await Brand.findOne({ brand });
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
    console.log('Edit products API triggered');
    
    // Extract fields from request body
    const {
      _id,
      productName,
      description,
      brandId,
      subCategoryId,
      productOffer,
      productOfferType,
      isListed
    } = req.body;
    console.log(req.body)
    console.log('editproducctsssssssssssssrsrs',productName,description,brandId,subCategoryId,productOffer,productOfferType,isListed)

    // Ensure files are processed
    const newImages = req.files ? req.files.map(file => file.filename) : [];

    // Fetch the current product from the database
    const product = await Product.findById(_id);

    if (!product) {
      return res.status(404).json("Product not found");
    }

    // Combine existing images with new images
    const updatedImages = [...product.images, ...newImages];

    // Prepare updated data
    const updateData = {
      productName,
      description,
      brandId,
      subCategoryId,
      productOffer,
      productOfferType,
      isListed: isListed === 'true', // Convert to boolean
      images: updatedImages // Append new images
    };
    const updatedProduct = await Product.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true }
    );


    console.log(updatedProduct, "qwertyuio");
    if (updatedProduct) {
      console.log("success");
      return res.status(200).json("product updated successfully");
    }
    return res.status(404).json("prduct doesnot found");
  } catch (error) {
    console.log("edit product",error)
  }
};

const updateVariant = async (req, res) => {
  try {
    const { variantToUpdate } = req.body;
    const variantId = req.params.variantId;
    const updatedVaraint = await Variant.findByIdAndUpdate(
      variantId,
      { $set: { ...variantToUpdate } },
      { new: true }
    );
    if (updatedVaraint) {
      return res.status(200).json("variant updated successfully");
    }
    return res.status(404).json("varaint not found");
  } catch (error) {
    console.log("updatevariant", error);
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
};

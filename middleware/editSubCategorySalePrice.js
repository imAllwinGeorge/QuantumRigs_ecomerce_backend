const Category = require("../model/categorySchema");
const Product = require("../model/productModel");
const Variant = require("../model/variantModel");


const calculateSalePriceAndUpdate = async (
    productInfo,
    categoryOffer,
    categoryOfferType,
    updatedSubCategory
  ) => {
    try {
      await Promise.all(
        productInfo.map(async (product) => {
          const flatOffer = [];
          const percentageOffer = [];
          let flatOfferPrice = {};
          let percentageOfferPrice = {};
  
          // Add product offer to respective arrays
          if (product.productOfferType === "flat")
            flatOffer.push(product.productOffer);
          else if (product.productOfferType === "percentage")
            percentageOffer.push(product.productOffer);
  
          // Add subcategory offer to respective arrays
          if (updatedSubCategory.subCategoryOfferType === "flat")
            flatOffer.push(updatedSubCategory.subCategoryOffer);
          else if (updatedSubCategory.subCategoryOfferType === "percentage")
            percentageOffer.push(updatedSubCategory.subCategoryOffer);
  
          // Add category offer to respective arrays
          if (categoryOfferType === "flat") {
            flatOffer.push(categoryOffer);
          } else if (categoryOfferType === "percentage") {
            percentageOffer.push(categoryOffer);
          }
  
          // Sort the offers
          flatOffer.sort((a, b) => b - a);
          percentageOffer.sort((a, b) => b - a);
          console.log(percentageOffer,flatOffer)
          await Promise.all(
            product.variants.map(async (variant) => {
              // Calculate flat offer price
              if (flatOffer.length > 0) {
                flatOfferPrice = {
                  price: variant.regularPrice - flatOffer[0],
                  offerValue: flatOffer[0],
                };
              }
  
              // Calculate percentage offer price
              if (percentageOffer.length > 0) {
                percentageOfferPrice = {
                  price:
                    variant.regularPrice -
                    (variant.regularPrice * percentageOffer[0] / 100),
                  offerValue: percentageOffer[0],
                };
              }
  
              // Determine the best sale price
              let salePrice;
              if (
                flatOfferPrice?.price !== undefined &&
                percentageOfferPrice?.price !== undefined
              ) {
                salePrice =
                  flatOfferPrice.price <= percentageOfferPrice.price
                    ? {
                        price: flatOfferPrice.price,
                        offerType: "flat",
                        offerValue: flatOfferPrice.offerValue,
                      }
                    : {
                        price: percentageOfferPrice.price,
                        offerType: "percentage",
                        offerValue: percentageOfferPrice.offerValue,
                      };
              } else if (flatOfferPrice?.price !== undefined) {
                salePrice = {
                  price: flatOfferPrice.price,
                  offerType: "flat",
                  offerValue: flatOfferPrice.offerValue,
                };
              } else if (percentageOfferPrice?.price !== undefined) {
                salePrice = {
                  price: percentageOfferPrice.price,
                  offerType: "percentage",
                  offerValue: percentageOfferPrice.offerValue,
                };
              } else {
                salePrice = {
                  price: variant.regularPrice,
                  offerType: "none",
                  offerValue: 0,
                };
              }
              console.log(salePrice)
              // Update sale price in the database
              await Variant.findByIdAndUpdate(
                variant._id,
                { $set: { salePrice: salePrice.price } },
                { new: true }
              );
  
              // Update active offer in the product
              await Product.findByIdAndUpdate(
                product._id,
                {
                  $set: {
                    activeOffer: salePrice.offerValue,
                    activeOfferType: salePrice.offerType,
                  },
                },
                { new: true }
              );
            })
          );
        })
      );
    } catch (error) {
      console.log("update sale price", error);
      res.status(500).json('something went wrong')
    }
  };

const editSubCategorySalePrice = async(updatedSubCategory)=>{
    try {
        const category = await Category.findById(updatedSubCategory.categoryId)
        const products = await Product.find({subCategoryId:updatedSubCategory._id},"_id productOffer productOfferType")
        
        const productInfo = await Promise.all(
            products.map(async(product)=>{
                console.log(product._id)
                return {variants:await Variant.find({productId:product._id},"_id regularPrice"),
            _id:product._id,
            productOffer:product.productOffer,
            productOfferType:product.productOfferType,
        }
            })
        )
        
        await calculateSalePriceAndUpdate(productInfo,category.categoryOffer,category.categoryOfferType,updatedSubCategory)
        
    } catch (error) {
        console.log('edit subcategory sale price',error);
        res.status(500).json('something went wrong')
    }
}
module.exports = {editSubCategorySalePrice}
const Product = require("../model/productModel");
const Variant = require("../model/variantModel");
const SubCategory = require("../model/subCategories");
const Category = require("../model/categorySchema");


  

// const editProductSalePrice = async (req, res, next) => {
//   try {
//     const { _id, subCategoryId, productOffer, productOfferType } = req.body;
//     const subCategory = await SubCategory.findById(subCategoryId).populate(
//       "categoryId",
//       "category categoryOffer categoryOfferType"
//     );
//     const flatOffer = [];
//     const percentageOffer = [];
//     let flatOfferPrice = {};
//     let percentageOfferPrice = {};

//     productOfferType === "flat"
//       ? flatOffer.push(productOffer)
//       : productOfferType === "percentage"
//       ? percentageOffer.push(productOffer)
//       : null;
//     subCategory.subCategoryOfferType === "flat"
//       ? flatOffer.push(subCategory.subCategoryOffer)
//       : subCategory.subCategoryOfferType === "percentage"
//       ? percentageOffer.push(subCategory.subCategoryOffer)
//       : null;
//     subCategory.categoryId.categoryOfferType === "flat"
//       ? flatOffer.push(subCategory.categoryId.categoryOfferr)
//       : subCategory.categoryId.categoryOfferType === "percentage"
//       ? percentageOffer.push(subCategory.categoryId.categoryOffer)
//       : null;
//     flatOffer.sort((a, b) => b - a);
//     percentageOffer.sort((a, b) => b - a);

//     const variants = await Variant.find({ productId: _id });

//     variants.map(async (item) => {
//       try {
//         if (flatOffer.length > 0) {
//           flatOfferPrice = {
//             price: item.regularPrice - flatOffer[0],
//             offerValue: flatOffer[0],
//           };
//           console.log(flatOfferPrice.price, "flatofferPrice");
//         }
//         if (percentageOffer.length > 0) {
//           percentageOfferPrice = {
//             price: (item.regularPrice * percentageOffer[0]) / 100,
//             offerValue: percentageOffer[0],
//           };
//           console.log(percentageOfferPrice.price, "percentage offer price");
//         }
//         let salePrice;

//         if (
//           percentageOfferPrice &&
//           percentageOfferPrice.price !== undefined &&
//           percentageOfferPrice.price !== null &&
//           flatOfferPrice &&
//           flatOfferPrice.price !== undefined &&
//           flatOfferPrice.price !== null
//         ) {
//           // Both offers are valid, compare prices
//           salePrice = 
//             regularPrice - percentageOfferPrice.price >= flatOfferPrice.price
//               ? { 
//                   price: regularPrice - percentageOfferPrice.price, 
//                   offerType: 'percentage', 
//                   offerValue: percentageOfferPrice.offerValue 
//                 }
//               : { 
//                   price: flatOfferPrice.price, 
//                   offerType: 'flat', 
//                   offerValue: flatOfferPrice.offerValue 
//                 };
//         } else if (
//           percentageOfferPrice &&
//           percentageOfferPrice.price !== undefined &&
//           percentageOfferPrice.price !== null
//         ) {
//           // Only percentage offer is valid
//           salePrice = {
//             price: regularPrice - percentageOfferPrice.price,
//             offerType: 'percentage',
//             offerValue: percentageOfferPrice.offerValue,
//           };
//         } else if (
//           flatOfferPrice &&
//           flatOfferPrice.price !== undefined &&
//           flatOfferPrice.price !== null
//         ) {
//           // Only flat offer is valid
//           salePrice = {
//             price: flatOfferPrice.price,
//             offerType: 'flat',
//             offerValue: flatOfferPrice.offerValue,
//           };
//         } else {
//           // No valid offer
//           salePrice = {
//             price: regularPrice,
//             offerType: 'none',
//             offerValue: 0,
//           };
//         }

//         await {...item,salePrice:salePrice.price}.save();
//       } catch (error) {
//         console.log("editproduct middleware ", error.message);
//         res.status(500).json("something went wrong");
//       }
//     });

//     console.log(flatOffer, percentageOffer);

//     next();
//   } catch (error) {
//     console.log("edit product sale price", error.message);
//     res.status(500).json("something went wrong");
//   }
// };
// module.exports = { editProductSalePrice };


const editProductSalePrice = async (req, res, next) => {
  try {
    const { _id, subCategoryId, productOffer, productOfferType } = req.body;
    const subCategory = await SubCategory.findById(subCategoryId).populate(
      "categoryId",
      "category categoryOffer categoryOfferType"
    );

    const flatOffer = [];
    const percentageOffer = [];
    let flatOfferPrice = {};
    let percentageOfferPrice = {};

    // Add product offer to respective arrays
    if (productOfferType === "flat") flatOffer.push(productOffer);
    else if (productOfferType === "percentage") percentageOffer.push(productOffer);

    // Add subcategory offer to respective arrays
    if (subCategory.subCategoryOfferType === "flat") flatOffer.push(subCategory.subCategoryOffer);
    else if (subCategory.subCategoryOfferType === "percentage") percentageOffer.push(subCategory.subCategoryOffer);

    // Add category offer to respective arrays
    if (subCategory.categoryId.categoryOfferType === "flat") {
      flatOffer.push(subCategory.categoryId.categoryOffer);
    } else if (subCategory.categoryId.categoryOfferType === "percentage") {
      percentageOffer.push(subCategory.categoryId.categoryOffer);
    }

    // Sort the offers
    flatOffer.sort((a, b) => b - a);
    percentageOffer.sort((a, b) => b - a);

    // Get product variants
    const variants = await Variant.find({ productId: _id });

    for (const item of variants) {
      try {
        const regularPrice = item.regularPrice;

        // Calculate flat offer price
        if (flatOffer.length > 0) {
          flatOfferPrice = {
            price: regularPrice - flatOffer[0],
            offerValue: flatOffer[0],
          };
        }

        // Calculate percentage offer price
        if (percentageOffer.length > 0) {
          percentageOfferPrice = {
            price: regularPrice - (regularPrice * percentageOffer[0]) / 100,
            offerValue: percentageOffer[0],
          };
        }

        // Determine the best sale price
        let salePrice;
        if (flatOfferPrice?.price !== undefined && percentageOfferPrice?.price !== undefined) {
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
            price: regularPrice,
            offerType: "none",
            offerValue: 0,
          };
        }

        // Update sale price in the variant
        
        item.salePrice = salePrice.price;
        req.salePrice = salePrice
        await item.save();
      } catch (error) {
        console.error("Error updating variant sale price:", error.message);
        return res.status(500).json({ error: "Something went wrong" });
      }
    }

    console.log("Flat Offers:", flatOffer, "Percentage Offers:", percentageOffer);
    next();
  } catch (error) {
    console.error("Error in editProductSalePrice middleware:", error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = { editProductSalePrice };

  

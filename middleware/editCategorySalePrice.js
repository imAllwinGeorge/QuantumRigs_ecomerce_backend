// const Product = require("../model/productModel");
// const SubCategory = require("../model/subCategories");
// const Variant = require("../model/variantModel");

// const calculateSalePriceAndUpdate = async (
//   productInfo,
//   categoryOffer,
//   categoryOfferType
// ) => {
//   try {
//     productInfo.map((product) => {
//       const flatOffer = [];
//       const percentageOffer = [];
//       let flatOfferPrice = {};
//       let percentageOfferPrice = {};

//       // Add product offer to respective arrays
//       if (product.productOfferType === "flat")
//         flatOffer.push(product.productOffer);
//       else if (product.productOfferType === "percentage")
//         percentageOffer.push(product.productOffer);

//       // Add subcategory offer to respective arrays
//       if (product.subCategoryId.subCategoryOfferType === "flat")
//         flatOffer.push(product.subCategoryId.subCategoryOffer);
//       else if (product.subCategoryId.subCategoryOfferType === "percentage")
//         percentageOffer.push(product.subCategoryId.subCategoryOffer);

//       // Add category offer to respective arrays
//       if (categoryOfferType === "flat") {
//         flatOffer.push(categoryOffer);
//       } else if (categoryOfferType === "percentage") {
//         percentageOffer.push(categoryOffer);
//       }

//       // Sort the offers
//       flatOffer.sort((a, b) => b - a);
//       percentageOffer.sort((a, b) => b - a);
//       product.productVariant.map(async (variant) => {
//         if (flatOffer.length > 0) {
//           flatOfferPrice = {
//             price: variant.regularPrice - flatOffer[0],
//             offerValue: flatOffer[0],
//           };
//         }

//         // Calculate percentage offer price
//         if (percentageOffer.length > 0) {
//           percentageOfferPrice = {
//             price:
//               regularPrice - (variant.regularPrice * percentageOffer[0]) / 100,
//             offerValue: percentageOffer[0],
//           };
//         }

//         // Determine the best sale price
//         let salePrice;
//         if (
//           flatOfferPrice?.price !== undefined &&
//           percentageOfferPrice?.price !== undefined
//         ) {
//           salePrice =
//             flatOfferPrice.price <= percentageOfferPrice.price
//               ? {
//                   price: flatOfferPrice.price,
//                   offerType: "flat",
//                   offerValue: flatOfferPrice.offerValue,
//                 }
//               : {
//                   price: percentageOfferPrice.price,
//                   offerType: "percentage",
//                   offerValue: percentageOfferPrice.offerValue,
//                 };
//         } else if (flatOfferPrice?.price !== undefined) {
//           salePrice = {
//             price: flatOfferPrice.price,
//             offerType: "flat",
//             offerValue: flatOfferPrice.offerValue,
//           };
//         } else if (percentageOfferPrice?.price !== undefined) {
//           salePrice = {
//             price: percentageOfferPrice.price,
//             offerType: "percentage",
//             offerValue: percentageOfferPrice.offerValue,
//           };
//         } else {
//           salePrice = {
//             price: regularPrice,
//             offerType: "none",
//             offerValue: 0,
//           };
//         }
//         const updateSalePrice = await Variant.findByIdAndUpdate(
//           variant._id,
//           { $set: { salePrice: salePrice.price } },
//           { new: true }
//         );
//         const updateActiveOffer = await Product.findByIdAndUpdate(product.productId,{$set:{activeOffer:salePrice.offerValue,activeOfferType:salePrice.offerType}})
//       });
//     });
//   } catch (error) {
//     console.log("update sale price", error);
//   }
// };

// const editCategorySalePrice = async (req, res, next) => {
//   try {
//     const { categoryId, categoryOffer, categoryOfferType } = req.body;

//     // Fetch all subcategories under the given category
//     const subCategories = await SubCategory.find({ categoryId });

//     // Fetch all products under those subcategories
//     const productsInfo = await Promise.all(
//       subCategories.map(
//         async (item) => await Product.find({ subCategoryId: item._id }, "_id")
//       )
//     );

//     // Flatten the array of product IDs
//     const products = productsInfo.flat();

//     // Fetch all variants related to the products
//     const variantDetails = await Promise.all(
//       products.map(
//         async (item) =>
//           await Product.aggregate([
//             {
//               $lookup: {
//                 from: "varients", // Corrected typo from "rom" to "from"
//                 localField: "_id",
//                 foreignField: "productId",
//                 as: "variants",
//               },
//             },
//             {
//               $match: { _id: item._id }, // Match only the specific product
//             },
//           ])
//       )
//     );

//     // Flatten the results from the aggregation
//     const allVariants = variantDetails.flat();

//     const productInfo = await Promise.all(
//       allVariants.map(async (product) => {
//         return {
//           productId: product._id,
//           subCategoryId: await SubCategory.findById(
//             product.subCategoryId,
//             "subCategoryOffer subCategoryOfferType"
//           ),
//           productOffer: product.productOffer,
//           productOfferType: product.productOfferType,
//           productVariant: product.variants.map((variant) => {
//             return { regularPrice: variant.regularPrice, _id: variant._id };
//           }),
//         };
//       })
//     );
//     const updateSalePrice = calculateSalePriceAndUpdate(
//       productInfo,
//       categoryOffer,
//       categoryOfferType
//     );

//     next();
//   } catch (error) {
//     console.log("edit category sale price middleware", error.message);
//     res.status(500).json("something went wrong");
//   }
// };

// module.exports = { editCategorySalePrice };


const Product = require("../model/productModel");
const SubCategory = require("../model/subCategories");
const Variant = require("../model/variantModel");

const calculateSalePriceAndUpdate = async (
  productInfo,
  categoryOffer,
  categoryOfferType
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
        if (product.subCategoryId.subCategoryOfferType === "flat")
          flatOffer.push(product.subCategoryId.subCategoryOffer);
        else if (product.subCategoryId.subCategoryOfferType === "percentage")
          percentageOffer.push(product.subCategoryId.subCategoryOffer);

        // Add category offer to respective arrays
        if (categoryOfferType === "flat") {
          flatOffer.push(categoryOffer);
        } else if (categoryOfferType === "percentage") {
          percentageOffer.push(categoryOffer);
        }

        // Sort the offers
        flatOffer.sort((a, b) => b - a);
        percentageOffer.sort((a, b) => b - a);
        console.log(percentageOffer)
        await Promise.all(
          product.productVariant.map(async (variant) => {
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
              product.productId,
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

const editCategorySalePrice = async (categoryId,categoryOffer,categoryOfferType) => {
  
  try {
    // console.log('kkkkkkkkkkkkkkkkk',req.body)
    // const { categoryId, categoryOffer, categoryOfferType } = req.body;

    // Fetch all subcategories under the given category
    const subCategories = await SubCategory.find({ categoryId });

    // Fetch all products under those subcategories
    const productsInfo = await Promise.all(
      subCategories.map(
        async (item) =>
          await Product.find(
            { subCategoryId: item._id },
            "_id subCategoryId productOffer productOfferType"
          )
      )
    );

    // Flatten the array of product details
    const products = productsInfo.flat();

    // Fetch all variants related to the products
    const productInfo = await Promise.all(
      products.map(async (product) => {
        const variants = await Variant.find(
          { productId: product._id },
          "regularPrice _id"
        );
        return {
          productId: product._id,
          subCategoryId: await SubCategory.findById(
            product.subCategoryId,
            "subCategoryOffer subCategoryOfferType"
          ),
          productOffer: product.productOffer,
          productOfferType: product.productOfferType,
          productVariant: variants.map((variant) => ({
            regularPrice: variant.regularPrice,
            _id: variant._id,
          })),
        };
      })
    );
    
    await calculateSalePriceAndUpdate(
      productInfo,
      categoryOffer,
      categoryOfferType
    );

    
  } catch (error) {
    console.log("edit category sale price middleware", error);
    res.status(500).json("Something went wrong");
  }
};

module.exports = { editCategorySalePrice };

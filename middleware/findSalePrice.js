const Product = require("../model/productModel");
const SubCagetory = require("../model/subCategories");
const Category = require("../model/categorySchema")

const findSalePrice = async(req,res,next)=>{
    try {
        const {productId, subCategoryId, regularPrice} = req.body;
    console.log(productId,subCategoryId,regularPrice);
    const productInfo = await Product.findById(productId);
    const subCategoryInfo = await SubCagetory.findById(subCategoryId).populate('categoryId','category categoryOffer categoryOfferType');
    const flatOffer = [];
    const percentageOffer = [];
    let flatOfferPrice = {};
    let percentageOfferPrice = {};
    
    productInfo.productOfferType === 'flat'?flatOffer.push(productInfo.productOffer):productInfo.productOfferType === 'percentage'?percentageOffer.push(productInfo.productOffer):null;
    subCategoryInfo.subCategoryOfferType === 'flat'?flatOffer.push(subCategoryInfo.subCategoryOffer):subCategoryInfo.subCategoryOfferType === 'percentage'?percentageOffer.push(subCategoryInfo.subCategoryOffer):null;
    subCategoryInfo.categoryId.categoryOfferType === 'flat'?flatOffer.push(subCategoryInfo.categoryId.categoryOfferr):subCategoryInfo.categoryId.categoryOfferType === 'percentage'?percentageOffer.push(subCategoryInfo.categoryId.categoryOffer):null;
    flatOffer.sort((a,b)=>b-a);
    percentageOffer.sort((a,b)=>b-a);
    
    if(flatOffer.length > 0){
        flatOfferPrice = {price:regularPrice - flatOffer[0],offerValue:flatOffer[0] }
        console.log(flatOfferPrice.price,"flatofferPrice")
    }
    if(percentageOffer.length > 0){
    percentageOfferPrice = {price:regularPrice * percentageOffer[0]/100,offerValue:percentageOffer[0]}
    console.log(percentageOfferPrice.price,"percentage offer price")
    }
    console.log(flatOfferPrice,percentageOfferPrice)
    
    let salePrice;

if (
  percentageOfferPrice &&
  percentageOfferPrice.price !== undefined &&
  percentageOfferPrice.price !== null &&
  flatOfferPrice &&
  flatOfferPrice.price !== undefined &&
  flatOfferPrice.price !== null
) {
  // Both offers are valid, compare prices
  salePrice = 
    regularPrice - percentageOfferPrice.price >= flatOfferPrice.price
      ? { 
          price: regularPrice - percentageOfferPrice.price, 
          offerType: 'percentage', 
          offerValue: percentageOfferPrice.offerValue 
        }
      : { 
          price: flatOfferPrice.price, 
          offerType: 'flat', 
          offerValue: flatOfferPrice.offerValue 
        };
} else if (
  percentageOfferPrice &&
  percentageOfferPrice.price !== undefined &&
  percentageOfferPrice.price !== null
) {
  // Only percentage offer is valid
  salePrice = {
    price: regularPrice - percentageOfferPrice.price,
    offerType: 'percentage',
    offerValue: percentageOfferPrice.offerValue,
  };
} else if (
  flatOfferPrice &&
  flatOfferPrice.price !== undefined &&
  flatOfferPrice.price !== null
) {
  // Only flat offer is valid
  salePrice = {
    price: flatOfferPrice.price,
    offerType: 'flat',
    offerValue: flatOfferPrice.offerValue,
  };
} else {
  // No valid offer
  salePrice = {
    price: regularPrice,
    offerType: 'none',
    offerValue: 0,
  };
}

    req.salePrice = salePrice;
    console.log(req.salePrice)
    next();
    } catch (error) {
        console.log('find Sale Price ', error);
        res.status(500).json('something went wrong')
    }
}

module.exports = {findSalePrice}
const SubCategories = require('../model/subCategories')
const Brand = require('../model/brandModel')
const Product = require('../model/productModel')
const Variant = require('../model/variantModel')

const getProductPage = async(req,res)=>{
    try {
        const subCategories = await SubCategories.find({isListed:true});
       
        const brands = await Brand.find({isListed:true});
        
        if(subCategories && brands){
            return res.status(200).json({subCategories,brands})
        }

    } catch (error) {
        console.log('addproducts',error)
    }
}

const getProductDetails = async(req,res)=>{
    try {
        const product = await Product.find()
        console.log(product);
        return res.status(200).json(product)

    } catch (error) {
        console.log('getProductdetailse',error)
    }
}

const moreProdctDetails = async (req,res)=>{
    try {
        
        const productId = req.params.productId
        console.log(productId)
        const response = await Product.findById(productId).populate('brandId').populate('subCategoryId')
        console.log(response)
        if(response){
            return res.status(200).json(response)
        }
        return res.status(404).json('user not found')
    } catch (error) {
        console.log('moreproductdetails',error)
    }
}

const addProduct = async (req,res)=>{
    try {
        const {productName,description,brandId,subCategoryId,productOffer,productOfferType} = req.body
        let filename =[];
        if(req.files){
            filename = req.files.map(images=>images.filename)
            
        }
        
        const isExist = await Product.findOne({productName});
        if(isExist){
            return res.status(404).json('produt already exist');
        }
        const productDetails = await Product.create({productName,description,brandId,subCategoryId,productOffer,productOfferType,images:filename})
        console.log(productDetails)
        if(productDetails){
            return res.status(201).json({productDetails})
        }
        return res.status(500).json('something went wrong')
    } catch (error) {
        console.log("addproductspost",error)
    }
}

const addVariant = async(req,res)=>{
    try {
        const {attributes,quantity,regularPrice,salePrice,productId} = req.body
        await Variant.create({
            attributes,quantity,regularPrice,salePrice,productId
        })

        return res.status(201).json('product details added')
    } catch (error) {
        console.log('addvariant ',error)
    }
}

const fetchBrands = async(req,res)=>{
    try {
        const brands = await Brand.find();
        if(brands){
            return res.status(200).json(brands)
        }
    } catch (error) {
        console.log('fetcbrands',error)
    }
}

const AddBrands = async(req,res)=>{
    try {
        const {brand,description} = req.body
        console.log(brand,description)
        const isExist = await Brand.findOne({brand});
        console.log(isExist)
        if(!isExist){
            await Brand.create({brand,description})
            return res.status(201).json('brnad addedsuccessfully')
        }
        return res.status(404).json('brand already exist')
    } catch (error) {
        console.log('addbrands',error)
    }
}

module.exports = {getProductPage,addProduct,addVariant,AddBrands,fetchBrands,getProductDetails,moreProdctDetails}
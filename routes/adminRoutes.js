const express = require('express')
const route = express.Router();
const adminController = require('../controller/adminController')
const productController = require('../controller/productController')
const orderController = require('../controller/orderController')
const {upload} = require('../config/multer')


route.get('/verify-token',adminController.verifyToken)

route.post('/login',adminController.login)

route.get('/users',adminController.getUserdata)

route.patch('/blockuser',adminController.blockUser)             // need ot combine the block user and unblock user

route.patch('/unblockuser',adminController.unBlockUser)

route.get('/getcategories',adminController.getCategories)

route.post('/addcategory',adminController.addCategory)

route.put('/editcategory',adminController.editCategory)

route.patch('/toggleCategoryListing',adminController.toggleCategoryListing)

route.post('/getSubCategories',adminController.getSubCategories)

route.post('/addsubcategory',adminController.addSubCategory)

route.patch('/subCatogoryToggle',adminController.subCatogoryToggle)

route.put('/editsubcategory',adminController.editsubcategory)

route.get('/addproduct',productController.getProductPage)

route.post('/addvariant',productController.addVariant)

route.post('/addproduct', upload.array('images', 3),productController.addProduct)

route.get('/brands',productController.fetchBrands)

route.post('/addbrands',productController.AddBrands)

route.get('/getproductdetails',productController.getProductDetails)

route.get('/moreprodctdetails/:productId',productController.moreProdctDetails)

route.delete('/deleteimage',productController.deleteImage)

route.put('/editproduct',upload.array('newImages', 3),productController.editProduct)

route.put('/updateVariant/:variantId',productController.updateVariant);

route.get('/get-orders',orderController.getOrders);

route.patch('/change-status/:status/:orderId/:productOrderId',orderController.changeStatus);

route.get('/logout',adminController.logout)

module.exports = route
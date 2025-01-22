const express = require('express')
const route = express.Router();
const userController = require('../controller/usercontroller')
const otpVerification = require('../controller/otpVerification');
const cartContorller = require('../controller/cartController');
const orderController = require('../controller/orderController')
const couponController = require('../controller/couponController');
const wishlistContoller = require('../controller/wishlistController');
const walletController = require('../controller/walletcontroller');
const productController = require('../controller/productController')



// route.post('/signup',userController.signup);

route.post('/signup',otpVerification.signup);

route.post('/gooogle-signup',userController.googleSignUp);

route.post('/otp-submit',userController.signup);

route.get('/resend-otp',otpVerification.resendOtp);

route.get('/verify-token',userController.verifyToken);

route.post('/login',userController.login);

route.post('/verify-email',otpVerification.verifyEmail);

route.put('/change-password',userController.changePassword);

route.get('/home',userController.home);

route.get('/product/:productId',userController.productDescription);

route.get('/fetch_user/:userId',userController.fetchUser);

route.put('/user-edit',userController.editUser);

route.put('/reset-password',userController.resetPassword);

route.post('/add-address',userController.addAddress);

route.get('/get-address/:userId',userController.getAddress);

route.put('/edit-address',userController.editAddress);

route.patch('/delete-address/:addressId',userController.deleteAddress);

route.post('/add-to-cart',cartContorller.addToCart);

route.get('/get-cart/:userId',cartContorller.getCart);

route.patch('/cart-quantity/:productId/:variantId/:userId/:value',cartContorller.quantityManagement);

route.delete('/remove-item/:productId/:variantId/:userId',cartContorller.removeProduct);

route.post('/order-product',orderController.orderProducts);

route.get('/fetch-order-details/:userId',orderController.fetchOrderDetails);

route.patch('/cancel-product',orderController.cancelProduct);

route.get('/get-coupons',couponController.getCoupons);

route.post("/api/payment/create-order",orderController.razorpayCreateOrder);

route.post("/api/payment/verify-payment",orderController.verifyRazorpayPayment);

route.get('/get-wishlist/:userId',wishlistContoller.getWishlist);

route.post('/addto-wishlist/:productId/:variantId/:userId',wishlistContoller.addToWishlist);

route.delete('/remove-product/:productId/:variantId/:userId',wishlistContoller.removeProduct);

route.get("/get-wallet/:userId",walletController.getWalletHistory);

route.post("/return-product",productController.returnProduct);

route.get('/userlogout',userController.logout);




module.exports = route
const express = require('express')
const route = express.Router();
const userController = require('../controller/usercontroller')
const otpVerification = require('../controller/otpVerification');



// route.post('/signup',userController.signup);

route.post('/signup',otpVerification.signup)

route.post('/gooogle-signup',userController.googleSignUp)

route.post('/otp-submit',userController.signup)

route.get('/resend-otp',otpVerification.resendOtp)

route.get('/verify-token',userController.verifyToken)

route.post('/login',userController.login)

route.post('/verify-email',otpVerification.verifyEmail)

route.put('/change-password',userController.changePassword)

route.get('/home',userController.home)

route.get('/product/:productId',userController.productDescription)

route.get('/fetch_user/:userId',userController.fetchUser)

route.put('/user-edit',userController.editUser)

route.put('/reset-password',userController.resetPassword)

route.post('/add-address',userController.addAddress)

route.get('/get-address/:userId',userController.getAddress)

route.put('/edit-address',userController.editAddress);

route.patch('/delete-address/:addressId',userController.deleteAddress);

route.get('/userlogout',userController.logout)




module.exports = route
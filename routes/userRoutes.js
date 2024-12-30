const express = require('express')
const route = express.Router();
const userController = require('../controller/usercontroller')
const otpVerification = require('../controller/otpVerification')


// route.post('/signup',userController.signup);

route.post('/signup',otpVerification.signup)

route.post('/gooogle-signup',userController.googleSignUp)

route.post('/otp=submit',userController.signup)

route.get('/resend-otp',otpVerification.resendOtp)

route.get('/verify-token',userController.verifyToken)

route.post('/login',userController.login)

route.get('/home',userController.home)

route.get('/product/:productId',userController.productDescription)

route.get('/userlogout',userController.logout)




module.exports = route
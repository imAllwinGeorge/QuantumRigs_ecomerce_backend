const express = require('express')
const route = express.Router();
const userController = require('../controller/usercontroller')


route.post('/signup',userController.signup);

route.post('/login',userController.login)

route.get('/home',userController.home)

route.get('/logout',userController.logout)



module.exports = route
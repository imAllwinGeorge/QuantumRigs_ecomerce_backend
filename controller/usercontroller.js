const User = require("../model/userSchema");
const bcrypt = require("bcrypt");
const saltRound = parseInt(process.env.SALT_VALUE);
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const Product = require("../model/productModel");
const Variant = require("../model/variantModel");
require("dotenv").config();
const secretKey = process.env.JWT_SCRET;

const signup = async (req, res) => {
  try {
    const { email, firstName, lastName, phone, userName, password } = req.body;
    console.log(req.body);
    const isExist = await User.findOne({ email });

    if (isExist) {
      return res.status(409).json(
         "user already exist"
      );
    } 
    else if (password) {

      // const otp = Math.floor(100000+Math.random()*900000).toString();

      // const transporter = nodemailer.createTransport({
      //   host: "smtp.ethereal.email",
      //   port: 587,
      //   secure: false, // true for port 465, false for other ports
      //   auth: {
      //     user: "maddison53@ethereal.email",
      //     pass: "jn7jnAPss4f63QBp6D",
      //   },
      // });
      

      const hashedPassword = await bcrypt.hash(password, saltRound);

      const user = await User.create({
        firstName,
        lastName,
        userName,
        email,
        password: hashedPassword,
        phone,
      });

      // await user.save();

      return res.status(201).json({
        message: "user created succefully",
      });
    } else if (req.body.googleId) {
      console.log(req.body.googleId);
      await User.create({
        firstName,
        lastName,
        userName,
        email,
        googleId: req.body.googleId,
      });
      res.json({
        status: 201,
        message: "user created successfully",
        googleId: req.body.googleId,
      });
    }
  } catch (error) {
    console.log(error);
    res.json('some thing went wrong');
  }
};

const verifyToken = async (req,res)=>{
  const userToken = req.cookies.user_token
  console.log(userToken)
  if(!userToken){
    return res.status(404).json('no token available')
  }

  // Using promisified version of jwt.verify for better error handling
     try {
       const decoded = await new Promise((resolve, reject) => {
         jwt.verify(userToken, process.env.JWT_SCRET, (err, decoded) => {
           if (err) reject(err);
           resolve(decoded);
         });
       });
 
       console.log('Token verified for user:', decoded);
       
       // Attach the decoded user info to the request object for use in subsequent middleware
      //  req.user = decoded;
 
       return res.status(200).json({
         success: true,
         message: 'Token verified',
         user: decoded // Optionally return user info if needed by frontend
       });

      }catch(error){
        console.log('verify userToken',error)
        res.status(500).json('something went wrong')
      }
}

const login = async (req, res) => {
  try {
    const { googleId } = req.body;
    if (googleId) {
      const user = await User.findOne({ googleId });
      console.log(user.firstName);
      if (user.isBlocked) {
        return res.status(403).json("user blocked");
      }

      if (!user) {
        return res.status(404).json("user does not exist");
      } else {
        try {
          const token = jwt.sign({googleId},secretKey,{expiresIn:'30d'})
          res.cookie("user_token", token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            secure: false, // Set to true in production with HTTPS
            sameSite: "lax",
          });
          return res.status(200).json({
            user,
          });

        } catch (error) {
          console.log('googlelogin tokenn',error)
          return res.status(500).json('something went wrong')
        }
        
      }
    } else {
      try {
        const {email,password} = req.body
        console.log(req.body)
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json('user not found')
        }
        console.log(user.isBlocked)
        if(user.isBlocked){
            console.log('not blocked')
            return res.status(403).json('user is not allowed to login')
        }
        
        const isMatch = await bcrypt.compare(password,user.password)
        
        if(!isMatch){
            console.log(isMatch)
            return res.status(401).json('invalid credential')
        }

       console.log('hello')
            const token = jwt.sign({id:user._id},secretKey,{expiresIn:'30d'})
console.log(token)
            res.cookie("user_token", token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                secure: false, // Set to true in production with HTTPS
                sameSite: "lax",
              });
          
              console.log("user signin successful");
          
              return res.status(200).json({
                message: "Login successful",
                id: user._id,
                name: user.firstName,
                email: user.email,
                phone: user.phone,
              });
       
      } catch (error) {
        console.log(error)
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const home = async (req, res) => {
  try {
    const productDetails = await Product.aggregate([{$lookup:{from:'varients',localField:'_id',foreignField  :'productId',as:'variants'}}])
    // const productDetails = await Variant.findOne({productId:'67696b243116fc8c75910ad6'})
    // console.log(productDetails)
    if(productDetails){
      return res.status(200).json(productDetails)
    }
    return res.status(404).json('no product details to show')
  } catch (error) {
    console.log('homepag',error)
    res.status(500).json('something went wrong')
  }
};

const productDescription = async(req,res)=>{
  try {
    const productId = req.params.productId
    console.log(productId,'222222222222222222222222222222')
    const productDetails = await Product.findById({_id:productId}).populate('brandId','brand')
    const variantDetails = await Variant.find({productId:productId})
    console.log(productDetails,variantDetails)
    return res.status(200).json({productDetails,variantDetails})
  } catch (error) {
    console.log('productDescription',error)
  }
}

const logout = (req, res) => {
  console.log(req.session)
  if (req.user) {
    req.logOut(() => {
      console.log(req.user);
      return res.json("logout success");
    });
  } else if (req.session) {
    console.log(req.session);
    req.session.destroy(() => {
      // res.cookie("user_token","", {
      //   httpOnly: true,
      //   maxAge: new Date(0),
      //   secure: false, // Set to true in production with HTTPS
      //   sameSite: "lax",
      // });

      res.cookie("user_token", "", {
        // Use the same name as your cookie
        httpOnly: true, // Keep HttpOnly flag
        secure: process.env.NODE_ENV === "production", // Set secure flag for production (HTTPS)
        expires: new Date(0), // Set expiry to the past
        sameSite: "strict", // Optional: to prevent CSRF in certain contexts
      });
      console.log(req.session);
      return res.status(200).json("normal user logout success full");
    });
  } else {
    return res.status(500).json("some thing went worng");
  }
};

module.exports = { signup, login, logout, home ,verifyToken,productDescription};

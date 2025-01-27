const User = require("../model/userSchema");
const bcrypt = require("bcrypt");
const saltRound = parseInt(process.env.SALT_VALUE);
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Product = require("../model/productModel");
const Variant = require("../model/variantModel");
const Brand = require("../model/brandModel");
const Address = require("../model/addressModel");
require("dotenv").config();
const secretKey = process.env.JWT_SCRET;

const signup = async (req, res) => {
  console.log("session", req.session.userData);
  try {
    const { otp } = req.body;
    const { userOtp } = req.session;
    const { firstName, lastName, email, password, phone } =
      req.session.userData;

    if (password && otp == userOtp) {
      const hashedPassword = await bcrypt.hash(password, saltRound);

      const user = await User.create({
        firstName,
        lastName,
        userName: firstName,
        email,
        password: hashedPassword,
        phone,
      });

      // await user.save();

      const token = await jwt.sign({ _id: user._id }, secretKey, {
        expiresIn: "30d",
      });
      res.cookie("user_token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: false, // Set to true in production with HTTPS
        sameSite: "lax",
      });

      return res.status(201).json({
        message: "signup success full",
        id: user._id,
        name: user.firstName,
        email: user.email,
        phone: user.phone,
      });
    } else if (email && otp == userOtp) {
      return res.status(200).json({ message: "otp verified", email });
    } else {
      return res.status(401).json("Invalid otp");
    }
  } catch (error) {
    console.log(error);
    res.json("some thing went wrong");
  }
};

const googleSignUp = async (req, res) => {
  try {
    console.log(req.body);
    const { firstName, lastName, userName, email, googleId } = req.body;

    const isExist = await User.findOne({ email });
    if (isExist) {
      const token = await jwt.sign({ _id: isExist._id }, secretKey, {
        expiresIn: "30d",
      });
      res.cookie("user_token", token, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        secure: false,
        sameSite: "lax",
      });
      return res.status(200).json(googleId);
    }

    await User.create({
      firstName,
      lastName,
      userName,
      email,
      googleId,
    });

    const token = await jwt.sign({ _id: googleId }, secretKey, {
      expiresIn: "30d",
    });
    res.cookie("user_token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
    });
    return res.status(201).json({
      message: "user created successfully",
      id: req.body.googleId,
    });
  } catch (error) {
    console.log("googlesignup", error);
  }
};

const verifyToken = async (req, res) => {
  const userToken = req.cookies.user_token;
  // console.log("usertoken verification", userToken);
  if (!userToken) {
    return res.status(401).json(userToken);
  }

  // Using promisified version of jwt.verify for better error handling
  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(userToken, process.env.JWT_SCRET, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
      });
    });

    console.log("Token verified for user:", decoded);

    // Attach the decoded user info to the request object for use in subsequent middleware
    //  req.user = decoded;
    console.log(decoded._id)
    const user = await User.findOne( {_id: decoded._id });
    // console.log("is active user", user);
    if (user.isBlocked) {
      return res
        .status(401)
        .json("Your session is invalid. Please contact admin");
    }

    return res.status(200).json({
      success: true,
      message: "Token verified",
      user: decoded, // Optionally return user info if needed by frontend
    });
  } catch (error) {
    console.log("verify userToken", error);
    res.status(500).json("something went wrong");
  }
};

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
          const token = jwt.sign({ _id: user._id }, secretKey, {
            expiresIn: "30d",
          });

          res.cookie("user_token", token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            secure: false, // Set to true in production with HTTPS
            sameSite: "lax",
          });
          return res.status(200).json({
            message: "Login successful",
            id: user._id,
            name: user.firstName,
            email: user.email,
            phone: user.phone,
          });
        } catch (error) {
          console.log("googlelogin tokenn", error);
          return res.status(500).json("something went wrong");
        }
      }
    } else {
      try {
        const { email, password } = req.body;
        console.log(req.body);
        const user = await User.findOne({ email });
        if (!user) {
          return res.status(404).json("user not found");
        }
        console.log(user.isBlocked);
        if (user.isBlocked) {
          console.log("not blocked");
          return res
            .status(403)
            .json("user is not allowed to login, please contact admin");
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          console.log(isMatch);
          return res.status(401).json("invalid credential");
        }

        console.log("hello");
        const token = jwt.sign({ _id: user._id }, secretKey, {
          expiresIn: "30d",
        });
        console.log(token);

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
        console.log(error);
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const changePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { email } = req.session.userData;
    console.log(email);
    const hashedPassword = await bcrypt.hash(password, saltRound);
    const user = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );
    if (!user) {
      return res.status(401).json("user not found");
    }

    const token = await jwt.sign({ _id: user._id }, secretKey, {
      expiresIn: "30d",
    });
    console.log(token, "user-token from changepassword");

    res.cookie("user_token", token, {
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: false, // Set to true in production with HTTPS
      sameSite: "lax",
    });
    return res.status(200).json({
      message: "password changed successfully",
      id: user._id,
      name: user.firstName,
      email: user.email,
      phone: user.phone,
    });
  } catch (error) {
    console.log(error.message, "change password userController");
    res.status(500).json("some thing wrong");
  }
};

const home = async (req, res) => {
  try {
    const productDetails = await Product.aggregate([
      {
        $lookup: {
          from: "varients",
          localField: "_id",
          foreignField: "productId",
          as: "variants",
        },
      },
    ]);
    const brandDetails = await Brand.find();
    // const productDetails = await Variant.findOne({productId:'67696b243116fc8c75910ad6'})
    // console.log(productDetails)
    if (productDetails) {
      return res.status(200).json({ productDetails, brandDetails });
    }
    return res.status(404).json("no product details to show");
  } catch (error) {
    console.log("homepag", error);
    res.status(500).json("something went wrong");
  }
};

const productDescription = async (req, res) => {
  try {
    const productId = req.params.productId;

    const productDetails = await Product.findById({ _id: productId }).populate(
      "brandId",
      "brand"
    );
    const variantDetails = await Variant.find({ productId: productId });
    const similarProducts = await Product.find({
      subCategoryId: productDetails.subCategoryId,
      _id: { $ne: productId },
    }).populate("brandId", "brand");
    const similarVariants = [];
    for (i = 0; i < similarProducts.length; i++) {
      const similarProductsVariant = await Variant.find({
        productId: similarProducts[i]?._id,
      });
      similarVariants.push(similarProductsVariant);
    }
    const similarProductVariants = similarVariants.flat();
    console.log(productDetails, variantDetails);
    return res.status(200).json({
      productDetails,
      variantDetails,
      similarProducts,
      similarProductVariants,
    });
  } catch (error) {
    console.log("productDescription", error);
  }
};

const fetchUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log(userId);
    const user = await User.findById(userId).select("-password");
    console.log("fetched user", user);
    if (!user) {
      return res.status(404).json("user not found");
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log("fetch user details", error.message);
    res.status(500).json("something went wrong");
  }
};

const editUser = async (req, res) => {
  try {
    const { _id, firstName, lastName, email, phone } = req.body;
    console.log(req.body);
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { firstName, lastName, phone },
      { new: true }
    ).select("-password");
    console.log("updatedUser edituser", updatedUser);
    return res.status(200).json({updatedUser,message:"user data updated"});
  } catch (error) {
    console.log(error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, _id } = req.body;
    const isExist = await User.findById(_id);
    if (!isExist) {
      return res.status(404).json("user not found");
    }

    const match = await bcrypt.compare(oldPassword, isExist.password);
    if (!match) {
      return res.status(401).json("check your old password");
    }
    const hashedPassword = await bcrypt.hash(newPassword, saltRound);

    const updatePassword = await User.findByIdAndUpdate(_id, {
      password: hashedPassword,
    });

    if (updatePassword) {
      return res.status(200).json("Reset password successfull");
    }
    res.status(500).json("something went wrong");
  } catch (error) {
    console.log("resetPassword", error.message);
    res.status(500).json("something went wrong");
  }
};

const addAddress = async (req, res) => {
  try {
    console.log("addadress");
    const { name, phone, address, pincode, city, state, userId } = req.body;
    console.log(req.body);
    const isExist = await Address.findOne({ userId, address, pincode });
    if (isExist) {
      return res.status(400).json("this address is already exist");
    }
    const addedAddress = await Address.create({
      name,
      phone,
      address,
      pincode,
      city,
      state,
      userId,
    });
    console.log("addresss adddedddd");
    return res.status(201).json("address added succussfully");
  } catch (error) {
    console.log("add address usercontroller", error);
  }
};

const getAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const addresses = await Address.find({ userId,isActive:true });
    if (!addresses) {
      return res.status(404).json("address not found");
    }
    return res.status(200).json(addresses);
  } catch (error) {
    console.log("get address", error.message);
    res.status(500).json("something went wrong");
  }
};

const editAddress = async (req, res) => {
  try {
    const { name, phone, address, city, pincode, state, _id } = req.body;
    const updateAddress = await Address.findByIdAndUpdate(
      _id,
      { name, phone, address, pincode, city, state },
      { new: true }
    );
    if(!updateAddress){
      return res.status(401).json('address couldnot updated');
    }
  return res.status(200).json({updateAddress,message:'Address updated'})
  } catch (error) {
    console.log("edit address", error.message);
  }
};

const deleteAddress = async (req,res)=>{
  try {
    
    const {addressId} = req.params;
    
    const updatedAddress = await Address.findByIdAndUpdate({_id:addressId},{isActive:false});
    
    if(!updatedAddress){
      return res.status(404).json('address couldnot delete')
    }
    return res.status(200).json('address deleted')
  } catch (error) {
    console.log('delete address',error.message)
    res.status(500).json('some thing went wrong')
  }
}

const logout = (req, res) => {
  console.log(req.session);
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

module.exports = {
  signup,
  login,
  logout,
  home,
  verifyToken,
  productDescription,
  googleSignUp,
  changePassword,
  fetchUser,
  editUser,
  resetPassword,
  addAddress,
  getAddress,
  editAddress,
  deleteAddress,
};

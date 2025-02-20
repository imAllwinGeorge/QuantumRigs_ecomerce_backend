const User = require("../model/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Category = require("../model/categorySchema");
const SubCategory = require("../model/subCategories");
const { editCategorySalePrice } = require("../middleware/editCategorySalePrice");
const { editSubCategorySalePrice } = require("../middleware/editSubCategorySalePrice");
require("dotenv").config();
const secretKey = process.env.JWT_SCRET;

const verifyToken = async (req, res) => {
  try {
    const token = req.cookies.token
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    // Using promisified version of jwt.verify for better error handling
    try {
      const decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SCRET, (err, decoded) => {
          if (err) reject(err);
          resolve(decoded);
        });
      });

      console.log('Token verified for user:', decoded);
      
      // Attach the decoded user info to the request object for use in subsequent middleware
      req.admin = decoded;

      return res.status(200).json({
        success: true,
        message: 'Token verified',
        user: decoded // Optionally return user info if needed by frontend
      });

    } catch (jwtError) {
      console.log('JWT verification failed:', jwtError);
      return res.status(401).json({
        success: false,
        message: jwtError.name === 'TokenExpiredError' 
          ? 'Token has expired' 
          : 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during token verification'
    });
  }
};

const login = async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json("user not found" );
    } else {
      if (user.isAdmin) {
        bcrypt.compare(password, user.password, (err, data) => {
          if (data) {
            const token = jwt.sign({ id: user._id }, secretKey, {
              expiresIn: "30d",
            });

            res.cookie("token", token, {
              httpOnly: true,
              maxAge: 30 * 24 * 60 * 60 * 1000,
              secure: false,
              sameSite: "lax",
            });

            console.log("admin signin succefull");
            return res.status(200).json({
              message: "Login successful",
              id: user._id,
              name: user.firstName,
              email: user.email,
              phone: user.phone,
            });
          } else {
            return res.status(404).json("password incorrect" );
          }
        });
      } else {
        return res.status(401).json("Unauthorized access request" );
      }
    }
  } catch (error) {
    console.log(error);

  }
};

const getUserdata = async (req, res) => {
  try {
    const users = await User.find();
    if (users) {
      console.log(users);
      return res.status(200).json(users);
    }
  } catch (error) {
    console.log(error);
  }
};

const blockUser = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findByIdAndUpdate(
    { _id: userId },
    { isBlocked: true },
    { new: true }
  );

  if (user) {
    return res.status(200).json({user,message:'user blocked'});
  }
};

const unBlockUser = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findByIdAndUpdate(
    { _id: userId },
    { isBlocked: false },
    { new: true }
  );

  if (user) {
    return res.status(200).json({user,message:"user unblocked"});
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ categories });
  } catch (error) {
    console.log(error);
  }
};

const addSubCategory = async (req, res) => {
  const {
    subCategory,
    description,
    subCategoryOffer,
    subCategoryOfferType,
    categoryId,
  } = req.body;
  console.log(categoryId);
  try {
    const isExist = await SubCategory.findOne({ subCategory:{$regex: new RegExp(`^${subCategory}$`,'i')} } );
    if (isExist) {
      return res.status(409).json("user already exist");
    }
    await SubCategory.create({
      subCategory,
      description,
      subCategoryOffer,
      subCategoryOfferType,
      categoryId,
    });
    return res.status(201).json("sub-Category created successfull");
  } catch (error) {
    console.log("addsubcategory", error);
  }
};

const getSubCategories = async (req, res) => {
  const { categoryId } = req.body;
  console.log(categoryId);
  try {
    const subCategories = await SubCategory.find({ categoryId });
    if (subCategories) {
      return res.status(200).json({ subCategories });
    }
    return res.status(404).json("sub category not found");
  } catch (error) {
    console.log("getsubcategories", error);
  }
};

const addCategory = async (req, res) => {
  const { category, description,categoryOffer,categoryOfferType } = req.body;
  try {
    const cat = await Category.findOne({ category:{$regex: new RegExp(`^${category}$`,'i')}  });
    if (cat) {
      return res.status(409).json("category already exist");
    }
    await Category.create({
      category,
      description,
      categoryOffer,
      categoryOfferType
    });

    return res.status(201).json("category added successful");
  } catch (error) {
    console.log(",,,,,,,,,,,", error);
    res.status(500).json('something went wrong')
  }
};

const editCategory = async (req, res) => {
  try {
    const { categoryId, category, description, categoryOffer, categoryOfferType } = req.body;

    const isExist = await Category.findOne({
      category,
      _id: { $ne: categoryId },
    });
    console.log(isExist, "editcategory");
    if (!isExist) {
      const editedCategory = await Category.findByIdAndUpdate(
        { _id: categoryId },
        { category, description,categoryOffer,categoryOfferType },
        { new: true }
      );
      req.body.categoryId = categoryId;
      req.body.categoryOffer = categoryOffer;
      req.body.categoryOfferType = categoryOfferType;
      
      await editCategorySalePrice(categoryId,categoryOffer,categoryOfferType);
      return res.status(200).json(editedCategory);
    }
    return res.status(404).json("something went wrong");
  } catch (error) {
    console.log("editCategory", error);
    res.status(500).json("internal sever error")
  }
};

const toggleCategoryListing = async (req, res) => {
  try {
    const { categoryId } = req.body;
    console.log("toggle");
    const category = await Category.findByIdAndUpdate(
      { _id: categoryId },
      [{ $set: { isListed: { $not: "$isListed" } } }],
      { new: true }
    );
    console.log(category);
    if (category) {
      return res.status(200).json(category);
    }
    res.status(404).json("category not found");
  } catch (error) {
    return res.status(500).json("internal server error");
  }
};

const subCatogoryToggle = async (req, res) => {
  try {
    const { subCategoryId } = req.body;
    const subCategory = await SubCategory.findByIdAndUpdate(
      { _id: subCategoryId },
      [{ $set: { isListed: { $not: "$isListed" } } }],
      { new: true }
    );
    console.log(subCategory);
    if (subCategory) {
      return res.status(200).json(subCategory);
    }
    return res.status(404).json("Sub-Category not found");
  } catch (error) {
    console.log("subCatogoryToggle", error);
  }
};

const editsubcategory = async (req, res) => {
  try {
    const {
      _id,
      subCategory,
      subCategoryOffer,
      subCategoryOfferType,
      selectedCategory,
    } = req.body;
    const isExist = await SubCategory.findOne({
      subCategory,
      _id: { $ne: _id },
      categoryId: selectedCategory,
    });
    console.log(isExist);
    if (!isExist) {
      const updatedSubCategory = await SubCategory.findByIdAndUpdate(
        { _id },
        { subCategory, subCategoryOffer, subCategoryOfferType },
        { new: true }
      );
      await editSubCategorySalePrice(updatedSubCategory)
      return res.status(200).json(updatedSubCategory);
    }

    return res.status(404).json("subCategories should be unique");
  } catch (error) {
    console.log("editing subcategory", error);
  }
};

const logout = (req, res) => {
  // console.log(req.session.cookie);
  // req.session.destroy(() => {
  //   return res.status(200).json({ message: "logout successfull" });
  // });
  const token = req.cookies.token;
  console.log(token);

  res.cookie("token", "", {
    // Use the same name as your cookie
    httpOnly: true, // Keep HttpOnly flag
    secure: process.env.NODE_ENV === "production", // Set secure flag for production (HTTPS)
    expires: new Date(0), // Set expiry to the past
    sameSite: "strict", // Optional: to prevent CSRF in certain contexts
  });
  return res.status(200).json({ message: "logout successfull" });
};

module.exports = {
  verifyToken,
  login,
  logout,
  getUserdata,
  blockUser,
  unBlockUser,
  getCategories,
  addCategory,
  editCategory,
  toggleCategoryListing,
  getSubCategories,
  addSubCategory,
  subCatogoryToggle,
  editsubcategory,
};

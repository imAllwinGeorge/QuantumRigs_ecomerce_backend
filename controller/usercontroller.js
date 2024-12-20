const User = require("../model/userSchema");
const bcrypt = require("bcrypt");
const saltRound = parseInt(process.env.SALT_VALUE);
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secretKey = process.env.JWT_SCRET;

const signup = async (req, res) => {
  try {
    const { email, firstName, lastName, phone, userName, password } = req.body;
    console.log(req.body);
    const isExist = await User.findOne({ email });

    if (isExist) {
      return res.status(409).json({
        status: "user already exist",
      });
    } else if (password) {
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
    res.json({
      status: "error",
      message: "something went wrong",
    });
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
        return res.status(200).json({
          user,
        });
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
            res.cookie("token", token, {
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
  res.json("home page redered successfully");
};

const logout = (req, res) => {
  if (req.user) {
    req.logOut(() => {
      console.log(req.user);
      return res.json("logout success");
    });
  } else if (req.session) {
    console.log(req.session);
    req.session.destroy(() => {
      res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      });
      console.log(req.session);
      return res.json("normal user logout success full");
    });
  } else {
    return res.status(500).json("some thing went worng");
  }
};

module.exports = { signup, login, logout, home };

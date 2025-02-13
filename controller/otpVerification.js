const { configDotenv } = require("dotenv");
const User = require("../model/userSchema")
const nodemailer = require('nodemailer');
require('dotenv').config();

const generateOtp = ()=>{
    return Math.floor(100000+Math.random()*900000).toString();
}

const sendVarificationEmail = async(email,otp)=>{
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
              user: process.env.GMAIL_ID,
              pass: process.env.GMAIL_PASSWORD,
            },
          });
          
          const sendMail = (email,otp)=>{
            // async..await is not allowed in global scope, must use a wrapper
          async function main() {
            // send mail with defined transport object
            const info = await transporter.sendMail({
            //   from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
              to: email, // list of receivers
              subject: "Verify Your Email", // Subject line
              text: `Your otp is : ${otp}`, // plain text body
              html: `<b>your otp is : ${otp}</b>`, // html body
            });
          
            console.log("Message sent: %s", info.messageId);
            // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
            return info.accepted.length > 0
          }
          
          main().catch(console.error);
          return main
          }
          sendMail(email,otp);
          return sendMail
    } catch (error) {
        console.log('send verification email',error);
       
    }
}

const signup = async(req,res) =>{
    try {
        const {email,password,phone,firstName,lastName,userName,refferalCode} = req.body

        const isExist = await User.findOne({email:{$regex: new RegExp(`^${email}$`,'i')} })
        if(isExist){
            return res.status(404).json('user already exist')
        }else if(password){
            const otp = generateOtp();

            const emailSend = await sendVarificationEmail(email,otp); 
            if(!emailSend){
                return res.status(404).json('verification email not send')
            }
            console.log(otp)
            req.session.userOtp = otp;
            req.session.userData = {email,password,phone,firstName,lastName,userName,refferalCode}
            res.status(200).json('otp verification needed')
           
        }

    } catch (error) {
        console.log("signup",error)
        return res.status(500).json('something went wrong')
    }
}

const resendOtp = async (req,res)=>{
    try {
        console.log(req.session)
        const {email} = req.session.userData
        if(!email){
            return res.status(404).json('email not found')
        }

        const otp = generateOtp();

        const emailSend = await sendVarificationEmail(email,otp);
        
        if(!emailSend){
            return res.status(400).json('otp cannot be send')
        }
        console.log('resendedotp',otp)
        req.session.userOtp = null;
        req.session.userOtp =  otp

        return res.status(200).json('otp send successfully')
        
    } catch (error) {
        console.log('resendOtp',error)
    }
}

const verifyEmail = async (req,res)=>{
    try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json('please check you email id')
        }
        const otp = generateOtp();

        const sendEmail = await sendVarificationEmail(email,otp);
        if(!sendEmail){
            return res.status(404).json('verification email not sended')
        }
        req.session.userOtp = otp;
        req.session.userData = {email};
        console.log(otp)
        
        return res.status(200).json('otp sended to you email')
    } catch (error) {
        console.log(error.message,"verifyemail otpVerifiction")
    }
}



module.exports = {signup,resendOtp,verifyEmail}
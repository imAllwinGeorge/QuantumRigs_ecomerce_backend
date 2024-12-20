const mongoose = require('mongoose')
const env = require('dotenv').config();


const connectDB = async()=>{
    console.log(process.env.MODEL_URI)
    try {
        await mongoose.connect(process.env.MODEL_URI)
   .then(()=>{
    console.log(`MongoDB connected successfully to ${mongoose.connection.name}`)
   })
   .catch(err=>{
    console.error('MongoDB connection error:', err);
   })
    } catch (error) {
        console.log("mongoose",error)
    }
}

   module.exports = connectDB
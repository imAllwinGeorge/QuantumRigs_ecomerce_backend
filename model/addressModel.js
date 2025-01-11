const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
  },
  pincode: {
    type: Number,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User"
  },
  isActive:{
    type:Boolean,
    default:true,
  }
  
},
{timestamps:true,});

const Address = mongoose.model('address',addressSchema);
module.exports = Address

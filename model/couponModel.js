const mongoose = require("mongoose");
const{Schema} = mongoose;


const couponSchema = new Schema({
    couponCode:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:false,
    },
    couponType:{
        type:String,
        enum:['flat','percentage'],
        required:true,
    },
    couponOffer:{
        type:Number,
        required:true,
    },
    startingDate:{
        type:Date,
        required:true,
    },
    expiryDate:{
        type:Date,
        required:true,
    },
    minPurchaseAmmount:{
        type:Number,
        required: true,
    },
    maxDiscountAmmount:{
        type:Number,
        required:true,
    },
    isActive:{
        type:Boolean,
        default:true
    },
    

},{timestamps:true});
couponSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

const Coupon = mongoose.model('coupon',couponSchema);
module.exports = Coupon
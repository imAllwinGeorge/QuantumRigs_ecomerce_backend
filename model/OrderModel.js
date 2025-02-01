const mongoose = require('mongoose');
const {Schema} = mongoose;


const orderSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    items:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'products'
        },
        variantId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'varients'
        },
        quantity:{
            type:Number,
            required:true
        },
        status: {
            type: String,
            enum: ["Pending", "Shipped", "Delivered", "Cancelled","Returned"],
            default: "Pending", // Default status for each product
        },
        message:{
            type:String,
            required:false,
            default:''
        }


    }],
    shippingAddress:{
        name:String,
        address:String,
        city:String,
        pincode:Number,
        phone:Number
    },
    paymentMethod:{
        type:String,
        enum:["COD","online"],
        required:true,
    },
    paymentStatus:{
        type:String,
        // required:true,
        enum:["pending","paid"],
        default:"pending"
    },
    totalAmount:{
        type:Number,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    couponDetails:{
        couponCode:{
            type:String,
        },
        couponOffer:{
            type:Number,
        },
        couponType:{
            type:String,
            enum:['flat','percentage','']
        },
        minPurchaseAmmount:{
            type:Number,
        },
        maxDiscountAmmount:{
            type:Number,
        }
    },
    discount:{
        type:Number,
        required:true,
    },
    originalAmount:{
        type:Number,
        required:true,
    }
    
})

const Order = mongoose.model('order',orderSchema)
module.exports = Order
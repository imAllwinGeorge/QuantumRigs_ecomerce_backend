const mongoose = require('mongoose')
const {Schema} = mongoose;


const cartSchema = new Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User',
    },
    items:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'Product'
        },
        variantId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:'Variant'
        },
        quantity:{
            type:Number,
            required:true,
            default:1,
            max:5,
        }
    }]
})

const Cart = mongoose.model("cart",cartSchema);
module.exports = Cart;
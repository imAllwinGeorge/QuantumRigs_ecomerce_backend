const mongoose = require('mongoose')
const {Schema} = mongoose;

const categorySchema = new Schema({
    category:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true
    },
    isListed:{
        type:Boolean,
        default:true,
    },
    categoryOffer:{
        type:Number,
        required:true,
    },
    categoryOfferType:{
        type:String,
        enum:["none","flat","percentage"],
        default:'none'
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Category = mongoose.model('category',categorySchema)
module.exports = Category
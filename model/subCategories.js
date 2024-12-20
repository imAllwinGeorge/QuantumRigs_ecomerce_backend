const mongoose = require('mongoose');
const {Schema} = mongoose;


const subCategorySchema = new Schema({
    subCategory:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:false,
    },
    subCategoryOffer:{
        type:Number,
        default:0,
    },
    subCategoryOfferType:{
        type:String,
        default:0,
    },
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Category',
        required:true,
    },
    isListed:{
        type:Boolean,
        default:true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const SubCagetory = mongoose.model('subCategory',subCategorySchema)
module.exports = SubCagetory
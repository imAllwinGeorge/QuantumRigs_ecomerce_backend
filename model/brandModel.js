const mongoose = require('mongoose');
const {Schema} = mongoose;



const brandSchema = new Schema({
    brand:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    isListed:{
        type:Boolean,
        default:true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    updatedAt:{
        type:Date,
        default:Date.now,
    }
})

const Brand = mongoose.model('brand',brandSchema);
module.exports = Brand
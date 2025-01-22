const mongoose =  require('mongoose');
const {Schema} = mongoose;


const wishlistSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    items:[{
        productId:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
        variantId:{
            type:Schema.Types.ObjectId,
            required:true,
            ref:"Variant"
        }
    }]
},{timestamps:true})


const Wishlist =  mongoose.model('wishlist',wishlistSchema);
module.exports = Wishlist;
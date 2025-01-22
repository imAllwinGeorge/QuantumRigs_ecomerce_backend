const mongoose = require('mongoose');
const {Schema} = mongoose;


const walletSchema = new Schema({
    userId:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    transactionDetails:[{
        type:{
            type:String,
            required:true,
            enum:['credit','debit'],
        },
        date:{
            type:Date,
            default:Date.now()
        },
        amount:{
            type:Number,
            required:true,
        },
        description:{
            type:String,
            
        }
    }]

},{timestamps:true})

const Wallet = mongoose.model("wallet",walletSchema);
module.exports = Wallet
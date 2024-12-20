const mongoose = require('mongoose');
const {Schema} = mongoose;


const userSchema = new Schema({
    firstName:{
        type:String,
        required:true,
    },
    lastName:{
        type:String,
        required:true,
    },
    userName:{
        type:String,
        required:false,
    },
    email:{
        type:String,
        required:true,
    },
    phone:{
        type:String,
        required:false,
        unique:false,
        default:null,
    },
    password:{
        type:String,
        required:false,
    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    googleId:{
        type:String,
        default:null,

    }
})

const User = mongoose.model("User",userSchema);
module.exports = User
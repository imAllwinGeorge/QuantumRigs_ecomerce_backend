// const mongoose = require("mongoose");
// const { Schema } = mongoose;

// const varientSchema = new Schema({
//   gpu: {
//     type: String,
//     required: false,
//   },
//   storage: {
//     type: Number,
//     required: false,
//   },
//   ram: {
//     type: Number,
//     required: false,
//   },
//   wattage:{
//     type:String,
//     required:false,
//   },
//   efficiency:{
//     type:String,
//   },
//   size:{
//     type:Number,
//     required:false
//   },
//   speed:{
//     type:String,
//     required:false,
//   },
//   type:{
//     type:String,
//     required:false,
//   },
//   capacity:{
//     type:String,
//     required:false,
//   },
//   chipset:{
//     type:String,
//     required:false,
//   },
//   formfactor:{
//     type:String,
//     required:false,
//   },
//   aircooler:{
//     type:String,
//     required:false,
//   },
//   liquidCooler:{
//     type:String,
//     required:false,
//   },
//   quantity: {
//     type: Number,
//     default: 0,
//   },
//   regularPrice: {
//     type: Number,
//     required: true,
//   },
//   salePrice: {
//     type: Number,
//     required: true,
//   },
//   createdAt: {
//     type: Date,
//     defualt: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
//   productId: {
//     type: mongoose.Schema.Types.ObjectId,
//     required: true,
//   },
// });

// const Varient = mongoose.model("varient", varientSchema);
// module.exports = Varient;



const mongoose = require("mongoose");
const { Schema } = mongoose;

const varientSchema = new Schema({
  // Common fields
  quantity: {
    type: Number,
    default: 0,
  },
  regularPrice: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },

  // Dynamic fields for subcategories
  attributes: {
    type: Map,
    of: Schema.Types.Mixed, // Allows various types (String, Number, etc.)
    required: false,
  },
});

const Variant = mongoose.model("Varient", varientSchema);
module.exports = Variant;

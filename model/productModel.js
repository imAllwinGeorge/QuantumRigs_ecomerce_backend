const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema({
  productName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: false,
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'brand',
  },
  subCategoryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref:'subCategory',
  },
  productOffer: {
    type: Number,
    required: false,
    default: 0,
  },
  productOfferType: {
    type: String,
    enum:["none","flat","percentage"],
    default:"none",
    required: false,
  },
  images: {
    type: [String], // Array of strings to store image paths or URLs
    required: false,
  },
  isListed: {
    type: Boolean,
    default: true,
  },
  activeOfferType:{
    type:String,
    required:true,
    default:'none'
  },
  activeOffer:{
    type:Number,
    required:true,
    default:0
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("product", productSchema);
module.exports = Product;

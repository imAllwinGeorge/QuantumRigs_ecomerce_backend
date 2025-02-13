const mongoose = require("mongoose");
const { applyTimestamps } = require("./walletModel");
const { Schema } = mongoose;

const refferalSchema = Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:"User",
      required: true,
    },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref:"User",
          required: true,
        },
        status: {
          type: String,
          required: true,
          enum: ["pending","success"],
          default:"pending"
        },
        email: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);


const Refferal = mongoose.model("Refferals",refferalSchema)
module.exports = Refferal;
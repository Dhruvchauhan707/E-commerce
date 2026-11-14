const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
      max: 99,
    },
  },
  {
    timestamps: true,
  }
);

cartSchema.index({ user: 1, product: 1 }, { unique: true });

const cartModel = mongoose.model(
  "Cart",
  cartSchema
);

module.exports = cartModel;
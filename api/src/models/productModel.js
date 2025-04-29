import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true },
  ecommerce: { type: String, required: true },
  url: { type: String, required: true },
}, {
  versionKey: false,
  timestamps: true,
});

const Product = mongoose.model("Product", productSchema);

export default Product;
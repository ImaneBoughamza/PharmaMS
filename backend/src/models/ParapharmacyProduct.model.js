import mongoose from "mongoose";

const parapharmacyProductSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    brand: {
      type: String,
      trim: true,
      maxlength: [100, "Brand name cannot exceed 100 characters"],
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["cosmetics", "supplements", "medical-device", "hygiene", "other"],
        message: "Invalid category",
      },
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    salePrice: {
      type: Number,
      required: [true, "Sale price is required"],
      min: [0, "Sale price cannot be negative"],
    },
    stockQty: {
      type: Number,
      default: 0,
      min: [0, "Stock quantity cannot be negative"],
    },
    minStockLevel: {
      type: Number,
      default: 0,
      min: [0, "Minimum stock level cannot be negative"],
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

parapharmacyProductSchema.index({ pharmacyId: 1, name: 1 });
parapharmacyProductSchema.index({ pharmacyId: 1, isActive: 1 });
parapharmacyProductSchema.index({ pharmacyId: 1, category: 1 });
parapharmacyProductSchema.index(
  { name: "text", brand: "text" },
  { weights: { name: 10, brand: 5 } }
);

export const ParapharmacyProduct = mongoose.model("ParapharmacyProduct", parapharmacyProductSchema);
export default ParapharmacyProduct;

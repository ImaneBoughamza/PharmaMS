import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    genericName: {
      type: String,
      trim: true,
      maxlength: [200, "Generic name cannot exceed 200 characters"],
      default: "",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["prescription", "non-prescription", "regulated"],
        message: "Category must be prescription, non-prescription, or regulated",
      },
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      enum: {
        values: ["tablet", "capsule", "ml", "g", "unit", "other"],
        message: "Invalid unit",
      },
      default: "unit",
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

medicineSchema.index({ pharmacyId: 1, name: 1 });
medicineSchema.index({ pharmacyId: 1, isActive: 1 });
medicineSchema.index({ pharmacyId: 1, category: 1 });
medicineSchema.index(
  { name: "text", genericName: "text" },
  { weights: { name: 10, genericName: 5 } }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;

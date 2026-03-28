import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    genericName: { type: String, trim: true, default: "" },
    category: { type: String, required: true, trim: true },
    unit: { type: String, default: "tablet" },
    minStockLevel: { type: Number, default: 10 },
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);

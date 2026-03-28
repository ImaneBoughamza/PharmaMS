import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    batchNumber: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    initialQty: { type: Number, required: true },
    remainingQty: { type: Number, required: true },
    deliveryId: { type: mongoose.Schema.Types.ObjectId, ref: "Delivery", default: null },
  },
  { timestamps: true }
);

export const Batch = mongoose.model("Batch", batchSchema);

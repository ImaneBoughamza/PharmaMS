import mongoose from "mongoose";

const parapharmacyBatchSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParapharmacyProduct",
      required: [true, "Parapharmacy product reference is required"],
    },
    deliveryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
      default: null,
    },
    batchNumber: {
      type: String,
      required: [true, "Batch number is required"],
      trim: true,
      maxlength: [100, "Batch number cannot exceed 100 characters"],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
      index: true,
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
    initialQty: {
      type: Number,
      required: [true, "Initial quantity is required"],
      min: [1, "Initial quantity must be at least 1"],
    },
    remainingQty: {
      type: Number,
      required: true,
      min: [0, "Remaining quantity cannot be negative"],
    },
    source: {
      type: String,
      enum: ["delivery", "order", "stock-adjustment", "legacy"],
      default: "delivery",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

parapharmacyBatchSchema.index({ pharmacyId: 1, productId: 1, batchNumber: 1 }, { unique: true });
parapharmacyBatchSchema.index({ pharmacyId: 1, productId: 1, expiryDate: 1, receivedAt: 1 });
parapharmacyBatchSchema.index({ pharmacyId: 1, productId: 1, remainingQty: 1 });

export const ParapharmacyBatch = mongoose.model("ParapharmacyBatch", parapharmacyBatchSchema);
export default ParapharmacyBatch;

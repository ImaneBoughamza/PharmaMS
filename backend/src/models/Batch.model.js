import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: [true, "Medicine reference is required"],
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
      required: [true, "Expiry date is required"],
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

batchSchema.index({ pharmacyId: 1, medicineId: 1, batchNumber: 1 }, { unique: true });
batchSchema.index({ pharmacyId: 1, medicineId: 1, expiryDate: 1 });
batchSchema.index({ pharmacyId: 1, expiryDate: 1, isActive: 1 });
batchSchema.index({ pharmacyId: 1, remainingQty: 1 });

export const Batch = mongoose.model("Batch", batchSchema);
export default Batch;

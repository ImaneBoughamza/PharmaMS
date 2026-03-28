import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    qty: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    cashierId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pharmacistId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    items: [saleItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["cash", "card"], default: "cash" },
    approvalStatus: {
      type: String,
      enum: ["not_required", "pending", "approved", "rejected"],
      default: "not_required",
    },
  },
  { timestamps: true }
);

export const Sale = mongoose.model("Sale", saleSchema);

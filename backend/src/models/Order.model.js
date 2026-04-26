// TODO [PROVISIONAL-1]: scope to be confirmed with supervisor after next meeting
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    orderedQty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    status: {
      type: String,
      enum: ["ordered", "received", "cancelled"],
      default: "ordered",
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", orderSchema);

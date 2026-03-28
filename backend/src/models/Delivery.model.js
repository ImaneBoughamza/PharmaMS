import mongoose from "mongoose";

const deliveryItemSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    batchNumber: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true },
    salePrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    supplierId: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invoiceNumber: { type: String, trim: true, default: "" },
    items: [deliveryItemSchema],
    deliveryDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Delivery = mongoose.model("Delivery", deliverySchema);

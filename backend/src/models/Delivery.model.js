import mongoose from "mongoose";

const medicineDeliveryItemSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    batchNumber: { type: String, required: true, trim: true },
    expiryDate: { type: Date, required: true },
    receivedQty: { type: Number, required: true, min: [1, "Received quantity must be at least 1"] },
    quantity: { type: Number, min: [1, "Received quantity must be at least 1"] },
    purchasePrice: { type: Number, required: true, min: [0, "Price cannot be negative"] },
    salePrice: { type: Number, required: true, min: [0, "Price cannot be negative"] },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", default: null },
  },
  { _id: false }
);

medicineDeliveryItemSchema.pre("validate", function normalizeLegacyQuantity(next) {
  if (!this.receivedQty && this.quantity) this.receivedQty = this.quantity;
  if (!this.quantity && this.receivedQty) this.quantity = this.receivedQty;
  next();
});

const parapharmacyDeliveryItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "ParapharmacyProduct", required: true },
    receivedQty: { type: Number, required: true, min: [1, "Received quantity must be at least 1"] },
    purchasePrice: { type: Number, required: true, min: [0, "Price cannot be negative"] },
    batchNumber: { type: String, trim: true, default: "" },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: "ParapharmacyBatch", default: null },
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: [true, "Supplier is required"],
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Received by user is required"],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    invoiceNumber: {
      type: String,
      trim: true,
      default: "",
    },
    medicineItems: {
      type: [medicineDeliveryItemSchema],
      default: [],
    },
    parapharmacyItems: {
      type: [parapharmacyDeliveryItemSchema],
      default: [],
    },
    items: {
      type: [medicineDeliveryItemSchema],
      default: [],
    },
    deliveryDate: {
      type: Date,
      required: [true, "Delivery date is required"],
      default: Date.now,
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

deliverySchema.pre("validate", function normalizeLegacyItems(next) {
  if (this.medicineItems.length === 0 && this.items.length > 0) {
    this.medicineItems = this.items;
  }
  if (this.items.length === 0 && this.medicineItems.length > 0) {
    this.items = this.medicineItems;
  }
  if (this.medicineItems.length === 0 && this.parapharmacyItems.length === 0) {
    next(new Error("Delivery must contain at least one item"));
    return;
  }
  next();
});

deliverySchema.index({ pharmacyId: 1, supplierId: 1 });
deliverySchema.index({ pharmacyId: 1, deliveryDate: -1 });

export const Delivery = mongoose.model("Delivery", deliverySchema);
export default Delivery;

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },
    orderedQty: {
      type: Number,
      required: true,
      min: [1, "Ordered quantity must be at least 1"],
    },
  },
  { _id: false }
);

orderItemSchema.pre("validate", function normalizeLegacyMedicineId(next) {
  if (!this.productId && this.medicineId) this.productId = this.medicineId;
  if (!this.medicineId && this.productId) this.medicineId = this.productId;
  next();
});

const orderSchema = new mongoose.Schema(
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    productType: {
      type: String,
      required: [true, "Product type is required"],
      enum: {
        values: ["medicine", "parapharmacy"],
        message: "Product type must be medicine or parapharmacy",
      },
      default: "medicine",
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },
    status: {
      type: String,
      enum: ["ordered", "received", "cancelled"],
      default: "ordered",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
  },
  { timestamps: true }
);

orderSchema.index({ pharmacyId: 1, status: 1 });
orderSchema.index({ pharmacyId: 1, supplierId: 1 });
orderSchema.index({ pharmacyId: 1, createdAt: -1 });

export const Order = mongoose.model("Order", orderSchema);
export default Order;

import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },
    medicineName: {
      type: String,
      default: "",
    },
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Unit price cannot be negative"],
    },
  },
  { _id: false }
);

const parapharmacyItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParapharmacyProduct",
      required: true,
    },
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, "Unit price cannot be negative"],
    },
    allocations: {
      type: [
        {
          batchId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ParapharmacyBatch",
            required: true,
          },
          qty: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
          },
          unitPrice: {
            type: Number,
            required: true,
            min: [0, "Unit price cannot be negative"],
          },
        },
      ],
      default: [],
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    receiptNumber: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    medicineSubtotal: { type: Number, default: 0 },
    parapharmacySubtotal: { type: Number, default: 0 },
  },
  { _id: false }
);

const saleSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Cashier is required"],
    },
    pharmacistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    items: {
      type: [saleItemSchema],
      default: [],
    },
    parapharmacyItems: {
      type: [parapharmacyItemSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: true,
      min: [0, "Total amount cannot be negative"],
    },
    paymentMethod: {
      type: String,
      required: [true, "Payment method is required"],
      enum: {
        values: ["cash", "card"],
        message: "Payment method must be cash or card",
      },
    },
    approvalStatus: {
      type: String,
      enum: ["approved", "pending", "rejected", "voided", "not_required"],
      default: "approved",
    },
    voidReason: {
      type: String,
      maxlength: [500, "Void reason cannot exceed 500 characters"],
      default: null,
    },
    voidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    voidedAt: {
      type: Date,
      default: null,
    },
    invoice: {
      type: invoiceSchema,
      required: true,
    },
  },
  { timestamps: true }
);

saleSchema.pre("validate", function ensureItems(next) {
  if (this.items.length === 0 && this.parapharmacyItems.length === 0) {
    next(new Error("Sale must contain at least one item"));
    return;
  }
  next();
});

saleSchema.index({ pharmacyId: 1, cashierId: 1 });
saleSchema.index({ pharmacyId: 1, createdAt: -1 });
saleSchema.index({ pharmacyId: 1, approvalStatus: 1 });
saleSchema.index({ "invoice.receiptNumber": 1 }, { unique: true });

export const Sale = mongoose.model("Sale", saleSchema);
export default Sale;

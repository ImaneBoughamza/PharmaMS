import mongoose from "mongoose";

const reservationItemSchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      required: true,
      enum: ["medicine", "parapharmacy"],
      default: "medicine",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      default: null,
    },
    qty: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },
  },
  { _id: false }
);

const reservationStockLockSchema = new mongoose.Schema(
  {
    productType: {
      type: String,
      required: true,
      enum: ["medicine", "parapharmacy"],
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    batchId: {
      type: mongoose.Schema.Types.ObjectId,
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
  { _id: false }
);

reservationItemSchema.pre("validate", function normalizeLegacyMedicineItem(next) {
  if (!this.productId && this.medicineId) {
    this.productId = this.medicineId;
    this.productType = "medicine";
  }
  if (!this.medicineId && this.productType === "medicine" && this.productId) {
    this.medicineId = this.productId;
  }
  next();
});

const reservationSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [2, "Customer name must be at least 2 characters"],
      maxlength: [100, "Customer name cannot exceed 100 characters"],
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    items: {
      type: [reservationItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Reservation must contain at least one item",
      },
    },
    stockLocks: {
      type: [reservationStockLockSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "ready", "expired", "cancelled", "completed"],
      default: "pending",
    },
    confirmationCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: {
        values: ["online", "pay-on-pickup", "cash", "card", "insurance"],
        message: "Payment method must be online or pay-on-pickup",
      },
      default: "pay-on-pickup",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    pickupDate: {
      type: Date,
      default: null,
    },
    prescriptionImage: {
      type: String,
      default: null,
    },
    prescriptionImageName: {
      type: String,
      maxlength: [200, "Prescription image name cannot exceed 200 characters"],
      default: null,
    },
    prescriptionImageType: {
      type: String,
      enum: ["image/jpeg", "image/png", null],
      default: null,
    },
    prescriptionRequired: {
      type: Boolean,
      default: false,
    },
    prescriptionVerified: {
      type: Boolean,
      default: false,
    },
    prescriptionVerifiedAt: {
      type: Date,
      default: null,
    },
    prescriptionVerifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    rejectionReason: {
      type: String,
      maxlength: [500, "Rejection reason cannot exceed 500 characters"],
      default: null,
    },
    expiresAt: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    confirmedAt: { type: Date, default: null },
    readyAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    expiredAt: { type: Date, default: null },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

reservationSchema.index({ pharmacyId: 1, status: 1 });
reservationSchema.index({ pharmacyId: 1, expiresAt: 1, status: 1 });
reservationSchema.index({ pharmacyId: 1, createdAt: -1 });

export const Reservation = mongoose.model("Reservation", reservationSchema);
export default Reservation;

import mongoose from "mongoose";

const reservationItemSchema = new mongoose.Schema(
  {
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
    qty: { type: Number, required: true },
  },
  { _id: false }
);

const reservationSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, required: true, trim: true },
    items: [reservationItemSchema],
    status: {
      type: String,
      enum: ["pending", "confirmed", "ready", "completed", "expired", "cancelled"],
      default: "pending",
    },
    confirmationCode: { type: String, required: true, unique: true },
    notes: { type: String, default: "" },
    pickupDate: { type: Date, default: null },
    paymentMethod: { type: String, enum: ["cash", "card", "insurance"], default: "cash" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Reservation = mongoose.model("Reservation", reservationSchema);

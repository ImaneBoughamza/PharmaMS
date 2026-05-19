import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: "",
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    notes: {
      type: String,
      default: "",
    },
    insuranceType: {
      type: String,
      default: "",
    },
    insuranceNumber: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdFrom: {
      type: String,
      enum: ["reservation", "consultation"],
      required: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ pharmacyId: 1, email: 1 }, { unique: true });

export const Customer = mongoose.model("Customer", customerSchema);
export default Customer;

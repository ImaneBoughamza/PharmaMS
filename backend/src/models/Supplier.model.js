import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Supplier name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    type: {
      type: String,
      required: [true, "Supplier type is required"],
      enum: {
        values: ["grossiste", "laboratoire", "parapharmacy-distributor", "other"],
        message: "Invalid supplier type",
      },
      default: "other",
    },
    contact: {
      type: String,
      required: [true, "Contact person is required"],
      trim: true,
      maxlength: [100, "Contact name cannot exceed 100 characters"],
    },
    contactPerson: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
      default: "",
    },
    notes: {
      type: String,
      maxlength: [500, "Notes cannot exceed 500 characters"],
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

supplierSchema.pre("validate", function normalizeContact(next) {
  if (!this.contact && this.contactPerson) this.contact = this.contactPerson;
  if (!this.contactPerson && this.contact) this.contactPerson = this.contact;
  next();
});

supplierSchema.index({ pharmacyId: 1, name: 1 }, { unique: true });
supplierSchema.index({ pharmacyId: 1, type: 1 });
supplierSchema.index({ pharmacyId: 1, isActive: 1 });

export const Supplier = mongoose.model("Supplier", supplierSchema);
export default Supplier;

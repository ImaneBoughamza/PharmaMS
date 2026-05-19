import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    entity: {
      type: String,
      required: [true, "Entity is required"],
      trim: true,
      enum: [
        "users",
        "medicines",
        "parapharmacyProducts",
        "batches",
        "orders",
        "sales",
        "reservations",
        "suppliers",
        "deliveries",
        "auditLogs",
        "system",
        "customers",
        "User",
        "Medicine",
        "Batch",
        "Order",
        "Sale",
        "Reservation",
        "Supplier",
        "Delivery",
      ],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ pharmacyId: 1, createdAt: -1 });
auditLogSchema.index({ pharmacyId: 1, userId: 1 });
auditLogSchema.index({ pharmacyId: 1, action: 1 });
auditLogSchema.index({ pharmacyId: 1, entity: 1 });
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 157680000 });

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;

import mongoose from "mongoose";

const aiConsultationSchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },
    prescriptionImage: {
      type: String,
      default: null,
    },
    patientNotes: {
      type: String,
      default: "",
    },
    extractedMedicines: [
      {
        name: String,
        manual: {
          type: Boolean,
          default: false,
        },
      },
    ],
    suggestions: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ParapharmacyProduct",
        },
        name: String,
        brand: String,
        category: String,
        salePrice: Number,
        stockQty: Number,
        rationale: String,
      },
    ],
    savedImage: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

aiConsultationSchema.index({ pharmacyId: 1, staffId: 1, createdAt: -1 });

export const AiConsultation = mongoose.model("AiConsultation", aiConsultationSchema);
export default AiConsultation;

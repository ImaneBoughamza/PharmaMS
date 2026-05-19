import AiConsultation from "../models/AiConsultation.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import ApiError from "../utils/ApiError.js";
import { findOrCreateCustomer } from "../utils/customerHelper.js";
import aiService from "../services/ai.service.js";
import { asyncController, pagination, paginatedResponse, buildDateFilter } from "./controllerUtils.js";

const csvField = (value = "") => {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const scan = asyncController(async (req, res) => {
  const extractedMedicines = await aiService.extractPrescriptionMedicines(
    req.body.base64Image,
    req.body.mediaType,
    req.body.patientNotes
  );

  req.auditLog = {
    action: "AI_PRESCRIPTION_SCANNED",
    entity: "system",
    entityId: null,
    payload: { extractedMedicinesCount: extractedMedicines.length },
  };

  res.status(200).json({
    success: true,
    data: { extractedMedicines },
  });
});

export const recommend = asyncController(async (req, res) => {
  const suggestions = await aiService.generateComplementaryRecommendations(
    req.body.medicines,
    req.user.pharmacyId,
    req.body.patientNotes
  );

  res.status(200).json({
    success: true,
    data: { suggestions },
  });
});

export const save = asyncController(async (req, res) => {
  let customerId = null;
  if (req.body.patientName && req.body.patientEmail) {
    const customer = await findOrCreateCustomer(
      req.user.pharmacyId,
      {
        fullName: req.body.patientName,
        phone: req.body.patientPhone || "",
        email: req.body.patientEmail,
      },
      "consultation"
    );
    customerId = customer._id;
  }

  const productIds = req.body.suggestions.map((suggestion) => suggestion.productId);
  const products = productIds.length
    ? await ParapharmacyProduct.find({
        _id: { $in: productIds },
        pharmacyId: req.user.pharmacyId,
        isActive: true,
      }).select("_id name brand category salePrice stockQty")
    : [];
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  const consultation = await AiConsultation.create({
    pharmacyId: req.user.pharmacyId,
    staffId: req.user.userId,
    customerId,
    prescriptionImage: req.body.saveImage ? req.body.prescriptionImage : null,
    patientNotes: req.body.patientNotes,
    extractedMedicines: req.body.extractedMedicines,
    suggestions: req.body.suggestions
      .map((suggestion) => {
        const product = productMap.get(suggestion.productId);
        if (!product) return null;
        return {
          productId: product._id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          salePrice: product.salePrice,
          stockQty: product.stockQty,
          rationale: suggestion.rationale,
        };
      })
      .filter(Boolean),
    savedImage: req.body.saveImage,
  });

  req.auditLog = {
    action: "AI_CONSULTATION",
    entity: "system",
    entityId: consultation._id,
    payload: {
      extractedMedicinesCount: consultation.extractedMedicines.length,
      suggestionsCount: consultation.suggestions.length,
    },
  };

  res.status(200).json({
    success: true,
    data: consultation,
  });
});

export const list = asyncController(async (req, res) => {
  const { page, limit, skip } = pagination(req.query);
  const filter = { pharmacyId: req.user.pharmacyId };
  if (req.user.role === "assistant") filter.staffId = req.user.userId;
  const date = buildDateFilter(req.query);
  if (date) filter.createdAt = date;
  if (req.query.medicine) filter["extractedMedicines.name"] = new RegExp(req.query.medicine, "i");
  if (req.query.customerId) filter.customerId = req.query.customerId;

  if (req.query.format === "csv") {
    const rows = await AiConsultation.find(filter)
      .select("-prescriptionImage")
      .populate("staffId", "fullName role")
      .sort({ createdAt: -1 })
      .limit(10000)
      .lean();

    const csv = [
      "Date,Staff,Prescribed Medicines,Recommendations Count,Recommended Products,Clinical Rationale",
      ...rows.map((entry) => [
        entry.createdAt?.toISOString?.() || entry.createdAt,
        entry.staffId?.fullName || "",
        (entry.extractedMedicines || []).map((medicine) => medicine.name).join(", "),
        (entry.suggestions || []).length,
        (entry.suggestions || []).map((suggestion) => suggestion.name).join(", "),
        (entry.suggestions || []).map((suggestion) => suggestion.rationale).join(" | "),
      ].map(csvField).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="PharmaOS_AIConsultations_${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.send(csv);
  }

  const [consultations, total] = await Promise.all([
    AiConsultation.find(filter).select("-prescriptionImage").populate("staffId", "fullName role").sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    AiConsultation.countDocuments(filter),
  ]);
  paginatedResponse(res, consultations, total, page, limit);
});

export const getById = asyncController(async (req, res) => {
  const consultation = await AiConsultation.findOne({
    _id: req.params.id,
    pharmacyId: req.user.pharmacyId,
  }).populate("staffId", "fullName role").lean();
  if (!consultation) throw ApiError.notFound("AI consultation not found");
  if (req.user.role === "assistant" && String(consultation.staffId._id || consultation.staffId) !== String(req.user.userId)) {
    throw ApiError.forbidden("Access denied");
  }
  res.status(200).json({ success: true, data: consultation });
});

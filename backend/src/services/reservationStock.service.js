import Batch from "../models/Batch.model.js";
import ParapharmacyBatch from "../models/ParapharmacyBatch.model.js";
import ParapharmacyProduct from "../models/ParapharmacyProduct.model.js";
import {
  allocateMedicineMultiple,
  allocateParapharmacyMultiple,
} from "./fifo.service.js";

export const lockReservationStock = async (items, pharmacyId, session) => {
  const medicineItems = items
    .filter((item) => item.productType === "medicine")
    .map((item) => ({ medicineId: item.productId, qty: item.qty }));

  const parapharmacyItems = items
    .filter((item) => item.productType === "parapharmacy")
    .map((item) => ({ productId: item.productId, qty: item.qty }));

  const medicineAllocations = medicineItems.length
    ? await allocateMedicineMultiple(medicineItems, pharmacyId, session)
    : [];

  const parapharmacyAllocations = parapharmacyItems.length
    ? await allocateParapharmacyMultiple(parapharmacyItems, pharmacyId, session)
    : [];

  return [
    ...medicineAllocations.map((allocation) => ({
      productType: "medicine",
      productId: allocation.medicineId,
      batchId: allocation.batchId,
      qty: allocation.qty,
      unitPrice: allocation.unitPrice,
    })),
    ...parapharmacyAllocations.flatMap((item) =>
      item.allocations.map((allocation) => ({
        productType: "parapharmacy",
        productId: item.productId,
        batchId: allocation.batchId,
        qty: allocation.qty,
        unitPrice: allocation.unitPrice,
      }))
    ),
  ];
};

export const releaseReservationStock = async (reservation, pharmacyId, session) => {
  const locks = reservation.stockLocks || [];
  if (locks.length === 0) return;

  for (const lock of locks) {
    if (lock.productType === "medicine") {
      await Batch.updateOne(
        { _id: lock.batchId, pharmacyId },
        { $inc: { remainingQty: lock.qty } },
        { session }
      );
      continue;
    }

    await ParapharmacyBatch.updateOne(
      { _id: lock.batchId, pharmacyId },
      { $inc: { remainingQty: lock.qty } },
      { session }
    );
    await ParapharmacyProduct.updateOne(
      { _id: lock.productId, pharmacyId },
      { $inc: { stockQty: lock.qty } },
      { session }
    );
  }

  reservation.stockLocks = [];
};

export const buildSaleItemsFromReservationLocks = (reservation) => {
  const medicineItems = [];
  const parapharmacyByProduct = new Map();

  for (const lock of reservation.stockLocks || []) {
    if (lock.productType === "medicine") {
      medicineItems.push({
        batchId: lock.batchId,
        medicineId: lock.productId,
        qty: lock.qty,
        unitPrice: lock.unitPrice,
      });
      continue;
    }

    const key = lock.productId.toString();
    const existing = parapharmacyByProduct.get(key) || {
      productId: lock.productId,
      qty: 0,
      unitPrice: lock.unitPrice,
      allocations: [],
    };
    existing.qty += lock.qty;
    existing.allocations.push({
      batchId: lock.batchId,
      qty: lock.qty,
      unitPrice: lock.unitPrice,
    });
    parapharmacyByProduct.set(key, existing);
  }

  return {
    medicineItems,
    parapharmacyItems: [...parapharmacyByProduct.values()],
  };
};

export default {
  lockReservationStock,
  releaseReservationStock,
  buildSaleItemsFromReservationLocks,
};

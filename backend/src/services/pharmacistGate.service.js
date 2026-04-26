/**
 * Pharmacist approval gate for regulated-medicine sales.
 *
 * Flow:
 *  1. sale is created with approvalStatus = "pending"
 *  2. APPROVAL_REQUIRED event is emitted to the "pharmacists" room
 *  3. Pharmacist calls PATCH /api/sales/:id/approve { approved: true/false }
 *  4. resolveApproval() settles the promise for the pending sale
 *
 * The POST /api/sales handler awaits requireApproval() with a 120-second timeout.
 * If the pharmacist does not respond in time, the sale is auto-rejected.
 */

import { ApiError } from "../utils/ApiError.js";

const TIMEOUT_MS = 120_000;

let _io = null;
const pending = new Map(); // saleId → { resolve, reject, timer }

export function setIO(io) {
  _io = io;
}

export function requireApproval(saleId) {
  return new Promise((resolve, reject) => {
    if (!_io) {
      return reject(new ApiError(500, "Socket.io not initialized"));
    }

    const timer = setTimeout(() => {
      pending.delete(saleId);
      reject(new ApiError(408, "Pharmacist approval timed out after 120 seconds"));
    }, TIMEOUT_MS);

    pending.set(String(saleId), { resolve, reject, timer });

    _io.to("pharmacists").emit("APPROVAL_REQUIRED", { saleId: String(saleId) });
  });
}

export function resolveApproval(saleId, approved, pharmacistId) {
  const entry = pending.get(String(saleId));
  if (!entry) return false; // already resolved or unknown

  clearTimeout(entry.timer);
  pending.delete(String(saleId));

  if (approved) {
    entry.resolve(pharmacistId);
  } else {
    entry.reject(new ApiError(403, "Sale rejected by pharmacist"));
  }
  return true;
}

export function hasPending(saleId) {
  return pending.has(String(saleId));
}

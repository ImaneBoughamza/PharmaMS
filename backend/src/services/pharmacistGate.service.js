import ApiError from "../utils/ApiError.js";
import logger from "../utils/logger.js";

const GATE_TIMEOUT_MS = 120_000;

let socketServer = null;
const legacyPendingApprovals = new Map();
const pendingGateRequests = new Map();

export const setIO = (io) => {
  socketServer = io;
};

/**
 * Request pharmacist approval for a regulated medicine sale.
 *
 * @param {object} io
 * @param {string} pharmacyId
 * @param {Array<{ medicineName: string, qty: number }>} items
 * @param {string} requestedBy
 * @param {object|null} prescriptionImage
 * @returns {Promise<string>}
 */
export const requestApproval = (
  io,
  pharmacyId,
  items,
  requestedBy,
  prescriptionImage = null,
) => {
  return new Promise((resolve, reject) => {
    if (!io) {
      return reject(ApiError.internal("Socket.io not initialized"));
    }

    const requestId = `gate_${pharmacyId}_${Date.now()}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + GATE_TIMEOUT_MS);

    const timeout = setTimeout(() => {
      pendingGateRequests.delete(requestId);
      logger.warn(
        `Gate timeout - request ${requestId} - no pharmacist responded`,
      );
      reject(
        ApiError.badRequest(
          "Sale cancelled - no pharmacist responded within 120 seconds",
        ),
      );
    }, GATE_TIMEOUT_MS);

    pendingGateRequests.set(requestId, {
      requestId,
      pharmacyId: String(pharmacyId),
      requestedBy: String(requestedBy),
      items,
      prescriptionImage,
      createdAt: now,
      expiresAt,
      timeout,
      resolve,
      reject,
    });

    io.to(`pharmacists:${pharmacyId}`).emit("GATE_REQUIRED", {
      requestId,
      requestedBy,
      items,
      prescriptionImage,
      expiresIn: 120,
    });

    logger.info(`Pharmacist gate triggered - request ${requestId}`);
  });
};

export const listPendingRequests = (pharmacyId) => {
  const now = Date.now();
  return [...pendingGateRequests.values()]
    .filter((request) => request.pharmacyId === String(pharmacyId))
    .filter((request) => new Date(request.expiresAt).getTime() > now)
    .map(({ timeout, resolve, reject, ...request }) => request)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

/**
 * Submit pharmacist approval or rejection.
 *
 * @param {object} io
 * @param {string} requestId
 * @param {boolean} approved
 * @param {string} pharmacistId
 * @param {string|null} reason
 */
export const submitResponse = (
  io,
  requestId,
  approved,
  pharmacistId,
  reason = null,
) => {
  const request = pendingGateRequests.get(String(requestId));
  if (!request) {
    logger.warn(`Gate response ignored - request ${requestId} was not pending`);
    return false;
  }

  clearTimeout(request.timeout);
  pendingGateRequests.delete(String(requestId));

  if (approved) {
    request.resolve(String(pharmacistId));
  } else {
    request.reject(
      ApiError.badRequest(
        `Sale rejected by pharmacist${reason ? `: ${reason}` : ""}`,
      ),
    );
  }

  io?.to(`cashier:${request.requestedBy}`).emit("GATE_RESPONSE", {
    approved,
    requestId,
    pharmacistId: String(pharmacistId),
    reason,
  });

  logger.info(
    `Gate response submitted - ${approved ? "APPROVED" : "REJECTED"} - ` +
      `request ${requestId} by pharmacist ${pharmacistId}`,
  );

  return true;
};

// Compatibility helpers for the existing sale routes. New controllers should use
// requestApproval/submitResponse above.
export const requireApproval = (saleId) => {
  return new Promise((resolve, reject) => {
    if (!socketServer) {
      return reject(ApiError.internal("Socket.io not initialized"));
    }

    const timer = setTimeout(() => {
      legacyPendingApprovals.delete(String(saleId));
      reject(
        ApiError.badRequest(
          "Sale cancelled - no pharmacist responded within 120 seconds",
        ),
      );
    }, GATE_TIMEOUT_MS);

    legacyPendingApprovals.set(String(saleId), { resolve, reject, timer });
    socketServer
      .to("pharmacists")
      .emit("APPROVAL_REQUIRED", { saleId: String(saleId) });
  });
};

export const resolveApproval = (
  saleId,
  approved,
  pharmacistId,
  reason = null,
) => {
  const entry = legacyPendingApprovals.get(String(saleId));
  if (!entry) return false;

  clearTimeout(entry.timer);
  legacyPendingApprovals.delete(String(saleId));

  if (approved) {
    entry.resolve(pharmacistId);
  } else {
    entry.reject(
      ApiError.badRequest(
        `Sale rejected by pharmacist${reason ? `: ${reason}` : ""}`,
      ),
    );
  }

  return true;
};

export const hasPending = (saleId) =>
  legacyPendingApprovals.has(String(saleId));

export default {
  setIO,
  requestApproval,
  listPendingRequests,
  submitResponse,
  requireApproval,
  resolveApproval,
  hasPending,
};

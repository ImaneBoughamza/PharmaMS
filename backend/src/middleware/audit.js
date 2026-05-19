import { AuditLog } from "../models/AuditLog.model.js";
import logger from "../utils/logger.js";

const ACTION_ALIASES = {
  ADD_BATCH: "BATCH_REGISTERED",
  CREATE_DELIVERY: "DELIVERY_RECORDED",
  CREATE_MEDICINE: "MEDICINE_REGISTERED",
  CREATE_ORDER: "ORDER_CREATED",
  CREATE_SUPPLIER: "SUPPLIER_REGISTERED",
  CREATE_USER: "USER_CREATED",
  STOCK_ADJUST: "STOCK_ADJUSTED",
  STOCK_RETURN: "BATCH_RETURNED",
  UPDATE_MEDICINE: "MEDICINE_UPDATED",
  UPDATE_ORDER: "ORDER_STATUS_UPDATED",
  UPDATE_RESERVATION: "RESERVATION_CONFIRMED",
  UPDATE_SUPPLIER: "SUPPLIER_UPDATED",
  UPDATE_USER: "USER_MODIFIED",
};

function normalizeAction(action) {
  return ACTION_ALIASES[action] ?? action;
}

function writeAuditLog(req) {
  if (!req.auditLog || !req.user) return;

  AuditLog.create({
    pharmacyId: req.user.pharmacyId,
    userId: req.user.userId ?? req.user.sub,
    action: normalizeAction(req.auditLog.action),
    entity: req.auditLog.entity,
    entityId: req.auditLog.entityId,
    payload: req.auditLog.payload || {},
  }).catch((auditError) => {
    logger.error(`Audit log write failed: ${auditError.message}`);
  });
}

const audit = (req, res, next) => {
  const originalJson = res.json.bind(res);

  res.json = function jsonWithAudit(data) {
    res.json = originalJson;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      writeAuditLog(req);
    }

    return originalJson(data);
  };

  next();
};

export function auditLog({ action, entity, getId }) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function jsonWithAuditLogFactory(data) {
      res.json = originalJson;

      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        req.auditLog = {
          action,
          entity,
          entityId: getId ? getId(req, data) : undefined,
          payload: req.method !== "GET" ? req.body : {},
        };
        writeAuditLog(req);
      }

      return originalJson(data);
    };

    next();
  };
}

export default audit;

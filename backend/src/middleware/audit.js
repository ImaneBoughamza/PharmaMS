import { AuditLog } from "../models/AuditLog.model.js";

/**
 * Factory: auditLog({ action, entity, getId })
 * getId(req) → entityId string
 */
export function auditLog({ action, entity, getId }) {
  return async (req, res, next) => {
    // Run the route handler first, then log on success
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      if (res.statusCode < 400 && req.user) {
        AuditLog.create({
          userId: req.user.sub,
          action,
          entity,
          entityId: getId ? getId(req, body) : undefined,
          payload: req.method !== "GET" ? req.body : undefined,
        }).catch(() => {}); // fire-and-forget, never block response
      }
      return originalJson(body);
    };
    next();
  };
}

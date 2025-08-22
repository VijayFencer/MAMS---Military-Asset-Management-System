import { AuditLog } from "../models/AuditLog.js";

const redact = (obj) => {
  const clone = JSON.parse(JSON.stringify(obj || {}));
  if (clone.password) clone.password = "***";
  return clone;
};

export const auditMiddleware = {
  requestLogger: async (req, _res, next) => {
    req._startTime = Date.now();
    next();
  },
  
  logAction: async (req, action, entity, entityId, details = {}) => {
    try {
      await AuditLog.create({
        userId: req.user?.userId || null,
        action,
        resource: entity,
        resourceId: entityId || null,
        payload: redact(details),
        ip: req.ip,
        userAgent: req.headers["user-agent"] || "",
      });
    } catch (e) {
      console.error("Audit log error:", e.message);
    }
  },
};
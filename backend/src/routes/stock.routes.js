import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/stock.controller.js";
import * as validators from "../validators/stock.validators.js";

const router = express.Router();

router.get("/alerts", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.alerts);
router.get("/expiry/alerts", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.expiryAlerts);
router.patch("/expiry/threshold", auth, allow(ROLES.PHARMACIST), validate(validators.expiryThresholdSchema), audit, controller.configureExpiryThreshold);
router.patch("/adjust", auth, allow(ROLES.PHARMACIST), validate(validators.adjustStockSchema), audit, controller.adjust);
router.post("/return", auth, allow(ROLES.PHARMACIST), validate(validators.returnBatchSchema), audit, controller.returnBatch);

export default router;

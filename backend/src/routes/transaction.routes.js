import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/transaction.controller.js";
import { closeDaySchema } from "../validators/transaction.validators.js";

const router = express.Router();

router.get("/", auth, allow(ROLES.PHARMACIST), controller.list);
router.get("/summary", auth, allow(ROLES.PHARMACIST), controller.summary);
router.get("/reconcile", auth, allow(ROLES.PHARMACIST), controller.getReconciliation);
router.post("/reconcile", auth, allow(ROLES.PHARMACIST), validate(closeDaySchema), audit, controller.closeDay);

export default router;

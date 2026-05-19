import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/ai.controller.js";
import {
  recommendSchema,
  saveConsultationSchema,
  scanPrescriptionSchema,
} from "../validators/ai.validators.js";

const router = express.Router();

router.post("/scan", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), validate(scanPrescriptionSchema), audit, controller.scan);
router.post("/recommendations", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), validate(recommendSchema), controller.recommend);
router.post("/consultations", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), validate(saveConsultationSchema), audit, controller.save);
router.get("/consultations", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.list);
router.get("/consultations/:id", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.getById);

export default router;

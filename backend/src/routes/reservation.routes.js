import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/reservation.controller.js";
import * as validators from "../validators/reservation.validators.js";

const router = express.Router();
const allStaff = [ROLES.PHARMACIST, ROLES.ASSISTANT, ROLES.CASHIER];

router.get("/products", controller.products);
router.post("/", validate(validators.submitReservationSchema), controller.submit);
router.get("/track/:code", controller.trackByCode);
router.patch("/track/:code", validate(validators.updateByCodeSchema), controller.updateByCode);
router.delete("/track/:code", controller.cancelByCode);

router.get("/", auth, allow(...allStaff), controller.list);
router.get("/demand", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.demand);
router.get("/:id", auth, allow(...allStaff), controller.getById);
router.patch("/:id/confirm", auth, allow(ROLES.PHARMACIST), audit, controller.confirm);
router.patch("/:id/reject", auth, allow(ROLES.PHARMACIST), validate(validators.rejectReservationSchema), audit, controller.reject);
router.patch("/:id/ready", auth, allow(...allStaff), audit, controller.markReady);
router.patch("/:id/cancel", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), audit, controller.cancel);
router.patch("/:id/verify-prescription", auth, allow(...allStaff), validate(validators.verifyPrescriptionSchema), audit, controller.verifyPrescription);
router.post("/:id/convert", auth, allow(...allStaff), controller.convert);

export default router;

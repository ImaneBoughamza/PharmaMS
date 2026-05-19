import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/sale.controller.js";
import * as validators from "../validators/sale.validators.js";

const router = express.Router();
const allStaff = [ROLES.PHARMACIST, ROLES.ASSISTANT, ROLES.CASHIER];

router.get("/", auth, allow(...allStaff), controller.list);
router.get("/approval-requests", auth, allow(ROLES.PHARMACIST), controller.listApprovalRequests);
router.post(
  "/approval-requests/:requestId/respond",
  auth,
  allow(ROLES.PHARMACIST),
  validate(validators.approvalResponseSchema),
  audit,
  controller.respondApprovalRequest
);
router.get("/:id", auth, allow(...allStaff), controller.getById);
router.post("/", auth, allow(...allStaff), validate(validators.createSaleSchema), audit, controller.create);
router.patch("/:id/void", auth, allow(ROLES.PHARMACIST), validate(validators.voidSaleSchema), audit, controller.voidSale);

export default router;

import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/parapharmacy.controller.js";
import * as validators from "../validators/parapharmacy.validators.js";

const router = express.Router();
const allStaff = [ROLES.PHARMACIST, ROLES.ASSISTANT, ROLES.CASHIER];

router.get("/", auth, allow(...allStaff), controller.list);
router.get("/:id", auth, allow(...allStaff), controller.getById);
router.post("/", auth, allow(ROLES.PHARMACIST), validate(validators.createParapharmacySchema), audit, controller.create);
router.patch("/:id", auth, allow(ROLES.PHARMACIST), validate(validators.updateParapharmacySchema), audit, controller.update);
router.patch("/:id/deactivate", auth, allow(ROLES.PHARMACIST), audit, controller.deactivate);
router.patch("/:id/reactivate", auth, allow(ROLES.PHARMACIST), audit, controller.reactivate);

export default router;

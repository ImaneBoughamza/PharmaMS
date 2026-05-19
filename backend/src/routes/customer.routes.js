import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/customer.controller.js";
import { updateCustomerSchema } from "../validators/customer.validators.js";

const router = express.Router();

router.get("/", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.list);
router.get("/:id", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.getById);
router.patch("/:id", auth, allow(ROLES.PHARMACIST), validate(updateCustomerSchema), audit, controller.update);
router.patch("/:id/deactivate", auth, allow(ROLES.PHARMACIST), audit, controller.deactivate);
router.patch("/:id/reactivate", auth, allow(ROLES.PHARMACIST), audit, controller.reactivate);

export default router;

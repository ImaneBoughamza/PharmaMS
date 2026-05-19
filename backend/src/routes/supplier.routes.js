import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/supplier.controller.js";
import * as validators from "../validators/supplier.validators.js";

const router = express.Router();

router.get("/", auth, allow(ROLES.PHARMACIST), controller.list);
router.post("/", auth, allow(ROLES.PHARMACIST), validate(validators.createSupplierSchema), audit, controller.create);
router.get("/:id", auth, allow(ROLES.PHARMACIST), controller.getById);
router.patch("/:id", auth, allow(ROLES.PHARMACIST), validate(validators.updateSupplierSchema), audit, controller.update);
router.patch("/:id/deactivate", auth, allow(ROLES.PHARMACIST), audit, controller.deactivate);
router.patch("/:id/reactivate", auth, allow(ROLES.PHARMACIST), audit, controller.reactivate);

export default router;

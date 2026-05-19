import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/user.controller.js";
import * as validators from "../validators/user.validators.js";

const router = express.Router();

router.get("/", auth, allow(ROLES.PHARMACIST), controller.list);
router.post("/", auth, allow(ROLES.PHARMACIST), validate(validators.createUserSchema), audit, controller.create);
router.patch("/:id", auth, allow(ROLES.PHARMACIST), validate(validators.updateUserSchema), audit, controller.update);
router.patch("/:id/reset-password", auth, allow(ROLES.PHARMACIST), validate(validators.resetPasswordSchema), audit, controller.resetPassword);
router.patch("/:id/deactivate", auth, allow(ROLES.PHARMACIST), audit, controller.deactivate);
router.patch("/:id/reactivate", auth, allow(ROLES.PHARMACIST), audit, controller.reactivate);

export default router;

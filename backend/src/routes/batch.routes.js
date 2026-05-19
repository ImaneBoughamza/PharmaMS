import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/batch.controller.js";
import { createBatchSchema } from "../validators/batch.validators.js";

const router = express.Router();

router.post("/", auth, allow(ROLES.PHARMACIST), validate(createBatchSchema), audit, controller.create);
router.get("/", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.list);
router.get("/:id/history", auth, allow(ROLES.PHARMACIST, ROLES.ASSISTANT), controller.history);
router.patch("/:id/deactivate", auth, allow(ROLES.PHARMACIST), audit, controller.deactivate);

export default router;

import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/order.controller.js";
import * as validators from "../validators/order.validators.js";

const router = express.Router();

router.get("/", auth, allow(ROLES.PHARMACIST), controller.list);
router.post("/", auth, allow(ROLES.PHARMACIST), validate(validators.createOrderSchema), audit, controller.create);
router.patch("/:id", auth, allow(ROLES.PHARMACIST), validate(validators.updateOrderSchema), audit, controller.update);

export default router;

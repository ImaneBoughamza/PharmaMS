import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/report.controller.js";

const router = express.Router();

router.get("/sales", auth, allow(ROLES.PHARMACIST), controller.salesReport);
router.get("/stock", auth, allow(ROLES.PHARMACIST), controller.stockReport);

export default router;

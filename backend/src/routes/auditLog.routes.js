import express from "express";
import auth from "../middleware/auth.js";
import { allow } from "../middleware/rbac.js";
import { ROLES } from "../constants/roles.js";
import * as controller from "../controllers/auditLog.controller.js";

const router = express.Router();

router.get("/", auth, allow(ROLES.PHARMACIST), controller.list);

export default router;

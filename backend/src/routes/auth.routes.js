import express from "express";
import auth from "../middleware/auth.js";
import validate from "../middleware/validate.js";
import audit from "../middleware/audit.js";
import * as controller from "../controllers/auth.controller.js";
import * as validators from "../validators/auth.validators.js";

const router = express.Router();

router.post("/register", validate(validators.registerSchema), controller.register);
router.post("/login", validate(validators.loginSchema), controller.login);
router.post("/refresh", validate(validators.refreshSchema), controller.refresh);
router.post("/logout", auth, audit, controller.logout);
router.get("/me", auth, controller.me);
router.patch("/change-password", auth, validate(validators.changePasswordSchema), controller.changePassword);

export default router;

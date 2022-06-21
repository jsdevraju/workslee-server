import { Router } from "express";
import {
  login,
  logout,
  register,
  verifyUserAccount,
} from "../controllers/authCtrl.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/email-verify", isAuthenticated, verifyUserAccount);

export default router;

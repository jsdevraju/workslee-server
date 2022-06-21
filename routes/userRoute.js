import { Router } from "express";
import {
  sendResetCode,
  getUserInfo,
  updatePassword,
  updateUserProfile,
  verifyCode,
  changePassword,
  createReview,
} from "../controllers/userCtrl.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.put("/update/me", isAuthenticated, updateUserProfile);
router.get("/profile", isAuthenticated, getUserInfo);
router.put("/update/password", isAuthenticated, updatePassword);
router.post("/add/review", isAuthenticated, createReview);
router.post("/forgot/password", sendResetCode);
router.post("/verify/password/code", verifyCode);
router.post("/change-password", changePassword);

export default router;

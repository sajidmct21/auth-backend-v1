import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  changePassword,
  forgotPassword,
  login,
  logout,
  registerUser,
  verification,
  verifyOTP,
} from "../controller/userController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", asyncHandler(registerUser));
router.post("/verify", asyncHandler(verification));
router.post("/login", asyncHandler(login));
router.post("/logout", isAuthenticated, asyncHandler(logout));
router.post("/forgot-password", forgotPassword);
router.post('/verify-otp/', verifyOTP)
router.post('change-password/',changePassword)

export default router;

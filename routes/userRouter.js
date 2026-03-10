import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  login,
  logout,
  registerUser,
  verification,
} from "../controller/userController.js";
import { isAuthenticated } from "../middleware/isAuthenticated.js";

const router = express.Router();

router.post("/register", asyncHandler(registerUser));
router.post("/verify", asyncHandler(verification));
router.post("/login", asyncHandler(login));
router.post('/logout',isAuthenticated, asyncHandler(logout))

export default router;

import express from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { registerUser } from "../controller/userController.js";

const router = express.Router();

router.post("/register", asyncHandler(registerUser));

export default router;

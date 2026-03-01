import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/genrateToken.js";
import { verifyMail } from "../emailVerify/verifyMail.js";

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username) {
      throw new ApiError(400, "Username is required");
    }
    if (!email) {
      throw new ApiError(400, "Email is required");
    }
    if (!password) {
      throw new ApiError(400, "Password is required");
    }
    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "User is already exist");
    }
    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);
    // create new user
    const newUser = await User.create({
      username,
      email,
      password: hashPassword,
    });
    const token = generateToken(newUser._id)
    // verifyMail(token, email);
    newUser.token = token;
    // Save user to database
    await newUser.save();

    // send response
    return res
      .status(200)
      .json(new ApiResponse(200, "User is registered successfully", newUser));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

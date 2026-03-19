import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "dotenv";
import { sendEMail } from "../email/sendEMail.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Session } from "../models/sessionModel.js";

env.config();

export const registerUser = async (req, res) => {
  try {
    const { username, password, email } = req.body;
    if (!username) {
      throw new ApiError(400, "Username is required");
    }
    if (!email) {
      throw new ApiError(400, "Email is required");
    }
    if (!password) {
      throw new ApiError(400, "Password is required");
    }

    const existingUserWithEmail = await User.findOne({ email });
    if (existingUserWithEmail) {
      throw new ApiError(400, "User already exist with same email");
    }
    const existingUserWithUsername = await User.findOne({ username });
    if (existingUserWithUsername) {
      throw new ApiError(400, "User already exist with same username");
    }
    const hashPassword = bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      username,
      password: hashPassword,
    });
    await newUser.save();
    const verificationToken = jwt.sign(
      { id: newUser._id },
      process.env.SECRET_KEY,
      { expiresIn: "10m" },
    );

    sendEMail(verificationToken, email);
    newUser.token = verificationToken;
    await newUser.save();
    newUser.password = undefined;
    return res
      .status(201)
      .json(
        new ApiResponse(201, "New user is registered successfully", newUser),
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized user");
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(400, "Token has expired");
      }
      throw new ApiError(400, "Invalid Token");
    }
    let id = decoded.id;
    let user = await User.findById(id);
    if (!user) {
      throw new ApiError(401, "User is not found");
    }
    if (user.token !== token) {
      throw new ApiError(401, "Invalid verification token");
    }
    user.isVarified = true;
    user.token = null;
    await user.save();
    return res
      .status(200)
      .json(new ApiResponse(200, "User is verified successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      throw new ApiError(400, "Email is required");
    }
    if (!password) {
      throw new ApiError(400, "Password is required");
    }
    let user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User is not found");
    }
    let isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new ApiError(400, "Password is incorrect");
    }
    if (user.isVarified !== true) {
      throw new ApiError(400, "Please verify your account first");
    }
    let existingSession = await Session.findOne({ userId: user._id });
    if (existingSession) {
      await Session.deleteOne({ userId: user._id });
    }
    let session = new Session({ userId: user._id });
    await session.save();
    let accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });
    let refreshToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "30d",
    });
    user.isLoggedIn = true;
    await user.save();
    return res.status(200).json(
      new ApiResponse(200, "Login Successfully", {
        accessToken,
        refreshToken,
      }),
    );
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
};

export const logoutUser = async (req, res) => {
  try {
    const id = req.id;
    if (!id) {
      throw new ApiError(400, "User already logout");
    }
    let user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    await Session.deleteMany({ userId: id });
    user.isLoggedIn = false;
    await user.save();
    return res.status(200).json(new ApiResponse(200, "Logout Successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(500, error.message);
  }
};

export const forgetPassword = async (req, res)=>{
  
}
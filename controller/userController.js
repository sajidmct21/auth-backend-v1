import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/genrateToken.js";
import { sendEMail } from "../email/sendEMail.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Session } from "../models/sessionModel.js";

dotenv.config();

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

    // Generate token
    const token = generateToken(newUser._id);
    // send varification email
    sendEMail(token, email);

    /* Store token in the user. This token is compared with the token which comes (generate)
     from the email varification button when user click on the verify email button in email*/

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

export const verification = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Authorization token is missing or invalid");
    }
    const token = authHeader.split(" ")[1];

    // verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(400, "The registration token has expired");
      }
      throw new ApiError(400, "Token verification Failed");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ApiError(404, "User is not found");
    }
    user.isVarified = true;
    user.token = null;
    await user.save();
    res.status(200).json(new ApiResponse(200, "Email verified successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }

  // try {
  //   console.log("Verification is called");
  //   const authHeader = req.headers.authorization;
  //   if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //     return res.status(401).json({
  //       success: false,
  //       message: "Authorization token is missing or invalid",
  //     });
  //   }

  //   const token = authHeader.split(" ")[1];

  //   let decoded;
  //   try {
  //     decoded = jwt.verify(token, process.env.SECRET_KEY);
  //   } catch (err) {
  //     if (err.name === "TokenExpiredError") {
  //       return res.status(400).json({
  //         success: false,
  //         message: "The registration token has expired",
  //       });
  //     }
  //     return res.status(400).json({
  //       success: false,
  //       message: "Token verification failed",
  //       error:err.message
  //     });
  //   }
  //   const user = await User.findById(decoded.id);
  //   if (!user) {
  //     return res.status(404).json({
  //       success: false,
  //       message: "User not found",
  //     });
  //   }

  //   user.token = null;
  //   user.isVarified = true;
  //   await user.save();

  //   return res.status(200).json({
  //     success: true,
  //     message: "Email verified successfully",
  //   });
  // } catch (error) {
  //   return res.status(500).json({
  //     success: false,
  //     message: error.message,
  //   });
  // }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "Unauthorized User");
    }
    const passwordCheck = bcrypt.compare(password, user.password);
    if (!passwordCheck) {
      throw new ApiError(401, "Password is incorrect");
    }
    if (user.isVarified != true) {
      throw new ApiError(403, "Verify your account than login");
    }
    const existingSession = await Session.findOne({ userId: user._id });
    if (existingSession) {
      await Session.deleteOne({ userId: user._id });
    }

    await Session.create({ userId: user._id });

    const accessToken = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10d",
    });
    const refreshToken = generateToken(user._id);
    user.isLoggedIn = true;
    await user.save();
    return res.status(200).json(
      new ApiResponse(200, "Login Successfully", {
        accessToken,
        refreshToken,
      }),
    );
  } catch (err) {
    throw new ApiError(400, err.message);
  }
};

export const logout = async (req, res) => {
  try {
    const { userId } = req;
    await Session.deleteMany({ userId });
    await User.findByIdAndUpdate(userId, { isLoggedIn: false });
    return res.status(200).json(new ApiResponse(200, "You are logout"));
  } catch (err) {
    throw new ApiError(400, err.message);
  }
};

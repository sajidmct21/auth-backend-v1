import { User } from "../models/userModel";
import { ApiError } from "../utils/apiError";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(400, "Unauthorized User");
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new ApiError(400, "Token has expired");
      } else {
        throw new ApiError(400, "Token verification failed");
      }
    }
    let id = decoded.id;
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    req.userId = id;
    req.user = user;
    next()
  } catch (error) {
    next(error);
  }
};

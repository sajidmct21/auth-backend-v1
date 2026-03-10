import { User } from "../models/userModel.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unathuorized User");
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(400, "The token has expired");
      }
      throw new ApiError(400, "Token verification Failed");
    }
    const { id } = decoded;
    const user = await User.findById(id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    req.user = user;
    req.userId = id;
    next();
  } catch (err) {
    next(err);
  }
};

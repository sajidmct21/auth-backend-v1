import { User } from "../models/userModel";
import { ApiError } from "../utils/apiError";
import jwt from "jsonwebtoken";

export const isAuthenticated2 = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(401, "Unauthorized User");
    }
    const token = authHeader.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        throw new ApiError(400, "Token has Expired");
      }
      throw new ApiError(400, "Invalid Token");
    }
    const { id } = decoded;
    const user = await User.findById(id);
    if(!user){
        throw new ApiError(404,'User not found')
    }
    req.user = user;
    req.userId = id;
    next();
  } catch (err) {
    next(err);
  }
};

import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  if (!process.env.SECRET_KEY) {
    throw new Error("SECRET_KEY is not defined");
  }

  return jwt.sign(
    { id },
    process.env.SECRET_KEY,
    { expiresIn: "10m" }
  );
};
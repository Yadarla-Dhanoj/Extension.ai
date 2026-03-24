import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function makeToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, plan: user.plan },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

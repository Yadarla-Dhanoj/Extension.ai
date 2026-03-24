import bcrypt from "bcryptjs";
import express from "express";
import { isDbConnected } from "../config/db.js";
import { User } from "../models/User.js";
import { memoryStore } from "../services/inMemoryStore.js";
import { makeToken } from "../utils/token.js";

export const authRouter = express.Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required" });
    }
    const exists = isDbConnected()
      ? await User.findOne({ email })
      : await memoryStore.findUserByEmail(email);
    if (exists) return res.status(409).json({ message: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = isDbConnected()
      ? await User.create({ name, email, passwordHash })
      : await memoryStore.createUser({ name, email, passwordHash });
    const token = makeToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan }
    });
  } catch (err) {
    return next(err);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = isDbConnected()
      ? await User.findOne({ email })
      : await memoryStore.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = makeToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, plan: user.plan }
    });
  } catch (err) {
    return next(err);
  }
});

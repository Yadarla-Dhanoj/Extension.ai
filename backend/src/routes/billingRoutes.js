import express from "express";
import { isDbConnected } from "../config/db.js";
import { User } from "../models/User.js";
import { memoryStore } from "../services/inMemoryStore.js";
import { createCheckoutSession } from "../services/billingService.js";

export const billingRouter = express.Router();

billingRouter.post("/checkout", async (req, res, next) => {
  try {
    const user = isDbConnected()
      ? await User.findById(req.user.id)
      : await memoryStore.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const session = await createCheckoutSession({
      userEmail: user.email,
      userId: user._id.toString()
    });
    if (!session.configured) {
      return res.status(200).json({
        configured: false,
        message: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_PRO_MONTHLY."
      });
    }
    return res.json({ configured: true, checkoutUrl: session.checkoutUrl });
  } catch (err) {
    return next(err);
  }
});

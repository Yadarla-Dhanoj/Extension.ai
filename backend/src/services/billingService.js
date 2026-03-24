import Stripe from "stripe";
import { env } from "../config/env.js";

let stripeClient = null;

function getStripe() {
  if (!env.stripeSecretKey) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }
  return stripeClient;
}

export async function createCheckoutSession({ userEmail, userId }) {
  const stripe = getStripe();
  if (!stripe) {
    return { configured: false, checkoutUrl: null };
  }
  if (!env.stripePriceProMonthly) {
    throw new Error("Missing STRIPE_PRICE_PRO_MONTHLY");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    success_url: `${env.appUrl}/dashboard?billing=success`,
    cancel_url: `${env.appUrl}/dashboard?billing=cancel`,
    customer_email: userEmail,
    line_items: [{ price: env.stripePriceProMonthly, quantity: 1 }],
    metadata: { userId }
  });

  return { configured: true, checkoutUrl: session.url };
}

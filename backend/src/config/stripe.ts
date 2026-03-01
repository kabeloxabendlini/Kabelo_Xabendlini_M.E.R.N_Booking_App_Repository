import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is missing");
}

// Optional: debug to make sure key is loaded
console.log("Stripe key loaded:", process.env.STRIPE_SECRET_KEY?.slice(0,4) + "****");

// Initialize and export Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});
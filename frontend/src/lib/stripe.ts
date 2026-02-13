// src/lib/stripe.ts
import { loadStripe } from "@stripe/stripe-js";

// Make sure you have this in frontend/.env
// VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error(
    "Stripe publishable key is missing! Add VITE_STRIPE_PUBLISHABLE_KEY in your .env"
  );
}

// Export a single stripePromise to use across the app
export const stripePromise = loadStripe(publishableKey);

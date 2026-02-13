// src/stripe.ts
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe with the publishable key
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// backend/routes/payment.js
import express from 'express';
import { stripe } from '../stripe.js';
import { stripe } from "../config/stripe";

router.post("/create-payment-intent", async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: 1000,
    currency: "usd",
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

const router = express.Router();

router.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: req.body.items,
      mode: 'payment',
      success_url: 'http://localhost:5174/success',
      cancel_url: 'http://localhost:5174/cancel',
    });

    res.json({ url: session.url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Stripe checkout session failed' });
  }
});

export default router;

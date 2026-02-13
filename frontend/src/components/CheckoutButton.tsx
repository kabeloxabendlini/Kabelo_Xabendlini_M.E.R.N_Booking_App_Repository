// Example React button click
import React from 'react';
import { stripePromise } from '../stripe';

interface CheckoutButtonProps {
  items: any[]; // your products or bookings
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ items }) => {
  const handleCheckout = async () => {
    const stripe = await stripePromise;

    const response = await fetch('http://localhost:7000/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });

    const data = await response.json();
    if (stripe && data.url) {
      window.location.href = data.url; // redirect to Stripe checkout
    }
  };

  return <button onClick={handleCheckout}>Checkout</button>;
};

export default CheckoutButton;

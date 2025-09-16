import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

// Only initialize Stripe if the publishable key is available
export const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

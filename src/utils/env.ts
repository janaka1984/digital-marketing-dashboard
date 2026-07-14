export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Campaign Optimizer';
export const STRIPE_CHECKOUT_ENABLED =
  import.meta.env.VITE_ENABLE_STRIPE_CHECKOUT === 'true';

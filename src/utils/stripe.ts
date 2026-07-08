/**
 * Node Modules
 */
import Stripe from "stripe";

/**
 * Local Modules
 */
import config from "../config";

/**
 * Initialize Stripe Client
 */
const stripe = new Stripe(config.STRIPE.SECRET_KEY);

/**
 * Exporting Stripe Client
 */
export { stripe };

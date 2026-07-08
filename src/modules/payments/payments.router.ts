/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { paymentsController } from "./payments.controller";

/**
 * Payments Router
 */
const paymentsRouter = Router();

/**
 * Create Stripe Checkout Session
 */
paymentsRouter.post(
    "/checkout-session",
    checkAuth(Role.TENANT),
    paymentsController.createCheckoutSession,
);

/**
 * Get Tenant Payment History
 */
paymentsRouter.get(
    "/history",
    checkAuth(Role.TENANT),
    paymentsController.getPaymentHistory,
);

/**
 * Get Payment Details By Id
 */
paymentsRouter.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.TENANT, Role.LANDLORD),
    paymentsController.getPaymentById,
);

/**
 * Stripe Webhook Handler (Public Endpoint)
 */
paymentsRouter.post("/webhook", paymentsController.handleWebhook);

/**
 * Export Payments Router
 */
export default paymentsRouter;

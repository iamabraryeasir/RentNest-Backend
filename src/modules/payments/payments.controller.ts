/**
 * Node Modules
 */
import { NextFunction, Request, Response } from "express";
import status from "http-status";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentsService } from "./payments.service";

/**
 * Create Stripe Checkout Session
 */
const createCheckoutSession = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const tenantId = req.user!.id;
        const tenantEmail = req.user!.email;

        const result = await paymentsService.createCheckoutSession(
            payload,
            tenantId,
            tenantEmail,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Stripe checkout session created successfully",
            data: result,
        });
    },
);

/**
 * Get Tenant Payment History
 */
const getPaymentHistory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const tenantId = req.user!.id;
        const query = req.query;

        const result = await paymentsService.getPaymentHistory(query, tenantId);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Payment history retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    },
);

/**
 * Get Payment Details By Id
 */
const getPaymentById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = req.user as { id: string; role: Role };

        const result = await paymentsService.getPaymentById(id as string, user);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Payment details retrieved successfully",
            data: result,
        });
    },
);

/**
 * Handle Stripe Webhook Events
 */
const handleWebhook = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const signature = req.headers["stripe-signature"] as string;

        if (!signature) {
            throw new AppError(
                status.BAD_REQUEST,
                "Stripe signature is required.",
            );
        }

        // Pass raw request body Buffer and signature header to service
        const result = await paymentsService.handleWebhook(
            req.body as Buffer,
            signature,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Stripe webhook event processed successfully",
            data: result,
        });
    },
);

/**
 * Get All Payments (Admin)
 */
const getAllPayments = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;

        const result = await paymentsService.getAllPayments(query);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "All payments retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    },
);

/**
 * Export Payments Controller
 */
export const paymentsController = {
    createCheckoutSession,
    getPaymentHistory,
    getPaymentById,
    handleWebhook,
    getAllPayments,
};

/**
 * Node Modules
 */
import status from "http-status";
import Stripe from "stripe";

/**
 * Local Modules
 */
import {
    PaymentStatus,
    RentalRequestStatus,
    Role,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../utils/prisma";
import { stripe } from "../../utils/stripe";
import { validateString } from "../../utils/validation";
import { ICreateCheckoutSessionPayload } from "./payments.interface";
import { IQueryOptions, parseQuery } from "../../utils/queryHelpers";

/**
 * Create Stripe Checkout Session Service
 */
async function createCheckoutSession(
    payload: ICreateCheckoutSessionPayload,
    tenantId: string,
    tenantEmail: string,
) {
    const rentalRequestId = validateString(
        payload.rentalRequestId,
        "Rental Request ID",
    )!;

    // Fetch rental request
    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id: rentalRequestId },
        include: { property: true },
    });

    if (!rentalRequest) {
        throw new AppError(status.NOT_FOUND, "Rental request not found.");
    }

    // Verify status is APPROVED
    if (rentalRequest.status !== RentalRequestStatus.APPROVED) {
        throw new AppError(
            status.BAD_REQUEST,
            "You can only complete payments for approved rental requests.",
        );
    }

    // Verify ownership
    if (rentalRequest.tenantId !== tenantId) {
        throw new AppError(
            status.FORBIDDEN,
            "You are not authorized to complete payment for this rental request.",
        );
    }

    // Check existing payment status
    const existingPayment = await prisma.payment.findUnique({
        where: { rentalRequestId },
    });

    if (existingPayment) {
        if (existingPayment.status === PaymentStatus.PAID) {
            throw new AppError(
                status.BAD_REQUEST,
                "This rental request has already been paid.",
            );
        }

        // Clean up previous pending payment record to prevent duplicate key failures
        await prisma.payment.delete({
            where: { rentalRequestId },
        });
    }

    // Calculate amount in cents for Stripe API
    const amountInCents = Math.round(
        Number(rentalRequest.property.rentAmount) * 100,
    );

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: rentalRequest.property.title,
                        description: `Rent payment for property at ${rentalRequest.property.address}, ${rentalRequest.property.city}`,
                    },
                    unit_amount: amountInCents,
                },
                quantity: 1,
            },
        ],
        success_url: `${config.FRONTEND_URL}/payments/success`,
        cancel_url: `${config.FRONTEND_URL}/payments/cancel`,
        customer_email: tenantEmail,
        metadata: {
            rentalRequestId,
            tenantId,
        },
    });

    // Create PENDING Payment in database
    await prisma.payment.create({
        data: {
            rentalRequestId,
            tenantId,
            amount: rentalRequest.property.rentAmount,
            stripeSessionId: session.id,
            status: PaymentStatus.PENDING,
        },
    });

    return {
        id: session.id,
        url: session.url,
    };
}

/**
 * Get Tenant Payment History Service
 */
async function getPaymentHistory(query: IQueryOptions, tenantId: string) {
    const { page, limit, skip, sortBy, sortOrder, filters } = parseQuery(
        query,
        ["status"],
        ["createdAt", "amount"],
    );

    const whereConditions: Record<string, any> = {
        ...filters,
        tenantId,
    };

    const payments = await prisma.payment.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            rentalRequest: {
                include: {
                    property: true,
                },
            },
        },
    });

    const total = await prisma.payment.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: payments,
    };
}

/**
 * Get Payment Details By Id Service
 */
async function getPaymentById(
    paymentId: string,
    user: { id: string; role: Role },
) {
    const validatedId = validateString(paymentId, "Payment ID")!;

    const payment = await prisma.payment.findUnique({
        where: { id: validatedId },
        include: {
            rentalRequest: {
                include: {
                    property: {
                        include: {
                            landlord: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true,
                                },
                            },
                        },
                    },
                },
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!payment) {
        throw new AppError(status.NOT_FOUND, "Payment details not found.");
    }

    // Role-based authorization check
    const isTenantOwner =
        user.role === Role.TENANT && payment.tenantId === user.id;
    const isLandlordOwner =
        user.role === Role.LANDLORD &&
        payment.rentalRequest.property.landlordId === user.id;
    const isAdmin = user.role === Role.ADMIN;

    if (!isTenantOwner && !isLandlordOwner && !isAdmin) {
        throw new AppError(
            status.FORBIDDEN,
            "You are not authorized to view these payment details.",
        );
    }

    return payment;
}

/**
 * Handle Stripe Webhook Event Service
 */
async function handleWebhook(rawBody: Buffer, signature: string) {
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            config.STRIPE.WEBHOOK_SECRET,
        );
    } catch (err: any) {
        throw new AppError(
            status.BAD_REQUEST,
            `Webhook signature verification failed: ${err.message}`,
        );
    }

    // Process completed checkout session event
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const stripeSessionId = session.id;
        const stripePaymentId = session.payment_intent as string;

        // Find the payment record
        const payment = await prisma.payment.findUnique({
            where: { stripeSessionId },
        });

        if (payment && payment.status === PaymentStatus.PENDING) {
            // Apply transactional database updates
            await prisma.$transaction(async (tx) => {
                // Update payment to PAID
                await tx.payment.update({
                    where: { id: payment.id },
                    data: {
                        status: PaymentStatus.PAID,
                        stripePaymentId,
                    },
                });

                // Update rental request status to ACTIVE
                await tx.rentalRequest.update({
                    where: { id: payment.rentalRequestId },
                    data: {
                        status: RentalRequestStatus.ACTIVE,
                    },
                });
            });
        }
    }

    return { processed: true };
}

/**
 * Export Payments Service
 */
export const paymentsService = {
    createCheckoutSession,
    getPaymentHistory,
    getPaymentById,
    handleWebhook,
};

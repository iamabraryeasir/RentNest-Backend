/**
 * Node Modules
 */
import status from "http-status";

/**
 * Local Modules
 */
import { RentalRequestStatus, Role } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../utils/prisma";
import { IQueryOptions, parseQuery } from "../../utils/queryHelpers";
import { validateInteger, validateString } from "../../utils/validation";
import {
    ICreateReviewPayload,
    IUpdateReviewPayload,
} from "./reviews.interface";

/**
 * Create New Review Service
 */
async function createReview(payload: ICreateReviewPayload, tenantId: string) {
    const propertyId = validateString(payload.propertyId, "Property ID")!;
    const rating = validateInteger(payload.rating, "Rating", { min: 1 })!;
    const comment = validateString(payload.comment, "Comment", false);

    if (rating > 5) {
        throw new AppError(
            status.BAD_REQUEST,
            "Rating must be between 1 and 5.",
        );
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });
    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found.");
    }

    // Verify tenant has rented the property (has approved, active, or completed rental request)
    const rentalRequest = await prisma.rentalRequest.findFirst({
        where: {
            tenantId,
            propertyId,
            status: {
                in: [
                    RentalRequestStatus.APPROVED,
                    RentalRequestStatus.ACTIVE,
                    RentalRequestStatus.COMPLETED,
                ],
            },
        },
    });

    if (!rentalRequest) {
        throw new AppError(
            status.BAD_REQUEST,
            "You can only review properties you have successfully rented or had approved requests for.",
        );
    }

    // Check if tenant already reviewed this property
    const existingReview = await prisma.review.findFirst({
        where: {
            tenantId,
            propertyId,
        },
    });

    if (existingReview) {
        throw new AppError(
            status.CONFLICT,
            "You have already reviewed this property. You can edit your existing review instead.",
        );
    }

    // Create review
    const review = await prisma.review.create({
        data: {
            propertyId,
            tenantId,
            rating,
            comment: comment ? comment.trim() : null,
        },
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return review;
}

/**
 * Get All Reviews Of a Property Service
 */
async function getAllReviewsForProperty(query: IQueryOptions) {
    const { page, limit, skip, sortBy, sortOrder, filters } = parseQuery(
        query,
        ["propertyId"],
        ["createdAt", "rating"],
    );

    if (!filters.propertyId) {
        throw new AppError(status.BAD_REQUEST, "Property ID is required.");
    }

    const reviews = await prisma.review.findMany({
        where: {
            propertyId: filters.propertyId,
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    const total = await prisma.review.count({
        where: {
            propertyId: filters.propertyId,
        },
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: reviews,
    };
}

/**
 * Update Review Service
 */
async function updateReview(
    id: string,
    payload: IUpdateReviewPayload,
    tenantId: string,
) {
    const review = await prisma.review.findUnique({
        where: { id },
    });

    if (!review) {
        throw new AppError(status.NOT_FOUND, "Review not found.");
    }

    // Verify authorship: only the tenant who added the review can edit it
    if (review.tenantId !== tenantId) {
        throw new AppError(
            status.FORBIDDEN,
            "You are not authorized to update this review.",
        );
    }

    const keys = Object.keys(payload);
    if (keys.length === 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "At least one field to update must be provided.",
        );
    }

    const allowedKeys = ["rating", "comment"];
    const invalidKeys = keys.filter((key) => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            `Updating field(s) '${invalidKeys.join(", ")}' is not allowed.`,
        );
    }

    const updateData: Record<string, any> = {};

    if (payload.rating !== undefined) {
        const rating = validateInteger(payload.rating, "Rating", { min: 1 })!;
        if (rating > 5) {
            throw new AppError(
                status.BAD_REQUEST,
                "Rating must be between 1 and 5.",
            );
        }
        updateData.rating = rating;
    }

    if (payload.comment !== undefined) {
        const comment = validateString(payload.comment, "Comment", false);
        updateData.comment = comment ? comment.trim() : null;
    }

    const updatedReview = await prisma.review.update({
        where: { id },
        data: updateData,
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return updatedReview;
}

/**
 * Delete Review Service
 */
async function deleteReview(id: string, user: { id: string; role: Role }) {
    const review = await prisma.review.findUnique({
        where: { id },
    });

    if (!review) {
        throw new AppError(status.NOT_FOUND, "Review not found.");
    }

    // Verify authorization: only the author or an admin can delete
    if (user.role === Role.TENANT && review.tenantId !== user.id) {
        throw new AppError(
            status.FORBIDDEN,
            "You are not authorized to delete this review.",
        );
    }

    await prisma.review.delete({
        where: { id },
    });

    return;
}

/**
 * Export Reviews Service
 */
export const reviewsService = {
    createReview,
    getAllReviewsForProperty,
    updateReview,
    deleteReview,
};

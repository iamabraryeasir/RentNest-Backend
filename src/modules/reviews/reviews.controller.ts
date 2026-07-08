/**
 * Node Modules
 */
import { NextFunction, Request, Response } from "express";
import status from "http-status";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { reviewsService } from "./reviews.service";

/**
 * Create New Review
 */
const createReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const tenantId = req.user!.id;

        const result = await reviewsService.createReview(payload, tenantId);

        return sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Review created successfully",
            data: result,
        });
    },
);

/**
 * Get All Reviews Of a Property
 */
const getAllReviewsForProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;
        const propertyId = req.params.propertyId as string;

        const result = await reviewsService.getAllReviewsForProperty(
            query,
            propertyId,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Reviews retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    },
);

/**
 * Update Review
 */
const updateReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const payload = req.body;
        const tenantId = req.user!.id;

        const result = await reviewsService.updateReview(
            id as string,
            payload,
            tenantId,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Review updated successfully",
            data: result,
        });
    },
);

/**
 * Delete Review
 */
const deleteReview = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = req.user as { id: string; role: Role };

        await reviewsService.deleteReview(id as string, user);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Review deleted successfully",
        });
    },
);

/**
 * Export Reviews Controller
 */
export const reviewsController = {
    createReview,
    getAllReviewsForProperty,
    updateReview,
    deleteReview,
};

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
import { rentalsService } from "./rentals.service";

/**
 * Create New Rental Request
 */
const createRentalRequest = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const tenantId = req.user!.id;

        const result = await rentalsService.createRentalRequest(
            payload,
            tenantId,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Rental request created successfully",
            data: result,
        });
    },
);

/**
 * Get All Rental Requests (Admin)
 */
const getAllRentalRequests = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;

        const result = await rentalsService.getAllRentalRequests(query);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Rental requests retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    },
);

/**
 * Get My Rental Requests (Tenant)
 */
const getMyRentalRequests = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;
        const tenantId = req.user!.id;

        const result = await rentalsService.getMyRentalRequests(query, tenantId);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "My rental requests retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    },
);

/**
 * Get Incoming Rental Requests (Landlord)
 */
const getIncomingRentalRequests = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const query = req.query;
        const landlordId = req.user!.id;

        const result = await rentalsService.getIncomingRentalRequests(
            query,
            landlordId,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Incoming rental requests retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    },
);

/**
 * Get Rental Request By Id
 */
const getRentalRequestById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const user = req.user as { id: string; role: Role };

        const result = await rentalsService.getRentalRequestById(
            id as string,
            user,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Rental request retrieved successfully",
            data: result,
        });
    },
);

/**
 * Update Rental Request Status
 */
const updateRentalRequestStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const payload = req.body;
        const user = req.user as { id: string; role: Role };

        const result = await rentalsService.updateRentalRequestStatus(
            id as string,
            payload,
            user,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Rental request status updated successfully",
            data: result,
        });
    },
);

/**
 * Export Rentals Controller
 */
export const rentalsController = {
    createRentalRequest,
    getAllRentalRequests,
    getMyRentalRequests,
    getIncomingRentalRequests,
    getRentalRequestById,
    updateRentalRequestStatus,
};

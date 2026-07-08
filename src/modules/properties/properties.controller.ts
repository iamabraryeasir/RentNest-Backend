/**
 * Node Modules
 */
import { NextFunction, Request, Response } from "express";
import status from "http-status";

/**
 * Local Modules
 */
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { propertiesService } from "./properties.service";

/**
 * Get All Properties
 */
const getAllProperties = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { data, meta } =
            await propertiesService.getAllPropertiesService(req.query);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Properties fetched successfully",
            meta,
            data,
        });
    },
);

/**
 * Get Property by Id
 */
const getPropertyById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const propertyId = req.params?.id as string;

        if (!propertyId) {
            return next(new Error("Property ID is required"));
        }

        const result =
            await propertiesService.getPropertyByIdService(propertyId);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Property fetched successfully",
            data: result,
        });
    },
);

/**
 * Create New Property
 */
const createProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;
        const landlordId = req.user?.id as string;

        const result = await propertiesService.createPropertyService(
            payload,
            landlordId,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Property created successfully",
            data: result,
        });
    },
);

/**
 * Get My Properties
 */
const getMyProperties = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "My properties fetched successfully",
            data: null,
        });
    },
);

/**
 * Update Property
 */
const updateProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Property updated successfully",
            data: null,
        });
    },
);

/**
 * Update Property Status
 */
const updatePropertyStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Property status updated successfully",
            data: null,
        });
    },
);

/**
 * Delete Property
 */
const deleteProperty = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Property deleted successfully",
            data: null,
        });
    },
);

/**
 * Export Property Controller
 */
export const propertiesController = {
    getAllProperties,
    getPropertyById,
    createProperty,
    getMyProperties,
    updateProperty,
    updatePropertyStatus,
    deleteProperty,
};

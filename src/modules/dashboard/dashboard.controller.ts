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
import { dashboardService } from "./dashboard.service";

/**
 * Get Platform Dashboard Metrics
 */
const getMetrics = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await dashboardService.getDashboardMetrics();

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Dashboard metrics retrieved successfully",
            data: result,
        });
    },
);

/**
 * Export Dashboard Controller
 */
export const dashboardController = {
    getMetrics,
};

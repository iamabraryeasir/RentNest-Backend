/**
 * Node Modules
 */

import { NextFunction, Request, Response } from "express";
import status from "http-status";

/**
 * Local Modules
 */
import { User } from "../../../generated/prisma/client";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { IUserUpdateStatusPayload } from "./users.interface";
import { userService } from "./users.service";

/**
 * Update Profile Controller
 */
const updateUserProfile = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user!.id;
        const payload = req.body as Partial<User>;

        const result = await userService.updateUserProfile(userId, payload);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "User profile updated successfully",
            data: result,
        });
    },
);

/**
 * Get User By Id
 */
const getUserById = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id as string;

        const user = await userService.getUserById(userId);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "User retrieved successfully",
            data: user,
        });
    },
);

/**
 * Update User Status Controller
 */
const updateUserStatus = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.params.id as string;
        const payload = req.body as IUserUpdateStatusPayload;

        console.log({ payload });

        const result = await userService.updateUserStatus(userId, payload);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "User status updated successfully",
            data: result,
        });
    },
);

/**
 * Export User Controller
 */
export const userController = {
    updateUserProfile,
    getUserById,
    updateUserStatus,
};

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
 * Export User Controller
 */
export const userController = { updateUserProfile };

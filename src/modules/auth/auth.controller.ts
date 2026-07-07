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
import { IRegisterUserPayload } from "./auth.interface";
import { authService } from "./auth.service";

/**
 * Register User
 */
const registerUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload: IRegisterUserPayload = req.body;

        const result = await authService.registerUser(payload);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "User registered successfully",
            data: result,
        });
    },
);

/**
 * Export Auth Controller
 */
export const authController = {
    registerUser,
};

/**
 * Node Modules
 */
import { NextFunction, Request, Response } from "express";
import status from "http-status";

/**
 * Local Modules
 */
import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";
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
 * Login User
 */
const loginUser = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload: ILoginUserPayload = req.body;

        const result = await authService.loginUser(payload);
        const { accessToken, refreshToken, user } = result;

        const isProduction = config.SYSTEM.NODE_ENV === "production";

        // Set secure cookies
        res.cookie("accessToken", accessToken, {
            secure: isProduction,
            httpOnly: true,
            sameSite: "lax",
        });

        res.cookie("refreshToken", refreshToken, {
            secure: isProduction,
            httpOnly: true,
            sameSite: "lax",
        });

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "User logged in successfully",
            data: {
                accessToken,
                refreshToken,
                user,
            },
        });
    },
);

/**
 * Export Auth Controller
 */
export const authController = {
    registerUser,
    loginUser,
};

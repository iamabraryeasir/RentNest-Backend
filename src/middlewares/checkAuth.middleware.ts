import { NextFunction, Request, Response } from "express";
import status from "http-status";

import config from "../config";
import { verifyToken } from "../utils/jwt";
import { catchAsync } from "../utils/catchAsync";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { JwtPayload } from "jsonwebtoken";
import { prisma } from "../utils/prisma";
import { AppError } from "../utils/AppError";

export const checkAuth = (...requiredRoles: Role[]) => {
    return catchAsync(
        async (req: Request, res: Response, next: NextFunction) => {
            const token =
                req.cookies.accessToken ||
                (req.headers.authorization?.startsWith("Bearer ")
                    ? req.headers.authorization?.split(" ")[1]
                    : req.headers.authorization);

            if (!token) {
                throw new AppError(
                    status.UNAUTHORIZED,
                    "You are not login. Please login to access the content",
                );
            }

            let verifiedToken: JwtPayload;
            try {
                verifiedToken = verifyToken(token, config.JWT.ACCESS.SECRET) as JwtPayload;
            } catch (error: any) {
                throw new AppError(
                    status.UNAUTHORIZED,
                    error.message || "Invalid or expired token",
                );
            }

            const { id } = verifiedToken;

            const user = await prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                throw new AppError(
                    status.UNAUTHORIZED,
                    "User not found. Please login properly.",
                );
            }

            if (user.status === UserStatus.BLOCKED) {
                throw new AppError(
                    status.FORBIDDEN,
                    "Your account has been blocked. Please contact the admins",
                );
            }

            if (
                requiredRoles.length >= 1 &&
                !requiredRoles.includes(user.role)
            ) {
                throw new AppError(
                    status.FORBIDDEN,
                    "Unauthorized access. Role not permitted to access",
                );
            }

            req.user = {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };

            next();
        },
    );
};

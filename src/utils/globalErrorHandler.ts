/**
 * Node Modules
 */
import { NextFunction, Request, Response } from "express";
import status from "http-status";

/**
 * Local Modules
 */
import { sendResponse } from "./sendResponse";

/**
 * Prisma Errors
 */

// Prisma Error Checker
const isPrismaError = (err: any): boolean => {
    const name = err?.name || err?.constructor?.name || "";
    return (
        name.startsWith("PrismaClient") ||
        Boolean(
            err?.code &&
            typeof err.code === "string" &&
            err.code.startsWith("P"),
        )
    );
};

// Prisma error handler
const handlePrismaError = (err: any) => {
    const errorName = err?.name || err?.constructor?.name || "";
    const code = err?.code;

    switch (errorName) {
        case "PrismaClientKnownError":
        case "PrismaClientKnownRequestError":
            if (code === "P2025") {
                return {
                    statusCode: status.NOT_FOUND,
                    message: "Requested record was not found",
                };
            }
            if (code === "P2002") {
                return {
                    statusCode: status.CONFLICT,
                    message: "A unique constraint was violated",
                };
            }
            return {
                statusCode: status.BAD_REQUEST,
                message: err.message || "A Prisma request error occurred",
            };

        case "PrismaClientUnknownError":
        case "PrismaClientUnknownRequestError":
            return {
                statusCode: status.INTERNAL_SERVER_ERROR,
                message: "An unknown Prisma error occurred",
            };

        case "PrismaClientRustPanicError":
            return {
                statusCode: status.INTERNAL_SERVER_ERROR,
                message: "The Prisma engine crashed",
            };

        case "PrismaClientInitializationError":
            return {
                statusCode: status.SERVICE_UNAVAILABLE,
                message: "Prisma failed to initialize",
            };

        case "PrismaClientValidationError":
            return {
                statusCode: status.BAD_REQUEST,
                message: "Prisma validation failed",
            };

        default:
            return {
                statusCode: status.BAD_REQUEST,
                message: err.message || "A Prisma error occurred",
            };
    }
};

/**
 * JWT Errors
 */
// JWT Error Checker
const isJWTError = (err: any): boolean => {
    return err.name === "JsonWebTokenError" || err.name === "TokenExpiredError";
};

// JWT error handler
const handleJWTError = (err: any) => {
    if (err.name === "TokenExpiredError") {
        return {
            statusCode: status.UNAUTHORIZED,
            message: "Token has expired",
        };
    }
    return {
        statusCode: status.UNAUTHORIZED,
        message: "Invalid token",
    };
};

/**
 * Validation Errors
 */
const isValidationError = (err: any): boolean => {
    return (
        err.name === "ValidationError" || err.message?.includes("validation")
    );
};

/**
 * Global Error Handler
 */
export function globalErrorHandler(
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) {
    console.error("Error:", err);

    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = message;

    // Prisma Errors
    if (isPrismaError(err)) {
        const prismaError = handlePrismaError(err);
        statusCode = prismaError.statusCode;
        message = prismaError.message;
        error = err.meta?.cause || err.message || message;
    }

    // Handle JWT errors
    else if (isJWTError(err)) {
        const jwtError = handleJWTError(err);
        statusCode = jwtError.statusCode;
        message = jwtError.message;
        error = err.message;
    }

    // Handle validation errors
    else if (isValidationError(err)) {
        statusCode = status.BAD_REQUEST;
        message = "Validation error";
        error = err.message;
    }

    // Handle custom app errors
    else if (err.statusCode || err.status) {
        statusCode = err.statusCode || err.status;
        message = err.message || "An error occurred";
        error = err.message || message;
    }

    // Handle default errors
    else if (err.message) {
        message = err.message;
        error = err.message;
    }

    // Send the error response
    return sendResponse(res, {
        success: false,
        statusCode,
        message,
        error,
    });
}

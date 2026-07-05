/**
 * Node Modules
 */
import { Request, Response } from "express";
import status from "http-status";

/**
 * Local Modules
 */
import { sendResponse } from "./sendResponse";

/**
 * Function to handle 404 Not Found errors / not found routes
 */
export function notFoundHandler(req: Request, res: Response) {
    return sendResponse(res, {
        success: false,
        statusCode: status.NOT_FOUND,
        message: "Route not found",
        error: {
            path: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString(),
        },
    });
}

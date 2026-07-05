/**
 * Node Modules
 */
import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Local Modules
 */

/**
 * catchAsync Utility Function
 */
export function catchAsync(func: RequestHandler) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await func(req, res, next);
        } catch (error) {
            next(error);
        }
    };
}

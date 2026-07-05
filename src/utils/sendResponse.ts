/**
 * Node Modules
 */
import { Response } from "express";

/**
 * Local Modules
 */

/**
 * Type Definitions
 */
interface IResponseData<T> {
    success: boolean;
    statusCode: number;
    message: string;
    error?: T;
    data?: T;
    meta?: IMeta;
}

export interface IMeta {
    page: number;
    limit: number;
    total: number;
}

/**
 * Function to send a response to the client
 */
export function sendResponse<T>(res: Response, data: IResponseData<T>) {
    res.status(data.statusCode).json({
        success: data.success,
        statusCode: data.statusCode,
        message: data.message,
        data: data.data,
        meta: data.meta,
        error: data.error,
    });
}

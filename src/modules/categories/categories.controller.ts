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
import { categoriesService } from "./categories.service";

/**
 * Create New Category
 */
const createNewCategory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const payload = req.body;

        const result = await categoriesService.createNewCategory(payload);

        return sendResponse(res, {
            success: true,
            statusCode: status.CREATED,
            message: "Category created successfully",
            data: result,
        });
    },
);

/**
 * Get All Categories
 */
const getAllCategories = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const result = await categoriesService.getAllCategories(req.query);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Categories retrieved successfully",
            meta: result.meta,
            data: result.data,
        });
    },
);

/**
 * Update Category
 */
const updateCategory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;
        const payload = req.body;

        const result = await categoriesService.updateCategory(
            id as string,
            payload,
        );

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Category updated successfully",
            data: result,
        });
    },
);

/**
 * Delete Category
 */
const deleteCategory = catchAsync(
    async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params;

        const result = await categoriesService.deleteCategory(id as string);

        return sendResponse(res, {
            success: true,
            statusCode: status.OK,
            message: "Category deleted successfully",
            data: result,
        });
    },
);

export const categoriesController = {
    createNewCategory,
    deleteCategory,
    getAllCategories,
    updateCategory,
};

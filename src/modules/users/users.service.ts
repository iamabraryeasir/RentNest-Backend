/**
 * Node Modules
 */
import status from "http-status";

/**
 * Local Modules
 */
import { User } from "../../../generated/prisma/client";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../utils/prisma";
import { parseQuery, IQueryOptions } from "../../utils/queryHelpers";
import { IUserUpdateStatusPayload } from "./users.interface";

/**
 * Update User Profile
 */
async function updateUserProfile(userId: string, payload: Partial<User>) {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found.");
    }

    // Validate keys in the payload
    const keys = Object.keys(payload);
    if (keys.length === 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "At least one field to update must be provided.",
        );
    }

    const allowedKeys = ["name"];
    const invalidKeys = keys.filter((key) => !allowedKeys.includes(key));
    if (invalidKeys.length > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            `Updating field(s) '${invalidKeys.join(", ")}' is not allowed.`,
        );
    }

    // Valiate name if provided
    if (payload.name !== undefined) {
        if (typeof payload.name !== "string" || payload.name.trim() === "") {
            throw new AppError(
                status.BAD_REQUEST,
                "Name must be a valid, non-empty string.",
            );
        }
    }

    // Update user and return updated data
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name: payload.name?.trim(),
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
}

/**
 * Get All Users
 */
async function getAllUsers(query: IQueryOptions) {
    const { page, limit, skip, sortBy, sortOrder, search, filters } = parseQuery(
        query,
        ["role", "status"],
        ["createdAt", "name", "email", "role", "status"],
    );

    const whereConditions: Record<string, any> = { ...filters };

    if (search) {
        whereConditions.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
        ];
    }

    const users = await prisma.user.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    const total = await prisma.user.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: users,
    };
}

/**
 * Get User By Id
 */
async function getUserById(userId: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: {
            password: true,
        },
        include: {
            properties: {
                select: {
                    id: true,
                    title: true,
                    images: true,
                    rentAmount: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
        },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found.");
    }

    return user;
}

/**
 * Update User Status
 */
async function updateUserStatus(
    userId: string,
    payload: IUserUpdateStatusPayload,
) {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found.");
    }

    // Update user and return updated data
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            status: payload.status,
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return updatedUser;
}

/**
 * Delete User
 */
async function deleteUser(userId: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found.");
    }

    // Delete user
    await prisma.user.delete({
        where: { id: userId },
    });

    return;
}

/**
 * Export User Service
 */
export const userService = {
    updateUserProfile,
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
};

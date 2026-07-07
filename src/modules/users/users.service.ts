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
 * Export User Service
 */
export const userService = { updateUserProfile, getUserById };

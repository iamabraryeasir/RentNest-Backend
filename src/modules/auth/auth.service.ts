/**
 * Node Modules
 */
import bcrypt from "bcryptjs";
import status from "http-status";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../utils/prisma";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";

/**
 * User Registration Service
 */
const registerUser = async (payload: IRegisterUserPayload) => {
    const { name, email, password, role } = payload;

    // User input validation
    if (!name || typeof name !== "string" || name.trim() === "") {
        throw new AppError(status.BAD_REQUEST, "Name is required.");
    }
    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
        throw new AppError(status.BAD_REQUEST, "A valid email is required.");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
        throw new AppError(
            status.BAD_REQUEST,
            "Password must be at least 6 characters long.",
        );
    }
    if (!role) {
        throw new AppError(status.BAD_REQUEST, "Role is required.");
    }

    // Restrict role "ADMIN" registration
    const roleStr = role as string;
    if (roleStr === Role.ADMIN) {
        throw new AppError(
            status.BAD_REQUEST,
            "Registration for ADMIN role is not allowed.",
        );
    }
    if (roleStr !== Role.TENANT && roleStr !== Role.LANDLORD) {
        throw new AppError(
            status.BAD_REQUEST,
            "Invalid role. Only TENANT and LANDLORD roles can register.",
        );
    }

    // Email must be unique
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });
    if (existingUser) {
        throw new AppError(status.CONFLICT, "Email is already registered.");
    }

    // Password encryption using bcryptjs
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save everything to db using prisma
    const newUser = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            role,
        },
    });

    // Return the name, email, role and status
    return {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
    };
};

/**
 * User Login Service
 */
const loginUser = async (payload: ILoginUserPayload) => {
    return payload;
};

/**
 * Export Auth Service
 */
export const authService = {
    registerUser,
    loginUser,
};

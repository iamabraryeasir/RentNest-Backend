/**
 * Node Modules
 */
import bcrypt from "bcryptjs";
import status from "http-status";

/**
 * Local Modules
 */
import { Role, UserStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { AppError } from "../../utils/AppError";
import { generateToken, verifyToken } from "../../utils/jwt";
import { prisma } from "../../utils/prisma";
import {
    validateEmail,
    validatePassword,
    validateString,
} from "../../utils/validation";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface";

/**
 * User Registration Service
 */
async function registerUser(payload: IRegisterUserPayload) {
    const { role } = payload;

    const validatedName = validateString(payload.name, "Name")!;
    const validatedEmail = validateEmail(payload.email);
    const validatedPassword = validatePassword(payload.password, 6);

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
        where: { email: validatedEmail },
    });
    if (existingUser) {
        throw new AppError(status.CONFLICT, "Email is already registered.");
    }

    // Password encryption using bcryptjs
    const hashedPassword = await bcrypt.hash(validatedPassword, 12);

    // Save everything to db using prisma
    const newUser = await prisma.user.create({
        data: {
            name: validatedName,
            email: validatedEmail,
            password: hashedPassword,
            role,
        },
    });

    // Return the name, email, role and status
    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
    };
}

/**
 * User Login Service
 */
async function loginUser(payload: ILoginUserPayload) {
    const validatedEmail = validateEmail(payload.email);
    const validatedPassword = validateString(payload.password, "Password")!;

    // Match email and password
    const user = await prisma.user.findUnique({
        where: { email: validatedEmail },
    });

    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "Incorrect email or password.");
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
        throw new AppError(status.FORBIDDEN, "User is not active.");
    }

    // Match password
    const isPasswordMatched = await bcrypt.compare(
        validatedPassword,
        user.password,
    );
    if (!isPasswordMatched) {
        throw new AppError(status.UNAUTHORIZED, "Incorrect email or password.");
    }

    // Generate JWT tokens
    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateToken(
        jwtPayload,
        config.JWT.ACCESS.SECRET,
        config.JWT.ACCESS.EXPIRES_IN,
    );

    const refreshToken = generateToken(
        jwtPayload,
        config.JWT.REFRESH.SECRET,
        config.JWT.REFRESH.EXPIRES_IN,
    );

    // Return the tokens and user details
    return {
        accessToken,
        refreshToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        },
    };
}

/**
 * Get Current Login User
 */
async function getLogedInUser(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found.");
    }

    if (user.status !== UserStatus.ACTIVE) {
        throw new AppError(status.FORBIDDEN, "User is not active.");
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
    };
}

/**
 * Get New Access Token Using Refresh Token
 */
async function getNewRefreshToken(refreshToken: string) {
    // Verify refresh token
    const decoded = verifyToken(refreshToken, config.JWT.REFRESH.SECRET) as {
        id: string;
        email: string;
        role: string;
    };

    // Find user
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
    });

    if (!user) {
        throw new AppError(status.UNAUTHORIZED, "User not found.");
    }

    // Check user status
    if (user.status !== UserStatus.ACTIVE) {
        throw new AppError(status.FORBIDDEN, "User is not active.");
    }

    // Generate new access token
    const jwtPayload = {
        id: user.id,
        email: user.email,
        role: user.role,
    };

    const accessToken = generateToken(
        jwtPayload,
        config.JWT.ACCESS.SECRET,
        config.JWT.ACCESS.EXPIRES_IN,
    );

    const newRefreshToken = generateToken(
        jwtPayload,
        config.JWT.REFRESH.SECRET,
        config.JWT.REFRESH.EXPIRES_IN,
    );

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
}

/**
 * Export Auth Service
 */
export const authService = {
    registerUser,
    loginUser,
    getLogedInUser,
    getNewRefreshToken,
};

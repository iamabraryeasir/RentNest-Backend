/**
 * Node Modules
 */
import status from "http-status";

/**
 * Local Modules
 */
import { AppError } from "./AppError";

/**
 * Validate that a value is a non-empty string.
 * Trims the value and returns it if successful.
 */
export const validateString = (
    value: any,
    fieldName: string,
    isRequired = true,
): string | undefined => {
    if (value === undefined || value === null || value === "") {
        if (isRequired) {
            throw new AppError(status.BAD_REQUEST, `${fieldName} is required.`);
        }
        return undefined;
    }
    if (typeof value !== "string" || value.trim() === "") {
        throw new AppError(
            status.BAD_REQUEST,
            `${fieldName} must be a valid, non-empty string.`,
        );
    }
    return value.trim();
};

/**
 * Validate that a value is a valid email string.
 */
export const validateEmail = (
    value: any,
    fieldName: string = "Email",
): string => {
    if (!value || typeof value !== "string" || !/^\S+@\S+\.\S+$/.test(value)) {
        throw new AppError(
            status.BAD_REQUEST,
            `A valid ${fieldName.toLowerCase()} is required.`,
        );
    }
    return value.trim();
};

/**
 * Validate that a value is a string with a minimum length.
 */
export const validatePassword = (
    value: any,
    minLength = 6,
    fieldName: string = "Password",
): string => {
    if (!value || typeof value !== "string" || value.length < minLength) {
        throw new AppError(
            status.BAD_REQUEST,
            `${fieldName} must be at least ${minLength} characters long.`,
        );
    }
    return value;
};

/**
 * Validate that a value is a positive number.
 */
export const validatePositiveNumber = (
    value: any,
    fieldName: string,
    isRequired = true,
): number | undefined => {
    if (value === undefined || value === null) {
        if (isRequired) {
            throw new AppError(status.BAD_REQUEST, `${fieldName} is required.`);
        }
        return undefined;
    }
    const num = Number(value);
    if (typeof value !== "number" || isNaN(num) || num <= 0) {
        throw new AppError(
            status.BAD_REQUEST,
            `${fieldName} must be a positive number.`,
        );
    }
    return num;
};

/**
 * Validate that a value is an integer with an optional minimum limit.
 */
export const validateInteger = (
    value: any,
    fieldName: string,
    options: { isRequired?: boolean; min?: number } = {},
): number | undefined => {
    const { isRequired = true, min = 0 } = options;
    if (value === undefined || value === null) {
        if (isRequired) {
            throw new AppError(status.BAD_REQUEST, `${fieldName} is required.`);
        }
        return undefined;
    }
    const num = Number(value);
    if (typeof value !== "number" || !Number.isInteger(num) || num < min) {
        throw new AppError(
            status.BAD_REQUEST,
            `${fieldName} must be an integer >= ${min}.`,
        );
    }
    return num;
};

/**
 * Validate that a value is an array of strings.
 */
export const validateStringArray = (
    value: any,
    fieldName: string,
    isRequired = false,
): string[] | undefined => {
    if (value === undefined || value === null) {
        if (isRequired) {
            throw new AppError(status.BAD_REQUEST, `${fieldName} is required.`);
        }
        return undefined;
    }
    if (
        !Array.isArray(value) ||
        value.some((item) => typeof item !== "string")
    ) {
        throw new AppError(
            status.BAD_REQUEST,
            `${fieldName} must be an array of strings.`,
        );
    }
    return value;
};

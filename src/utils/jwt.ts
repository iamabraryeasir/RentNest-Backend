/**
 * Node Modules
 */
import jwt, { SignOptions } from "jsonwebtoken";

/**
 * Generate a JWT Token
 */
export const generateToken = (
    payload: Record<string, unknown>,
    secret: string,
    expiresIn: string,
): string => {
    return jwt.sign(payload, secret, {
        expiresIn,
    } as SignOptions);
};

/**
 * Verify a JWT Token
 */
export const verifyToken = (token: string, secret: string) => {
    return jwt.verify(token, secret);
};

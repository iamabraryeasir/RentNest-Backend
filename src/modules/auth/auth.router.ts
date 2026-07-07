/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { authController } from "./auth.controller";

/**
 * Router
 */
const authRouter = Router();

/**
 * Register User : POST /api/auth/register
 */
authRouter.post("/register", authController.registerUser);

/**
 * Login User : POST /api/auth/login
 */
authRouter.post("/login", authController.loginUser);

/**
 * Current User : GET /api/auth/me
 */
authRouter.get("/me", checkAuth(), authController.getLogedInUser);

/**
 * Refresh Token : POST /api/auth/refresh-token
 */
authRouter.post("/refresh-token", authController.getNewRefreshToken);

/**
 * Logout User : POST /api/auth/logout
 */
authRouter.post("/logout", checkAuth(), authController.logoutUser);

/**
 * Export
 */
export default authRouter;

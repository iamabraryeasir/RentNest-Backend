/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { userController } from "./users.controller";

/**
 * User Router
 */
const usersRouter = Router();

/**
 * Update Profile: PATCH /api/users/profile
 */
usersRouter.patch("/profile", checkAuth(), userController.updateUserProfile);

/**
 * Get All Users: GET /api/users
 */
usersRouter.get("/", checkAuth(Role.ADMIN), () => {});

/**
 * Get Single User: GET /api/users/:id
 */
usersRouter.get("/:id", checkAuth(Role.ADMIN), userController.getUserById);

/**
 * Update User Status: PATCH /api/users/:id/status
 */
usersRouter.patch("/:id/status", checkAuth(Role.ADMIN), () => {});

/**
 * Delete User: DELETE /api/users/:id
 */
usersRouter.delete("/:id", checkAuth(Role.ADMIN), () => {});

/**
 * Export User Router
 */
export default usersRouter;

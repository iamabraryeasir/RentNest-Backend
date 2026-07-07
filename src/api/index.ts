/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import authRouter from "../modules/auth/auth.router";
import usersRouter from "../modules/users/users.router";

/**
 * Creating the API Router
 */
const apiRouter = Router();

/**
 * Routes Mapping
 */
apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);

/**
 * Exporting the API Router
 */
export default apiRouter;

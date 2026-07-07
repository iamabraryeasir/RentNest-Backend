/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import authRouter from "../modules/auth/auth.router";
import categoriesRouter from "../modules/categories/categories.router";
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
apiRouter.use("/categories", categoriesRouter);

/**
 * Exporting the API Router
 */
export default apiRouter;

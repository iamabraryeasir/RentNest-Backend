/**
 * Node Modules
 */
import { Router } from "express";
import authRouter from "../modules/auth/auth.router";

/**
 * Local Modules
 */

/**
 * Creating the API Router
 */
const apiRouter = Router();

/**
 * Routes Mapping
 */
apiRouter.use("/auth", authRouter);

/**
 * Exporting the API Router
 */
export default apiRouter;

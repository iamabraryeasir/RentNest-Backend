/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import authRouter from "../modules/auth/auth.router";
import categoriesRouter from "../modules/categories/categories.router";
import propertyRouter from "../modules/properties/properties.router";
import rentalsRouter from "../modules/rentals/rentals.router";
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
apiRouter.use("/properties", propertyRouter);
apiRouter.use("/rentals", rentalsRouter);

/**
 * Exporting the API Router
 */
export default apiRouter;

/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import authRouter from "../modules/auth/auth.router";
import categoriesRouter from "../modules/categories/categories.router";
import paymentsRouter from "../modules/payments/payments.router";
import propertyRouter from "../modules/properties/properties.router";
import rentalsRouter from "../modules/rentals/rentals.router";
import reviewsRouter from "../modules/reviews/reviews.router";
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
apiRouter.use("/reviews", reviewsRouter);
apiRouter.use("/payments", paymentsRouter);

/**
 * Exporting the API Router
 */
export default apiRouter;

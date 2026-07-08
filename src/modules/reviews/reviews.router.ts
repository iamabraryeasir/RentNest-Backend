/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { reviewsController } from "./reviews.controller";

/**
 * Reviews Router
 */
const reviewsRouter = Router();

/**
 * Create New Review
 */
reviewsRouter.post("/", checkAuth(Role.TENANT), reviewsController.createReview);

/**
 * Get All Reviews Of a Property
 */
reviewsRouter.get("/", reviewsController.getAllReviewsForProperty);

/**
 * Update Review
 */
reviewsRouter.patch(
    "/:id",
    checkAuth(Role.TENANT),
    reviewsController.updateReview,
);

/**
 * Delete Review
 */
reviewsRouter.delete(
    "/:id",
    checkAuth(Role.TENANT, Role.ADMIN),
    reviewsController.deleteReview,
);

/**
 * Export Reviews Router
 */
export default reviewsRouter;

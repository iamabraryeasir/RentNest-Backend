/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { rentalsController } from "./rentals.controller";

/**
 * Rentals Router
 */
const rentalsRouter = Router();

/**
 * Create New Rental Request
 */
rentalsRouter.post(
    "/",
    checkAuth(Role.TENANT),
    rentalsController.createRentalRequest,
);

/**
 * Get All Rental Requests
 */
rentalsRouter.get(
    "/",
    checkAuth(Role.ADMIN),
    rentalsController.getAllRentalRequests,
);

/**
 * Get My Rental Requests
 */
rentalsRouter.get(
    "/my-requests",
    checkAuth(Role.TENANT),
    rentalsController.getMyRentalRequests,
);

/**
 * Get Incoming Rental Requests
 */
rentalsRouter.get(
    "/incoming",
    checkAuth(Role.LANDLORD),
    rentalsController.getIncomingRentalRequests,
);

/**
 * Get Rental Requests By Id
 */
rentalsRouter.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.TENANT),
    rentalsController.getRentalRequestById,
);

/**
 * Update Rental Requests Status
 */
rentalsRouter.patch(
    "/:id/status",
    checkAuth(Role.ADMIN, Role.LANDLORD),
    rentalsController.updateRentalRequestStatus,
);

/**
 * Export Rentals Router
 */
export default rentalsRouter;

/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { propertiesController } from "./properties.controller";

/**
 * Property Router
 */
const propertyRouter = Router();

/**
 * Get All Properties
 */
propertyRouter.get("/", propertiesController.getAllProperties);

/**
 * Get my Properties
 */
propertyRouter.get(
    "/my-properties",
    checkAuth(Role.LANDLORD),
    propertiesController.getMyProperties,
);

/**
 * Get Property By Id
 */
propertyRouter.get("/:id", propertiesController.getPropertyById);

/**
 * Create Property
 */
propertyRouter.post(
    "/",
    checkAuth(Role.LANDLORD),
    propertiesController.createProperty,
);

/**
 * Update Property
 */
propertyRouter.patch(
    "/:id",
    checkAuth(Role.LANDLORD, Role.ADMIN),
    propertiesController.updateProperty,
);

/**
 * Update Property Status
 */
propertyRouter.patch(
    "/:id/status",
    checkAuth(Role.LANDLORD, Role.ADMIN),
    propertiesController.updatePropertyStatus,
);

/**
 * Delete Property
 */
propertyRouter.delete(
    "/:id",
    checkAuth(Role.LANDLORD, Role.ADMIN),
    propertiesController.deleteProperty,
);

/**
 * Export Property Router
 */
export default propertyRouter;

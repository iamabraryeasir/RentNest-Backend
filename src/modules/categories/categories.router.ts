/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { categoriesController } from "./categories.controller";

/**
 * Categories Router
 */
const categoriesRouter = Router();

/**
 * Create Category: POST /api/categories
 */
categoriesRouter.post(
    "/",
    checkAuth(Role.ADMIN),
    categoriesController.createNewCategory,
);

/**
 * Get All Categories: GET /api/categories
 */
categoriesRouter.get("/", categoriesController.getAllCategories);

/**
 * Update Category: PATCH /api/categories/:id
 */
categoriesRouter.patch(
    "/:id",
    checkAuth(Role.ADMIN),
    categoriesController.updateCategory,
);

/**
 * Delete Category: DELETE /api/categories/:id
 */
categoriesRouter.delete(
    "/:id",
    checkAuth(Role.ADMIN),
    categoriesController.deleteCategory,
);

/**
 * Export Categories Router
 */
export default categoriesRouter;

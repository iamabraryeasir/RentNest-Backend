/**
 * Node Modules
 */
import { Router } from "express";

/**
 * Local Modules
 */
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middlewares/checkAuth.middleware";
import { dashboardController } from "./dashboard.controller";

/**
 * Dashboard Router
 */
const dashboardRouter = Router();

/**
 * Get Platform Dashboard Metrics: GET /api/dashboard/metrics
 */
dashboardRouter.get(
    "/metrics",
    checkAuth(Role.ADMIN),
    dashboardController.getMetrics,
);

/**
 * Export Dashboard Router
 */
export default dashboardRouter;

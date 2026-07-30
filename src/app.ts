/**
 * Node Modules
 */
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";
import morgan from "morgan";

/**
 * Local Modules
 */
import apiRouter from "./api";
import config from "./config";
import { globalErrorHandler } from "./utils/globalErrorHandler";
import { notFoundHandler } from "./utils/notFound";

/**
 * App Initialization
 */
const app: Application = express();

/**
 * Stripe Webhook Raw Middleware
 */
app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

/**
 * Request / Response Logger
 */
if (config.SYSTEM.NODE_ENV === "development") {
    app.use(morgan("dev"));
} else {
    app.use(morgan("combined"));
}

/**
 * Basic Application Middlewares
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/**
 * CORS Configuration
 */
app.use(
    cors({
        origin: config.FRONTEND_URL,
        credentials: true,
    }),
);

/**
 * Routes
 */
app.use("/api", apiRouter);

/**
 * 404 Error Handling
 */
app.use(notFoundHandler);

/**
 * Global Error Handling
 */
app.use(globalErrorHandler);

/**
 * Exporting the App
 */
export default app;

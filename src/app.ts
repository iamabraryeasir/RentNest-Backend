/**
 * Node Modules
 */
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application } from "express";

/**
 * Local Modules
 */
import apiRouter from "./api";
import config from "./config";

/**
 * App Initialization
 */
const app: Application = express();

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


/**
 * Global Error Handling
 */

/**
 * Exporting the App
 */
export default app;

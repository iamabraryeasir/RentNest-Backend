/**
 * Node Modules
 */

/**
 * Local Modules
 */
import app from "./app";
import config from "./config";
import { prisma } from "./utils/prisma";

/**
 * Server Initialization
 */
async function main() {
    try {
        prisma.$connect();
        console.log("Database connected successfully");

        app.listen(config.SYSTEM.PORT, () => {
            console.log(`Server is running at => ${config.SYSTEM.PORT}`);
        });
    } catch (error) {
        console.error("Error Starting Server", error);
        prisma.$disconnect();
        process.exit(1);
    }
}

/**
 * Starting the Server
 */
main();

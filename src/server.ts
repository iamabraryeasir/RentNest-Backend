/**
 * Node Modules
 */

/**
 * Local Modules
 */
import app from "./app";
import config from "./config";
import { prisma } from "./utils/prisma";
import { seedAdmin } from "./utils/seedAdmin";

/**
 * Server Initialization
 */
async function main() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully");

        // Seed default admin if missing
        await seedAdmin();

        app.listen(config.SYSTEM.PORT, () => {
            console.log(`Server is running at => ${config.SYSTEM.PORT}`);
        });
    } catch (error) {
        console.error("Error Starting Server", error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

/**
 * Starting the Server
 */
main();

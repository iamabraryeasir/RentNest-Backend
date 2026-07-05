/**
 * Node Modules
 */

/**
 * Local Modules
 */
import app from "./app";
import config from "./config";

/**
 * Server Initialization
 */
async function main() {
    try {
        app.listen(config.SYSTEM.PORT, () => {
            console.log(`Server is running at => ${config.SYSTEM.PORT}`);
        });
    } catch (error) {
        console.error("Error Starting Server", error);
        process.exit(1);
    }
}

/**
 * Starting the Server
 */
main();

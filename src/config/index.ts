import "dotenv/config";

const config = {
    SYSTEM: {
        PORT: process.env.PORT || 5000,
        NODE_ENV: process.env.NODE_ENV || "development",
    },

    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};

export default Object.freeze(config);

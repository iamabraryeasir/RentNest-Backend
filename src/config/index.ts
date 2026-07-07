import "dotenv/config";

const config = {
    SYSTEM: {
        PORT: process.env.PORT || 5000,
        NODE_ENV: process.env.NODE_ENV || "development",
    },

    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

    DATABASE: {
        URL: process.env.DATABASE_URL as string,
    },

    JWT: {
        ACCESS: {
            SECRET: process.env.JWT_ACCESS_SECRET as string,
            EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN as string,
        },
        REFRESH: {
            SECRET: process.env.JWT_REFRESH_SECRET as string,
            EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
        },
    },
};

export default Object.freeze(config);

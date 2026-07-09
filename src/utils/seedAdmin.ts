import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import config from "../config";
import { Role } from "../../generated/prisma/enums";

/**
 * Seed Admin Account
 */
export async function seedAdmin() {
    try {
        // Check if an admin exists
        const adminExists = await prisma.user.findFirst({
            where: {
                role: Role.ADMIN,
            },
        });

        if (!adminExists) {
            console.log("No Admin found in database. Seeding Admin...");

            const email = config.ADMIN.EMAIL || "admin@gmail.com";
            const password = config.ADMIN.PASSWORD || "12345678";

            // Hash the admin password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create admin user
            const admin = await prisma.user.create({
                data: {
                    name: "Admin",
                    email,
                    password: hashedPassword,
                    role: Role.ADMIN,
                },
            });

            console.log(`Admin seeded successfully: ${admin.email}`);
        } else {
            console.log("Admin already exists in database. Skipping seed.");
        }
    } catch (error) {
        console.error("Error seeding Admin:", error);
    }
}

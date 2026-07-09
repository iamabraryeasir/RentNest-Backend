/**
 * Local Modules
 */
import {
    PaymentStatus,
    PropertyStatus,
    RentalRequestStatus,
    Role,
    UserStatus,
} from "../../../generated/prisma/enums";
import { prisma } from "../../utils/prisma";

/**
 * Get Platform Dashboard Metrics
 */
async function getDashboardMetrics() {
    const [
        totalUsers,
        totalTenants,
        totalLandlords,
        totalAdmins,
        activeUsers,
        blockedUsers,
        totalProperties,
        availableProperties,
        rentedProperties,
        unavailableProperties,
        totalRentals,
        pendingRentals,
        approvedRentals,
        rejectedRentals,
        activeRentals,
        completedRentals,
        totalPayments,
        paidPayments,
        pendingPayments,
        failedPayments,
        totalRevenueAgg,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: Role.TENANT } }),
        prisma.user.count({ where: { role: Role.LANDLORD } }),
        prisma.user.count({ where: { role: Role.ADMIN } }),
        prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        prisma.user.count({ where: { status: UserStatus.BLOCKED } }),

        prisma.property.count(),
        prisma.property.count({ where: { status: PropertyStatus.AVAILABLE } }),
        prisma.property.count({ where: { status: PropertyStatus.RENTED } }),
        prisma.property.count({
            where: { status: PropertyStatus.UNAVAILABLE },
        }),

        prisma.rentalRequest.count(),
        prisma.rentalRequest.count({
            where: { status: RentalRequestStatus.PENDING },
        }),
        prisma.rentalRequest.count({
            where: { status: RentalRequestStatus.APPROVED },
        }),
        prisma.rentalRequest.count({
            where: { status: RentalRequestStatus.REJECTED },
        }),
        prisma.rentalRequest.count({
            where: { status: RentalRequestStatus.ACTIVE },
        }),
        prisma.rentalRequest.count({
            where: { status: RentalRequestStatus.COMPLETED },
        }),

        prisma.payment.count(),
        prisma.payment.count({ where: { status: PaymentStatus.PAID } }),
        prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
        prisma.payment.count({ where: { status: PaymentStatus.FAILED } }),
        prisma.payment.aggregate({
            where: { status: PaymentStatus.PAID },
            _sum: { amount: true },
        }),
    ]);

    const totalRevenue = Number(totalRevenueAgg._sum.amount) || 0;

    return {
        users: {
            total: totalUsers,
            tenants: totalTenants,
            landlords: totalLandlords,
            admins: totalAdmins,
            active: activeUsers,
            blocked: blockedUsers,
        },
        properties: {
            total: totalProperties,
            available: availableProperties,
            rented: rentedProperties,
            unavailable: unavailableProperties,
        },
        rentals: {
            total: totalRentals,
            pending: pendingRentals,
            approved: approvedRentals,
            rejected: rejectedRentals,
            active: activeRentals,
            completed: completedRentals,
        },
        finance: {
            totalRevenue,
            totalPayments,
            paid: paidPayments,
            pending: pendingPayments,
            failed: failedPayments,
        },
    };
}

/**
 * Export Dashboard Service
 */
export const dashboardService = {
    getDashboardMetrics,
};

/**
 * Node Modules
 */
import status from "http-status";

/**
 * Local Modules
 */
import { Prisma } from "../../../generated/prisma/client";
import {
    PropertyStatus,
    RentalRequestStatus,
    Role,
} from "../../../generated/prisma/enums";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../utils/prisma";
import { IQueryOptions, parseQuery } from "../../utils/queryHelpers";
import { validateString } from "../../utils/validation";
import {
    ICreateRentalRequestPayload,
    IUpdateRentalRequestStatusPayload,
} from "./rentals.interface";

/**
 * Create New Rental Request Service
 */
async function createRentalRequest(
    payload: ICreateRentalRequestPayload,
    tenantId: string,
) {
    const propertyId = validateString(payload.propertyId, "Property ID")!;
    const message = validateString(payload.message, "Message", false);

    // Validate requestedMoveIn date
    if (!payload.requestedMoveIn) {
        throw new AppError(
            status.BAD_REQUEST,
            "Requested move-in date is required.",
        );
    }
    const moveInDate = new Date(payload.requestedMoveIn);
    if (isNaN(moveInDate.getTime())) {
        throw new AppError(
            status.BAD_REQUEST,
            "Invalid requested move-in date.",
        );
    }
    if (moveInDate < new Date()) {
        throw new AppError(
            status.BAD_REQUEST,
            "Requested move-in date must be in the future.",
        );
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });
    if (!property) {
        throw new AppError(status.NOT_FOUND, "Property not found.");
    }

    // Check if property is AVAILABLE
    if (property.status !== PropertyStatus.AVAILABLE) {
        throw new AppError(
            status.BAD_REQUEST,
            "This property is not available for rent.",
        );
    }

    // Check if tenant has already requested this property
    const existingRequest = await prisma.rentalRequest.findUnique({
        where: {
            tenantId_propertyId: {
                tenantId,
                propertyId,
            },
        },
    });
    if (existingRequest) {
        throw new AppError(
            status.CONFLICT,
            "You have already requested to rent this property.",
        );
    }

    // Create rental request in database
    const rentalRequest = await prisma.rentalRequest.create({
        data: {
            propertyId,
            tenantId,
            requestedMoveIn: moveInDate,
            message: message ? message.trim() : null,
        },
        include: {
            property: true,
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    return rentalRequest;
}

/**
 * Get All Rental Requests (Admin)
 */
async function getAllRentalRequests(query: IQueryOptions) {
    const { page, limit, skip, sortBy, sortOrder, search, filters } =
        parseQuery(
            query,
            ["status", "propertyId", "tenantId"],
            ["createdAt", "requestedMoveIn"],
        );

    const whereConditions: Prisma.RentalRequestWhereInput = { ...filters };

    if (search) {
        whereConditions.OR = [
            { message: { contains: search, mode: "insensitive" } },
            { property: { title: { contains: search, mode: "insensitive" } } },
        ];
    }

    const rentals = await prisma.rentalRequest.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            property: {
                include: {
                    landlord: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    const total = await prisma.rentalRequest.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: rentals,
    };
}

/**
 * Get My Rental Requests (Tenant)
 */
async function getMyRentalRequests(query: IQueryOptions, tenantId: string) {
    const { page, limit, skip, sortBy, sortOrder, search, filters } =
        parseQuery(
            query,
            ["status", "propertyId"],
            ["createdAt", "requestedMoveIn"],
        );

    const whereConditions: Prisma.RentalRequestWhereInput = {
        ...filters,
        tenantId,
    };

    if (search) {
        whereConditions.OR = [
            { message: { contains: search, mode: "insensitive" } },
            { property: { title: { contains: search, mode: "insensitive" } } },
        ];
    }

    const rentals = await prisma.rentalRequest.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            property: {
                include: {
                    landlord: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
        },
    });

    const total = await prisma.rentalRequest.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: rentals,
    };
}

/**
 * Get Incoming Rental Requests (Landlord)
 */
async function getIncomingRentalRequests(
    query: IQueryOptions,
    landlordId: string,
) {
    const { page, limit, skip, sortBy, sortOrder, search, filters } =
        parseQuery(
            query,
            ["status", "propertyId"],
            ["createdAt", "requestedMoveIn"],
        );

    const whereConditions: Prisma.RentalRequestWhereInput = {
        ...filters,
        property: {
            landlordId,
        },
    };

    if (search) {
        whereConditions.OR = [
            { message: { contains: search, mode: "insensitive" } },
            { tenant: { name: { contains: search, mode: "insensitive" } } },
        ];
    }

    const rentals = await prisma.rentalRequest.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            property: true,
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    const total = await prisma.rentalRequest.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: rentals,
    };
}

/**
 * Get Rental Request By Id
 */
async function getRentalRequestById(
    id: string,
    user: { id: string; role: Role },
) {
    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id },
        include: {
            property: {
                include: {
                    landlord: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });

    if (!rentalRequest) {
        throw new AppError(status.NOT_FOUND, "Rental request not found.");
    }

    // Role verification
    if (user.role === Role.TENANT && rentalRequest.tenantId !== user.id) {
        throw new AppError(
            status.FORBIDDEN,
            "You are not authorized to view this rental request.",
        );
    }

    return rentalRequest;
}

/**
 * Update Rental Request Status
 */
async function updateRentalRequestStatus(
    id: string,
    payload: IUpdateRentalRequestStatusPayload,
    user: { id: string; role: Role },
) {
    const statusVal = payload.status;
    if (!statusVal || !Object.values(RentalRequestStatus).includes(statusVal)) {
        throw new AppError(status.BAD_REQUEST, "Invalid status payload.");
    }

    // Find rental request
    const rentalRequest = await prisma.rentalRequest.findUnique({
        where: { id },
        include: { property: true },
    });

    if (!rentalRequest) {
        throw new AppError(status.NOT_FOUND, "Rental request not found.");
    }

    // Landlord role check: verify property ownership
    if (
        user.role === Role.LANDLORD &&
        rentalRequest.property.landlordId !== user.id
    ) {
        throw new AppError(
            status.FORBIDDEN,
            "You are not authorized to update this rental request status.",
        );
    }

    // Return early if status is already correct
    if (rentalRequest.status === statusVal) {
        return rentalRequest;
    }

    // Transaction execution for multiple updates
    const updatedRequest = await prisma.$transaction(async (tx) => {
        if (statusVal === RentalRequestStatus.APPROVED) {
            // Re-fetch property state inside transaction to ensure current status is checked safely
            const property = await tx.property.findUnique({
                where: { id: rentalRequest.propertyId },
            });

            if (!property || property.status !== PropertyStatus.AVAILABLE) {
                throw new AppError(
                    status.BAD_REQUEST,
                    "This property is not available for rent (already rented or unavailable).",
                );
            }

            // Update property status to RENTED
            await tx.property.update({
                where: { id: rentalRequest.propertyId },
                data: { status: PropertyStatus.RENTED },
            });

            // Reject all other pending rental requests for the same property
            await tx.rentalRequest.updateMany({
                where: {
                    propertyId: rentalRequest.propertyId,
                    id: { not: rentalRequest.id },
                    status: RentalRequestStatus.PENDING,
                },
                data: { status: RentalRequestStatus.REJECTED },
            });
        } else if (
            (rentalRequest.status === RentalRequestStatus.APPROVED ||
                rentalRequest.status === RentalRequestStatus.ACTIVE) &&
            (statusVal === RentalRequestStatus.REJECTED ||
                statusVal === RentalRequestStatus.COMPLETED ||
                statusVal === RentalRequestStatus.PENDING)
        ) {
            // Revert property status back to AVAILABLE if the previous status was APPROVED/ACTIVE
            // and is now REJECTED/COMPLETED/PENDING
            await tx.property.update({
                where: { id: rentalRequest.propertyId },
                data: { status: PropertyStatus.AVAILABLE },
            });
        }

        // Update the rental request status itself
        const updated = await tx.rentalRequest.update({
            where: { id },
            data: { status: statusVal },
            include: {
                property: true,
                tenant: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return updated;
    });

    return updatedRequest;
}

/**
 * Export Rental Requests Service
 */
export const rentalsService = {
    createRentalRequest,
    getAllRentalRequests,
    getMyRentalRequests,
    getIncomingRentalRequests,
    getRentalRequestById,
    updateRentalRequestStatus,
};

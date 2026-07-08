/**
 * Node Modules
 */
import status from "http-status";

/**
 * Local Modules
 */
import { PropertyStatus } from "../../../generated/prisma/enums";
import { AppError } from "../../utils/AppError";
import { prisma } from "../../utils/prisma";
import { IQueryOptions, parseQuery } from "../../utils/queryHelpers";
import {
    validateInteger,
    validatePositiveNumber,
    validateString,
    validateStringArray,
} from "../../utils/validation";

/**
 * Get All Properties Service
 */
const getAllPropertiesService = async (query: IQueryOptions) => {
    const { page, limit, skip, sortBy, sortOrder, search, filters } =
        parseQuery(
            query,
            [
                "city",
                "categoryId",
                "status",
                "bedrooms",
                "bathrooms",
                "minPrice",
                "maxPrice",
            ],
            [
                "createdAt",
                "rentAmount",
                "bedrooms",
                "bathrooms",
                "propertySize",
            ],
        );

    const whereConditions: Record<string, any> = {};

    // Filter by city (case-insensitive contains search)
    if (filters.city) {
        whereConditions.city = { contains: filters.city, mode: "insensitive" };
    }

    // Filter by categoryId
    if (filters.categoryId) {
        whereConditions.categoryId = filters.categoryId;
    }

    // Filter by status: default to AVAILABLE unless other statuses are explicitly passed
    if (filters.status) {
        whereConditions.status = filters.status;
    } else {
        whereConditions.status = PropertyStatus.AVAILABLE;
    }

    // Filter by bedrooms
    if (filters.bedrooms !== undefined) {
        const bedroomsNum = Number(filters.bedrooms);
        if (!isNaN(bedroomsNum)) {
            whereConditions.bedrooms = bedroomsNum;
        }
    }

    // Filter by bathrooms
    if (filters.bathrooms !== undefined) {
        const bathroomsNum = Number(filters.bathrooms);
        if (!isNaN(bathroomsNum)) {
            whereConditions.bathrooms = bathroomsNum;
        }
    }

    // Filter by rent range (minPrice & maxPrice)
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
        whereConditions.rentAmount = {};
        if (filters.minPrice !== undefined) {
            whereConditions.rentAmount.gte = Number(filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            whereConditions.rentAmount.lte = Number(filters.maxPrice);
        }
    }

    // Search in title, description, and address
    if (search) {
        whereConditions.OR = [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { address: { contains: search, mode: "insensitive" } },
        ];
    }

    const properties = await prisma.property.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
        include: {
            category: true,
            landlord: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });

    const total = await prisma.property.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: properties,
    };
};

/**
 * Get Property by Id Service
 */
const getPropertyByIdService = async (propertyId: string) => {
    const property = await prisma.property.findUniqueOrThrow({
        where: { id: propertyId },
        include: {
            category: true,
            landlord: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        omit: {
            landlordId: true,
            categoryId: true,
        },
    });

    return property;
};

/**
 * Create New Property Service
 */
const createPropertyService = async (payload: any, landlordId: string) => {
    const title = validateString(payload.title, "Title")!;
    const description = validateString(payload.description, "Description")!;
    const address = validateString(payload.address, "Address")!;
    const city = validateString(payload.city, "City")!;
    const rentAmount = validatePositiveNumber(
        payload.rentAmount,
        "Rent amount",
    )!;
    const bedrooms = validateInteger(payload.bedrooms, "Bedrooms", { min: 0 })!;
    const bathrooms = validateInteger(payload.bathrooms, "Bathrooms", {
        min: 0,
    })!;
    const categoryId = validateString(payload.categoryId, "Category ID")!;

    const area = validateString(payload.area, "Area", false);
    const postalCode = validateString(payload.postalCode, "Postal code", false);
    const propertySize = validateInteger(
        payload.propertySize,
        "Property size",
        {
            isRequired: false,
            min: 1,
        },
    );
    const images = validateStringArray(payload.images, "Images", false) || [];
    const amenities =
        validateStringArray(payload.amenities, "Amenities", false) || [];

    // Verify Category exists
    await prisma.category.findUniqueOrThrow({
        where: { id: categoryId },
    });

    // Create property in database
    const property = await prisma.property.create({
        data: {
            title: title.trim(),
            description: description.trim(),
            address: address.trim(),
            city: city.trim(),
            area: area ? area.trim() : null,
            postalCode: postalCode ? postalCode.trim() : null,
            images: images || [],
            rentAmount,
            bedrooms,
            bathrooms,
            propertySize: propertySize || null,
            amenities: amenities || [],
            landlordId,
            categoryId,
        },
        include: {
            category: true,
            landlord: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
        omit: {
            landlordId: true,
            categoryId: true,
        },
    });

    return property;
};

/**
 * Get My Properties Service
 */
const getMyPropertiesService = async () => {
    return [];
};

/**
 * Update Property Service
 */
const updatePropertyService = async () => {
    return [];
};

/**
 * Update Property Status Service
 */
const updatePropertyStatusService = async () => {
    return [];
};

/**
 * Delete Property Service
 */
const deletePropertyService = async () => {
    return [];
};

/**
 * Export Property Service
 */
export const propertiesService = {
    getAllPropertiesService,
    getPropertyByIdService,
    createPropertyService,
    getMyPropertiesService,
    updatePropertyService,
    updatePropertyStatusService,
    deletePropertyService,
};

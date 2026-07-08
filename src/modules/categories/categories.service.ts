import status from "http-status";

/**
 * Local Modules
 */
import { AppError } from "../../utils/AppError";
import { prisma } from "../../utils/prisma";
import { parseQuery, IQueryOptions } from "../../utils/queryHelpers";
import { validateString } from "../../utils/validation";
import { ICreateCategoryPayload } from "./categories.interface";

/**
 * Create New Category
 */
async function createNewCategory(payload: ICreateCategoryPayload) {
    const trimmedName = validateString(payload.name, "Category name")!;
    const trimmedSlug = validateString(payload.slug, "Category slug")!.toLowerCase();

    // Check slug pattern (alphanumeric and hyphens only)
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(trimmedSlug)) {
        throw new AppError(
            status.BAD_REQUEST,
            "Slug must contain only lowercase alphanumeric characters and hyphens.",
        );
    }

    // Check if category name is already registered
    const existingName = await prisma.category.findUnique({
        where: { name: trimmedName },
    });
    if (existingName) {
        throw new AppError(
            status.CONFLICT,
            "Category with this name already exists.",
        );
    }

    // Check if category slug is already registered
    const existingSlug = await prisma.category.findUnique({
        where: { slug: trimmedSlug },
    });
    if (existingSlug) {
        throw new AppError(
            status.CONFLICT,
            "Category with this slug already exists.",
        );
    }

    // Create category in database
    const category = await prisma.category.create({
        data: {
            name: trimmedName,
            slug: trimmedSlug,
        },
    });

    return category;
}

/**
 * Get All Categories
 */
async function getAllCategories(query: IQueryOptions) {
    const { page, limit, skip, sortBy, sortOrder, search, filters } = parseQuery(
        query,
        ["name", "slug"],
        ["createdAt", "name", "slug"],
    );

    const whereConditions: Record<string, any> = { ...filters };

    if (search) {
        whereConditions.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { slug: { contains: search, mode: "insensitive" } },
        ];
    }

    const categories = await prisma.category.findMany({
        where: whereConditions,
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder,
        },
    });

    const total = await prisma.category.count({
        where: whereConditions,
    });

    return {
        meta: {
            page,
            limit,
            total,
        },
        data: categories,
    };
}

/**
 * Update Category
 */
async function updateCategory(
    id: string,
    payload: Partial<ICreateCategoryPayload>,
) {
    // Check if category exists
    await prisma.category.findUniqueOrThrow({
        where: { id },
    });

    // Validate payload keys
    const keys = Object.keys(payload);
    if (keys.length === 0) {
        throw new AppError(
            status.BAD_REQUEST,
            "At least one field to update must be provided.",
        );
    }

    const allowedKeys: (keyof ICreateCategoryPayload)[] = ["name", "slug"];
    const invalidKeys = keys.filter((key) => !allowedKeys.includes(key as any));
    if (invalidKeys.length > 0) {
        throw new AppError(
            status.BAD_REQUEST,
            `Updating field(s) '${invalidKeys.join(", ")}' is not allowed.`,
        );
    }

    const updateData: Partial<ICreateCategoryPayload> = {};

    // Validate name if provided
    if (payload.name !== undefined) {
        const trimmedName = validateString(payload.name, "Category name")!;

        // Check if name is unique among other categories
        const existingName = await prisma.category.findFirst({
            where: {
                name: trimmedName,
                id: { not: id },
            },
        });
        if (existingName) {
            throw new AppError(
                status.CONFLICT,
                "Category with this name already exists.",
            );
        }
        updateData.name = trimmedName;
    }

    // Validate slug if provided
    if (payload.slug !== undefined) {
        const trimmedSlug = validateString(payload.slug, "Category slug")!.toLowerCase();

        // Check slug pattern
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(trimmedSlug)) {
            throw new AppError(
                status.BAD_REQUEST,
                "Slug must contain only lowercase alphanumeric characters and hyphens.",
            );
        }

        // Check if slug is unique among other categories
        const existingSlug = await prisma.category.findFirst({
            where: {
                slug: trimmedSlug,
                id: { not: id },
            },
        });
        if (existingSlug) {
            throw new AppError(
                status.CONFLICT,
                "Category with this slug already exists.",
            );
        }
        updateData.slug = trimmedSlug;
    }

    // Update category in database
    const updatedCategory = await prisma.category.update({
        where: { id },
        data: updateData,
    });

    return updatedCategory;
}

/**
 * Delete Category
 */
async function deleteCategory(id: string) {
    // Check if category exists
    await prisma.category.findUniqueOrThrow({
        where: { id },
    });

    // Check if category is associated with any properties
    const propertyCount = await prisma.property.count({
        where: { categoryId: id },
    });

    if (propertyCount > 0) {
        throw new AppError(
            status.CONFLICT,
            "Cannot delete category because it is associated with existing properties.",
        );
    }

    // Delete category
    const deletedCategory = await prisma.category.delete({
        where: { id },
    });

    return deletedCategory;
}

export const categoriesService = {
    createNewCategory,
    deleteCategory,
    getAllCategories,
    updateCategory,
};

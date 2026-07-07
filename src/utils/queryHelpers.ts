export interface IQueryOptions {
    page?: string | number;
    limit?: string | number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    search?: string;
    [key: string]: any;
}

export interface IParsedQuery {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: "asc" | "desc";
    search?: string;
    filters: Record<string, any>;
}

/**
 * Reusable utility to parse Express query parameters safely for pagination, sorting, search and filters.
 */
export const parseQuery = (
    query: IQueryOptions,
    allowedFilters: string[],
    allowedSortFields: string[] = ["createdAt"],
): IParsedQuery => {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const skip = (page - 1) * limit;

    const sortBy = allowedSortFields.includes(query.sortBy || "")
        ? (query.sortBy as string)
        : allowedSortFields[0] || "createdAt";

    const sortOrder: "asc" | "desc" =
        query.sortOrder === "asc" ? "asc" : "desc";
    const search = query.search?.trim();

    const filters: Record<string, any> = {};
    for (const key of allowedFilters) {
        if (
            query[key] !== undefined &&
            query[key] !== null &&
            query[key] !== ""
        ) {
            filters[key] = query[key];
        }
    }

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
        search,
        filters,
    };
};

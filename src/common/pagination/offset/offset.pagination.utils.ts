// src/common/pagination/offset/offset.pagination.utils.ts
export const calculateOffsetPaginationMetadata = (
    total: number,
    limit: number,
    page: number,
) => {
    const totalPages = Math.ceil(total / limit);
    return { total, totalPages, page, limit };
};

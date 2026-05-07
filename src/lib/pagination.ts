export type PaginationState = {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	startIndex: number;
	endIndex: number;
	hasPrev: boolean;
	hasNext: boolean;
	prevPage?: number;
	nextPage?: number;
};

export function parsePageNumber(raw: string | string[] | undefined): number {
	const value = Array.isArray(raw) ? raw[0] : raw;
	if (!value) return 1;
	const parsed = Number.parseInt(value, 10);
	if (!Number.isFinite(parsed) || parsed < 1) return 1;
	return parsed;
}

export function paginate<T>(items: T[], pageSize: number | undefined, page: number): {
	items: T[];
	state: PaginationState | undefined;
} {
	if (!pageSize || pageSize <= 0) {
		return { items, state: undefined };
	}

	const totalItems = items.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const currentPage = Math.min(Math.max(1, page), totalPages);
	const startIndex = (currentPage - 1) * pageSize;
	const endIndex = Math.min(startIndex + pageSize, totalItems);

	return {
		items: items.slice(startIndex, endIndex),
		state: {
			page: currentPage,
			pageSize,
			totalItems,
			totalPages,
			startIndex,
			endIndex,
			hasPrev: currentPage > 1,
			hasNext: currentPage < totalPages,
			prevPage: currentPage > 1 ? currentPage - 1 : undefined,
			nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
		},
	};
}


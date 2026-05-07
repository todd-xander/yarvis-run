export type PagedSearchParams = {
	page?: string | string[];
};

export type AsyncSearchPageProps = {
	searchParams?: Promise<PagedSearchParams>;
};

export type AsyncDynamicPathPageProps = {
	params: Promise<{ path: string[] }>;
	searchParams?: Promise<PagedSearchParams>;
};

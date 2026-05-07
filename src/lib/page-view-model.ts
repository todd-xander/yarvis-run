import type { ReactNode } from "react";
import type { ContentFrontmatter } from "@/lib/content-types";
import type { PaginationState } from "@/lib/pagination";

export type PageTopBarAuthor = {
	name: string;
	avatar?: string;
	description?: string;
	href: string;
};

export type PageViewModel = {
	frontmatter: ContentFrontmatter;
	paginationState?: PaginationState;
	paginationBasePath?: string;
	rightSlot?: ReactNode;
	topBarAuthor?: PageTopBarAuthor;
	identityAvatarTitle?: string;
	wordCount: number;
	body: string;
	assetPrefix: string;
};

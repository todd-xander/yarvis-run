import "server-only";

import type { DimensionItem, Post } from "@/lib/content-types";
import { getDimensionRoute } from "@/lib/content-paths";
import { getSiteConfig } from "@/lib/site-config";
import {
	collectDimensionIdsFromPosts,
	enrichDimensionItem,
	loadAllMarkdownPosts,
	sortPostsByPublishedAt,
} from "@/lib/content-repository-scan";

const shouldCacheContent = process.env.NODE_ENV === "production";

let cachedPosts: Post[] | undefined;
let cachedDimsMap: Record<string, DimensionItem[]> | undefined;

export function getAllPosts(): Post[] {
	const load = () => sortPostsByPublishedAt(loadAllMarkdownPosts());
	if (!shouldCacheContent) return load();
	if (!cachedPosts) cachedPosts = load();
	return cachedPosts;
}

export function getDimsMap(): Record<string, DimensionItem[]> {
	const load = () => {
		const result: Record<string, DimensionItem[]> = {};
		const posts = getAllPosts();
		for (const dim of getSiteConfig().dimensions) {
			if (!dim.postField) continue;
			const ids = collectDimensionIdsFromPosts(posts, dim.postField);
			const lookupDir = getDimensionRoute(dim);
			result[dim.postField] = ids.map((id) => enrichDimensionItem(id, dim.postField, lookupDir));
		}
		return result;
	};

	if (!shouldCacheContent) return load();
	if (!cachedDimsMap) cachedDimsMap = load();
	return cachedDimsMap;
}

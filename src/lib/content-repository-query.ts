import "server-only";

import {
	getAdjacentPosts as queryAdjacentPosts,
	getPostBySlug,
	resolvePostsWithRelations,
} from "@/lib/content-queries";
import type {
	DimensionItem,
	DimensionItemWithPostCount,
	DimensionPostField,
	FeedItem,
	Post,
} from "@/lib/content-types";
import { discoverAllSections, getSiteConfig } from "@/lib/site-config";
import {
	collectDimensionIdsFromPosts,
	collectShowpieceItems,
	enrichDimensionItem,
	filterPostsByDimensionField,
} from "@/lib/content-repository-scan";
import { getAllPosts, getDimsMap } from "@/lib/content-repository-index";
import { getDimensionRoute } from "@/lib/content-paths";

function buildSearchText(post: Post & { dims: Record<string, DimensionItem> }) {
	const dimNames = Object.values(post.dims).map((d) => d.name);
	return [post.title, post.content, ...dimNames].join(" ").toLowerCase();
}

function resolveDimensionLookupDir(postField: DimensionPostField) {
	const dim = getSiteConfig().dimensions.find((item) => item.postField === postField);
	return dim ? getDimensionRoute(dim) : postField;
}

export function listResolvedPosts() {
	return resolvePostsWithRelations(getAllPosts(), getDimsMap());
}

export function listFeedItems(): FeedItem[] {
	const resolvedPosts = listResolvedPosts().map((post): FeedItem => ({ ...post, type: "post" as const }));
	const showpieces = collectShowpieceItems(getDimsMap());
	return [...resolvedPosts, ...showpieces].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function listSearchablePosts() {
	return listResolvedPosts().map((post) => ({
		...post,
		searchText: buildSearchText(post),
	}));
}

export function getDimensionPageData(postField: DimensionPostField, itemId: string) {
	const lookupDir = resolveDimensionLookupDir(postField);
	const item = enrichDimensionItem(itemId, lookupDir);
	const posts = resolvePostsWithRelations(
		filterPostsByDimensionField(getAllPosts(), itemId, postField),
		getDimsMap(),
	);
	return { item, posts };
}

export function getPostPageData(slug: string) {
	const post = getPostBySlug(getAllPosts(), slug);
	if (!post) return undefined;
	const resolved = resolvePostsWithRelations([post], getDimsMap());
	return resolved[0] || undefined;
}

export function listDimensionItemsWithCounts(postField: DimensionPostField): DimensionItemWithPostCount[] {
	const lookupDir = resolveDimensionLookupDir(postField);
	const ids = collectDimensionIdsFromPosts(getAllPosts(), postField);
	const counts = new Map<string, number>();
	for (const post of getAllPosts()) {
		const id = (post as Record<string, unknown>)[postField];
		if (typeof id !== "string" || !id) continue;
		counts.set(id, (counts.get(id) || 0) + 1);
	}
	return ids.map((id) => {
		const enriched = enrichDimensionItem(id, lookupDir);
		return {
			...enriched,
			postCount: counts.get(id) || 0,
		};
	});
}

export function listDimensionItemIds(postField: DimensionPostField) {
	return collectDimensionIdsFromPosts(getAllPosts(), postField);
}

export function listPostSlugs() {
	const posts = getAllPosts();
	const sections = discoverAllSections();
	return posts.map((post) => {
		const sectionName = post.id.split("/")[0];
		const section = sections.find((item) => item.name === sectionName);
		return { slug: post.slug, section: section?.route || sectionName };
	});
}

export function getAdjacentPosts(slug: string) {
	return queryAdjacentPosts(listResolvedPosts(), slug);
}

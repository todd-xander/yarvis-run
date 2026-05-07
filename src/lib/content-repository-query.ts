import "server-only";

import { CONTENT_DIMENSIONS, CONTENT_ROUTE_SEGMENTS } from "@/lib/content-constants";
import {
	getAdjacentPosts as queryAdjacentPosts,
	getPostBySlug,
	resolvePostsWithRelations,
} from "@/lib/content-queries";
import type {
	CatalogItemData,
	CatalogViewModel,
	DimensionItemWithPostCount,
	DimensionPostField,
	FeedItem,
	PostImage,
	PostRouteEntry,
	ResolvedPost,
	SearchablePost,
} from "@/lib/content-types";
import { discoverAllSections, getSiteConfig } from "@/lib/site-config";
import {
	ANONYMOUS_AUTHOR_ID,
	collectDimensionIdsFromPosts,
	collectShowpieceItems,
	enrichDimensionItem,
	filterPostsByDimensionField,
	normalizeDimensionValue,
} from "@/lib/content-repository-scan";
import { getAllPosts, getDimsMap } from "@/lib/content-repository-index";
import { getDimensionRoute } from "@/lib/content-paths";

function buildSearchText(post: Pick<ResolvedPost, "title" | "content" | "dims">) {
	const dimNames = Object.values(post.dims).map((d) => d.name);
	return [post.title, post.content, ...dimNames].join(" ").toLowerCase();
}

function resolveDimensionLookupDir(postField: DimensionPostField) {
	const dim = getSiteConfig().dimensions.find((item) => item.postField === postField);
	return dim ? getDimensionRoute(dim) : postField;
}

function sortDimensionItems(
	postField: DimensionPostField,
	items: DimensionItemWithPostCount[],
) {
	if (postField !== CONTENT_DIMENSIONS.author) return items;
	return items.filter((item) => item.id !== ANONYMOUS_AUTHOR_ID);
}

function getDimensionIdsWithFeedFallback(postField: DimensionPostField, showpieces = collectShowpieceItems()) {
	const ids = new Set(collectDimensionIdsFromPosts(getAllPosts(), postField));
	for (const item of showpieces) {
		const dimId = item.dims[postField]?.id;
		if (dimId) ids.add(dimId);
	}
	return [...ids];
}

export function listResolvedPosts(): ResolvedPost[] {
	return resolvePostsWithRelations(getAllPosts(), getDimsMap());
}

export function listFeedItems(): FeedItem[] {
	const resolvedPosts = listResolvedPosts().map((post): ResolvedPost & { type: "post" } => ({ ...post, type: "post" }));
	const showpieces = collectShowpieceItems();
	return [...resolvedPosts, ...showpieces].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function listSectionFeedItems(section: string): FeedItem[] {
	return listFeedItems().filter((item) => item.id.startsWith(`${section}/`));
}

export function listDimensionFeedItems(postField: DimensionPostField, itemId: string): FeedItem[] {
	return listFeedItems().filter((item) => item.dims[postField]?.id === itemId);
}

function isUncategorizedItem(item: Pick<FeedItem, "author" | "category">) {
	return !item.author || !item.category;
}

export function listUncategorizedFeedItems(): FeedItem[] {
	return listFeedItems().filter(isUncategorizedItem);
}

export function listGalleryImages(): Array<PostImage & { postId: string; postSlug: string; postTitle: string; publishedAt: Date }> {
	return listFeedItems()
		.flatMap((item) => item.images.map((image) => ({
			...image,
			postId: item.id,
			postSlug: item.slug,
			postTitle: item.title,
			publishedAt: item.publishedAt,
		})));
}

export function listSearchablePosts(): SearchablePost[] {
	return listResolvedPosts().map((post) => ({
		...post,
		searchText: buildSearchText(post),
	}));
}

export function getDimensionPageData(postField: DimensionPostField, itemId: string) {
	const lookupDir = resolveDimensionLookupDir(postField);
	const item = enrichDimensionItem(itemId, postField, lookupDir);
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
	const showpieces = collectShowpieceItems();
	const ids = getDimensionIdsWithFeedFallback(postField, showpieces);
	const counts = new Map<string, number>();
	for (const post of getAllPosts()) {
		const id = normalizeDimensionValue(post, postField);
		if (!id) continue;
		counts.set(id, (counts.get(id) || 0) + 1);
	}
	for (const item of showpieces) {
		const dimId = item.dims[postField]?.id;
		if (!dimId) continue;
		counts.set(dimId, (counts.get(dimId) || 0) + 1);
	}
	return sortDimensionItems(postField, ids.map((id) => {
		const enriched = enrichDimensionItem(id, postField, lookupDir);
		return {
			...enriched,
			postCount: counts.get(id) || 0,
		};
	}));
}

export function listDimensionItemIds(postField: DimensionPostField) {
	return getDimensionIdsWithFeedFallback(postField);
}

export function listPostSlugs(): PostRouteEntry[] {
	const posts = getAllPosts();
	const sections = discoverAllSections();
	return posts.map((post) => {
		const sectionName = post.id.split("/")[0];
		const section = sections.find((item) => item.slug === sectionName);
		return { slug: post.slug, section: section?.route || sectionName };
	});
}

export function buildCatalogViewModel(dimensions = getSiteConfig().dimensions): CatalogViewModel {
	const otherItems: CatalogItemData[] = [];
	const galleryImages = listGalleryImages();
	if (galleryImages.length > 0) {
		otherItems.push({
			id: CONTENT_ROUTE_SEGMENTS.catalogGallery,
			name: "相册",
			description: "以相册形式浏览所有文章图片",
			postCount: galleryImages.length,
			href: `/${CONTENT_ROUTE_SEGMENTS.catalog}/${CONTENT_ROUTE_SEGMENTS.catalogGallery}`,
		});
	}

	const uncategorizedItems = listUncategorizedFeedItems();
	if (uncategorizedItems.length > 0) {
		otherItems.push({
			id: CONTENT_ROUTE_SEGMENTS.catalogUncategorized,
			name: "未归类",
			description: "缺少作者或分类信息的内容",
			postCount: uncategorizedItems.length,
			href: `/${CONTENT_ROUTE_SEGMENTS.catalog}/${CONTENT_ROUTE_SEGMENTS.catalogUncategorized}`,
		});
	}

	return {
		sections: [
			...dimensions.map((dimension) => ({
				key: dimension.postField,
				basePath: getDimensionRoute(dimension),
				title: dimension.label,
				display: dimension.display,
				items: listDimensionItemsWithCounts(dimension.postField),
			})),
			...(otherItems.length > 0 ? [{
				key: "other",
				basePath: "",
				title: "其他",
				display: "list" as const,
				items: otherItems,
			}] : []),
		],
	};
}

export function getAdjacentPosts(slug: string) {
	return queryAdjacentPosts(listResolvedPosts(), slug);
}

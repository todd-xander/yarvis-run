import "server-only";

import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import { getDimensionRoute, getSectionContentPath, getSectionIndexPath, resolveContentUrl } from "@/lib/content-paths";
import { discoverAllSections, CONTENT_ROOT, getSiteConfig } from "@/lib/site-config";
import type { DataFrontmatter, DimensionItem, DimensionPostField, FeedItem, Post } from "@/lib/content-types";
import { parseContent } from "@/lib/parse-frontmatter";
import { listPostsFromMarkdown } from "@/lib/markdown-content";

const shouldCacheContent = process.env.NODE_ENV === "production";

export const ANONYMOUS_AUTHOR_ID = "anonymous";

export const ANONYMOUS_AUTHOR: DimensionItem = {
	id: ANONYMOUS_AUTHOR_ID,
	name: "Anonymous",
	description: "未单独署名的内容",
};

let cachedShowpieceItems: FeedItem[] | undefined;

export function normalizeDimensionValue(
	post: Post,
	postField: DimensionPostField,
): string | undefined {
	const value = (post as Record<string, unknown>)[postField];
	if (typeof value === "string" && value) return value;
	if (postField === CONTENT_DIMENSIONS.author) return ANONYMOUS_AUTHOR_ID;
	return undefined;
}

export function loadAllMarkdownPosts(): Post[] {
	return listPostsFromMarkdown().filter((post) => post.layout === "post");
}

export function sortPostsByPublishedAt(posts: Post[]) {
	return [...posts].sort((left, right) => {
		const timestampDelta = right.publishedAt.getTime() - left.publishedAt.getTime();
		if (timestampDelta !== 0) return timestampDelta;
		return left.slug.localeCompare(right.slug);
	});
}

export function collectDimensionIdsFromPosts(
	posts: Post[],
	postField: DimensionPostField,
): string[] {
	const ids = new Set<string>();
	for (const post of posts) {
		const value = normalizeDimensionValue(post, postField);
		if (value) ids.add(value);
	}
	return [...ids];
}

function buildDimensionFallbackItem(
	id: string,
	postField: DimensionPostField,
): DimensionItem {
	if (postField === CONTENT_DIMENSIONS.author) {
		if (id === ANONYMOUS_AUTHOR_ID) {
			return ANONYMOUS_AUTHOR;
		}

		return {
			id,
			name: id,
			description: `${id}的主页`,
		};
	}

	return { id, name: id };
}

export function enrichDimensionItem(
	id: string,
	postField: DimensionPostField,
	dimDir: string | undefined,
): DimensionItem {
	const base = buildDimensionFallbackItem(id, postField);
	if (!dimDir) return base;
	const filePath = getSectionContentPath(CONTENT_ROOT, dimDir, `${id}.md`);
	if (!fs.existsSync(filePath)) return base;
	const fm = parseContent(filePath).frontmatter;
	return {
		id,
		name: fm.title || id,
		description: fm.description || "",
		avatar: ("avatar" in fm ? fm.avatar : undefined) as string | undefined,
	};
}

export function filterPostsByDimensionField(
	posts: Post[],
	itemId: string,
	postField: DimensionPostField,
) {
	return posts.filter((post) => normalizeDimensionValue(post, postField) === itemId);
}

function getDimensionLookupDir(postField: DimensionPostField) {
	const dimension = getSiteConfig().dimensions.find((item) => item.postField === postField);
	return dimension ? getDimensionRoute(dimension) : postField;
}

function resolveShowpieceAsset(sectionSlug: string, entryName: string, src: string | undefined) {
	if (!src || src.startsWith("http") || src.startsWith("/")) return src;
	return resolveContentUrl(CONTENT_ROOT, `${sectionSlug}/${entryName}/${src}`);
}

function buildShowpieceDims(
	frontmatter: Pick<DataFrontmatter, "author" | "category">,
	authorLookupDir: string,
	categoryLookupDir: string,
) {
	const authorId = typeof frontmatter.author === "string" && frontmatter.author
		? frontmatter.author
		: ANONYMOUS_AUTHOR_ID;
	const categoryId = typeof frontmatter.category === "string" && frontmatter.category
		? frontmatter.category
		: undefined;
	const dims: Record<string, DimensionItem> = {
		[CONTENT_DIMENSIONS.author]: enrichDimensionItem(authorId, CONTENT_DIMENSIONS.author, authorLookupDir),
	};

	if (categoryId) {
		dims[CONTENT_DIMENSIONS.category] = enrichDimensionItem(categoryId, CONTENT_DIMENSIONS.category, categoryLookupDir);
	}

	return dims;
}

function scanShowpieceItems(): FeedItem[] {
	const sections = discoverAllSections();
	const authorLookupDir = getDimensionLookupDir(CONTENT_DIMENSIONS.author);
	const categoryLookupDir = getDimensionLookupDir(CONTENT_DIMENSIONS.category);

	const items: FeedItem[] = [];
	for (const section of sections) {
		const sectionPath = getSectionContentPath(CONTENT_ROOT, section.slug);
		const indexPath = getSectionIndexPath(CONTENT_ROOT, section.slug);
		if (!fs.existsSync(sectionPath) || !fs.existsSync(indexPath)) continue;

		const indexFm = parseContent(indexPath).frontmatter;
		const entries = fs.readdirSync(sectionPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			const { frontmatter, body } = parseContent(path.join(sectionPath, entry.name));
			if (frontmatter.layout !== "showpiece") continue;

			const resolvedCover = resolveShowpieceAsset(section.slug, entry.name, frontmatter.cover);
			const wordCount = body.replace(/\s+/g, "").length;
			const dims = buildShowpieceDims(frontmatter, authorLookupDir, categoryLookupDir);

			items.push({
				type: "showpiece",
				id: `${section.slug}/${entry.name}`,
				slug: entry.name,
				sectionLabel: indexFm.title || section.title,
				title: frontmatter.title,
				publishedAt: frontmatter.publishedAt,
				layout: "post",
				author: frontmatter.author,
				category: frontmatter.category,
				cover: resolvedCover,
				description: frontmatter.description,
				location: frontmatter.location,
				content: body,
				wordCount,
				readingMinutes: Math.max(1, Math.ceil(wordCount / 300)),
				images: [],
				dims,
			});
		}
	}

	return items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

export function collectShowpieceItems(): FeedItem[] {
	if (!shouldCacheContent) return scanShowpieceItems();
	if (!cachedShowpieceItems) cachedShowpieceItems = scanShowpieceItems();
	return cachedShowpieceItems;
}

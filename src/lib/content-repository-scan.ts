import "server-only";

import fs from "node:fs";
import path from "node:path";
import { APP_NAME } from "@/lib/app-config";
import { CONTENT_DIMENSIONS } from "@/lib/content-constants";
import { getSectionContentPath, getSectionIndexPath, resolveContentUrl } from "@/lib/content-paths";
import { discoverAllSections, CONTENT_ROOT } from "@/lib/site-config";
import type { DimensionItem, DimensionPostField, FeedItem, Post } from "@/lib/content-types";
import { parseContent } from "@/lib/parse-frontmatter";
import { listPostsFromMarkdown } from "@/lib/markdown-content";

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
		const value = (post as Record<string, unknown>)[postField];
		if (typeof value === "string" && value) ids.add(value);
	}
	return [...ids];
}

export function enrichDimensionItem(id: string, dimDir: string | undefined): DimensionItem {
	const base: DimensionItem = { id, name: id };
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
	return posts.filter((post) => (post as Record<string, unknown>)[postField] === itemId);
}

export function collectShowpieceItems(
	dimsMap: Record<string, DimensionItem[]>,
): FeedItem[] {
	const sections = discoverAllSections().filter((section) => section.layout === "card");
	const defaultAuthor = dimsMap[CONTENT_DIMENSIONS.author]?.[0] || { id: "default", name: APP_NAME };

	const items: FeedItem[] = [];
	for (const section of sections) {
		const sectionPath = getSectionContentPath(CONTENT_ROOT, section.name);
		const indexPath = getSectionIndexPath(CONTENT_ROOT, section.name);
		if (!fs.existsSync(sectionPath) || !fs.existsSync(indexPath)) continue;

		const indexFm = parseContent(indexPath).frontmatter;
		const entries = fs.readdirSync(sectionPath, { withFileTypes: true });
		for (const entry of entries) {
			if (!entry.isDirectory()) continue;
			const { frontmatter, body } = parseContent(path.join(sectionPath, entry.name));
			if (frontmatter.layout !== "showpiece") continue;

			const resolvedCover = frontmatter.cover && !frontmatter.cover.startsWith("http") && !frontmatter.cover.startsWith("/")
				? resolveContentUrl(CONTENT_ROOT, `${section.name}/${entry.name}/${frontmatter.cover}`)
				: frontmatter.cover;
			const wordCount = body.replace(/\s+/g, "").length;

			items.push({
				type: "showpiece",
				id: `${section.name}/${entry.name}`,
				slug: entry.name,
				title: frontmatter.title,
				publishedAt: frontmatter.publishedAt,
				layout: "post",
				cover: resolvedCover,
				description: frontmatter.description,
				content: body,
				wordCount,
				readingMinutes: Math.max(1, Math.ceil(wordCount / 300)),
				images: [],
				dims: {
					[CONTENT_DIMENSIONS.author]: defaultAuthor,
					[CONTENT_DIMENSIONS.category]: { id: section.name, name: indexFm.title || section.name },
				},
			});
		}
	}

	return items.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

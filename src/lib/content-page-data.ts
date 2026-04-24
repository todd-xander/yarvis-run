import "server-only";

import fs from "node:fs";
import type { ContentFrontmatter, DimensionPostField } from "@/lib/content-types";
import {
	getAdjacentPosts,
	getDimensionPageData,
	getPostPageData,
} from "@/lib/content-repository";
import { readFolderDocument, readSectionIndex, resolveCoverImage, resolveRelativeAssets } from "@/lib/folder-content";
import { parseContent } from "@/lib/parse-frontmatter";
import { getContentRootIndexPath, getDimensionDocumentPath } from "@/lib/content-paths";
import { CONTENT_ROOT, getSiteConfig } from "@/lib/site-config";

export function getHomePageData(): ContentFrontmatter | undefined {
	const indexPath = getContentRootIndexPath(CONTENT_ROOT);
	if (!fs.existsSync(indexPath)) return undefined;
	return parseContent(indexPath).frontmatter;
}

export function getPostDetailPageData(slug: string) {
	const post = getPostPageData(slug);
	if (!post) return undefined;
	return {
		post,
		adjacent: getAdjacentPosts(slug),
	};
}

export function getSectionIndexData(section: string) {
	return readSectionIndex(section);
}

export function getSectionDetailPageData(section: string, slug: string) {
	const doc = readFolderDocument(section, slug);
	if (!doc) return undefined;

	return {
		slug,
		title: doc.frontmatter.title,
		subtitle: doc.frontmatter.description,
		image: resolveCoverImage(doc),
		body: resolveRelativeAssets(doc.body, doc.assetPrefix),
		badges: doc.frontmatter.layout === "showpiece" ? doc.frontmatter.badge || [] : [],
		meta: doc.frontmatter.layout === "showpiece" ? doc.frontmatter.meta || [] : [],
	};
}

export function getDimensionPageDataWithCover(
	postField: DimensionPostField,
	itemId: string,
) {
	const data = getDimensionPageData(postField, itemId);
	const dim = getSiteConfig().dimensions.find((item) => item.postField === postField);
	const dimFilePath = dim ? getDimensionDocumentPath(CONTENT_ROOT, dim, itemId) : getDimensionDocumentPath(CONTENT_ROOT, { dir: postField, postField }, itemId);
	const cover = fs.existsSync(dimFilePath)
		? parseContent(dimFilePath).frontmatter.cover
		: undefined;

	return {
		...data,
		cover,
	};
}

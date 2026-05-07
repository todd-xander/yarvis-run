import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { ContentFrontmatter, DimensionPostField } from "@/lib/content-types";
import {
	getAdjacentPosts,
	getDimensionPageData,
	getPostPageData,
} from "@/lib/content-repository";
import type { PageViewModel } from "@/lib/page-view-model";
import { parseContent } from "@/lib/parse-frontmatter";
import { getDimensionDocumentPath, getSectionContentPath, resolveContentUrl } from "@/lib/content-paths";
import { CONTENT_ROOT, getSiteConfig } from "@/lib/site-config";

function resolvePageSource(fileOrDirPath: string): {
	markdownPath: string;
	assetDirPath: string;
	fallbackSlug: string;
} | undefined {
	if (!fs.existsSync(fileOrDirPath)) return undefined;

	if (fs.statSync(fileOrDirPath).isDirectory()) {
		const indexPath = path.join(fileOrDirPath, "index.md");
		if (fs.existsSync(indexPath)) {
			return {
				markdownPath: indexPath,
				assetDirPath: fileOrDirPath,
				fallbackSlug: path.basename(fileOrDirPath),
			};
		}

		const sectionIndexPath = path.join(fileOrDirPath, "_index.md");
		if (fs.existsSync(sectionIndexPath)) {
			return {
				markdownPath: sectionIndexPath,
				assetDirPath: fileOrDirPath,
				fallbackSlug: fileOrDirPath === CONTENT_ROOT ? "home" : path.basename(fileOrDirPath),
			};
		}

		return undefined;
	}

	const fileName = path.basename(fileOrDirPath);
	if (!fileName.endsWith(".md")) return undefined;

	if (fileName === "index.md") {
		return {
			markdownPath: fileOrDirPath,
			assetDirPath: path.dirname(fileOrDirPath),
			fallbackSlug: path.basename(path.dirname(fileOrDirPath)),
		};
	}

	if (fileName === "_index.md") {
		const assetDirPath = path.dirname(fileOrDirPath);
		return {
			markdownPath: fileOrDirPath,
			assetDirPath,
			fallbackSlug: assetDirPath === CONTENT_ROOT ? "home" : path.basename(assetDirPath),
		};
	}

	return {
		markdownPath: fileOrDirPath,
		assetDirPath: path.dirname(fileOrDirPath),
		fallbackSlug: path.basename(fileOrDirPath, path.extname(fileOrDirPath)),
	};
}

function resolveRelativeAssets(body: string, assetPrefix: string): string {
	const imgPattern = /(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;
	return body.replace(imgPattern, (match, prefix, src, suffix) => {
		if (src.startsWith("http") || src.startsWith("/")) return match;
		return `${prefix}${assetPrefix}/${src}${suffix}`;
	});
}

function resolvePageAsset(src: string | undefined, assetPrefix: string): string | undefined {
	if (!src) return undefined;
	if (src.startsWith("http") || src.startsWith("/")) return src;
	return `${assetPrefix}/${src}`;
}

export function readPageViewModel(fileOrDirPath: string): PageViewModel | undefined {
	const source = resolvePageSource(fileOrDirPath);
	if (!source) return undefined;

	const { frontmatter, body } = parseContent(source.markdownPath);
	const relativeAssetDir = path.relative(CONTENT_ROOT, source.assetDirPath);
	const assetPrefix = relativeAssetDir ? resolveContentUrl(CONTENT_ROOT, relativeAssetDir) : resolveContentUrl(CONTENT_ROOT, "");
	const normalizedFrontmatter = {
		...frontmatter,
		slug: frontmatter.slug || source.fallbackSlug,
		cover: resolvePageAsset(frontmatter.cover, assetPrefix),
		avatar: resolvePageAsset(frontmatter.avatar, assetPrefix),
	};

	return {
		frontmatter: normalizedFrontmatter,
		paginationState: undefined,
		paginationBasePath: undefined,
		rightSlot: undefined,
		wordCount: body.replace(/\s+/g, "").length,
		body: resolveRelativeAssets(body, assetPrefix),
		assetPrefix,
	};
}

export function getPostDetailPageData(slug: string) {
	const post = getPostPageData(slug);
	if (!post) return undefined;
	return {
		post,
		adjacent: getAdjacentPosts(slug),
	};
}

export function getSectionDetailPageData(section: string, slug: string) {
	return readPageViewModel(getSectionContentPath(CONTENT_ROOT, section, slug))
		|| readPageViewModel(getSectionContentPath(CONTENT_ROOT, section, `${slug}.md`));
}

export function getDimensionPageDataWithCover(
	postField: DimensionPostField,
	itemId: string,
) {
	const data = getDimensionPageData(postField, itemId);
	const dim = getSiteConfig().dimensions.find((item) => item.postField === postField);
	const dimFilePath = dim ? getDimensionDocumentPath(CONTENT_ROOT, dim, itemId) : getDimensionDocumentPath(CONTENT_ROOT, { dir: postField, postField }, itemId);
	const page = readPageViewModel(dimFilePath);
	const fallbackPage: PageViewModel = {
		frontmatter: {
			layout: "feed",
			title: data.item.name,
			slug: itemId,
			publishedAt: new Date(0),
			description: data.item.description,
			avatar: data.item.avatar,
		} satisfies ContentFrontmatter,
		paginationBasePath: undefined,
		paginationState: undefined,
		rightSlot: undefined,
		identityAvatarTitle: data.item.name,
		wordCount: 0,
		body: "",
		assetPrefix: "",
	};

	return {
		...data,
		page: page
			? {
				...page,
				identityAvatarTitle: data.item.name,
			}
			: fallbackPage,
	};
}

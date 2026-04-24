import "server-only";

import fs from "node:fs";
import path from "node:path";
import type { ContentFrontmatter } from "@/lib/content-types";
import { getSectionContentPath, getSectionDocumentPath, getSectionIndexPath, resolveContentUrl } from "@/lib/content-paths";
import { parseContent } from "@/lib/parse-frontmatter";
import { CONTENT_ROOT } from "@/lib/site-config";

export type FolderDocument = {
	slug: string;
	frontmatter: ContentFrontmatter;
	body: string;
	assetPrefix: string;
};

function listFolderSlugs(section: string): string[] {
	const sectionPath = getSectionContentPath(CONTENT_ROOT, section);
	if (!fs.existsSync(sectionPath)) return [];

	return fs
		.readdirSync(sectionPath, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.filter((entry) => fs.existsSync(path.join(sectionPath, entry.name, "index.md")))
		.sort()
		.map((entry) => entry.name);
}

export function readFolderDocument(section: string, slug: string): FolderDocument | undefined {
	const indexPath = getSectionDocumentPath(CONTENT_ROOT, section, slug);
	if (!fs.existsSync(indexPath)) return undefined;

	const { frontmatter, body } = parseContent(indexPath);
	return {
		slug,
		frontmatter,
		body,
		assetPrefix: resolveContentUrl(CONTENT_ROOT, `${section}/${slug}`),
	};
}

export function readSectionIndex(section: string): ContentFrontmatter | undefined {
	const indexPath = getSectionIndexPath(CONTENT_ROOT, section);
	if (!fs.existsSync(indexPath)) return undefined;
	return parseContent(indexPath).frontmatter;
}

export function listFolderDocuments(section: string): FolderDocument[] {
	return listFolderSlugs(section)
		.map((slug) => readFolderDocument(section, slug))
		.filter((doc): doc is FolderDocument => doc !== undefined)
		.sort((a, b) => b.frontmatter.publishedAt.getTime() - a.frontmatter.publishedAt.getTime());
}

export function resolveCoverImage(doc: FolderDocument): string | undefined {
	const image = doc.frontmatter.cover;
	if (!image) return undefined;
	if (image.startsWith("http") || image.startsWith("/")) return image;
	return `${doc.assetPrefix}/${image}`;
}

export function resolveRelativeAssets(body: string, assetPrefix: string): string {
	const imgPattern = /(!\[[^\]]*\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g;
	return body.replace(imgPattern, (_match, prefix, src, suffix) => {
		if (src.startsWith("http") || src.startsWith("/")) return _match;
		return `${prefix}${assetPrefix}/${src}${suffix}`;
	});
}

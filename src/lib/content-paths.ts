import path from "node:path";
import type { CatalogDimension } from "@/lib/content-types";

export function getContentUrlPrefix(contentRoot: string): string {
	return `/${path.basename(contentRoot)}`;
}

export function resolveContentUrl(contentRoot: string, relPath: string): string {
	return `${getContentUrlPrefix(contentRoot)}/${relPath}`;
}

export function getSectionContentPath(contentRoot: string, section: string, ...parts: string[]): string {
	return path.join(contentRoot, section, ...parts);
}

export function getSectionIndexPath(contentRoot: string, section: string): string {
	return getSectionContentPath(contentRoot, section, "_index.md");
}

export function getContentRootIndexPath(contentRoot: string): string {
	return path.join(contentRoot, "_index.md");
}

export function getSectionDocumentPath(
	contentRoot: string,
	section: string,
	slug: string,
): string {
	return getSectionContentPath(contentRoot, section, slug, "index.md");
}

export function getDimensionRoute(dim: Pick<CatalogDimension, "dir" | "postField">): string {
	return dim.dir || dim.postField;
}

export function getDimensionDocumentPath(
	contentRoot: string,
	dim: Pick<CatalogDimension, "dir" | "postField">,
	itemId: string,
): string {
	return getSectionContentPath(contentRoot, getDimensionRoute(dim), `${itemId}.md`);
}

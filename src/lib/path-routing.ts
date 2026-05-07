import type { CatalogDimension } from "@/lib/content-types";
import { CONTENT_ROUTE_SEGMENTS } from "@/lib/content-constants";
import { getDimensionRoute } from "@/lib/content-paths";
import { listDimensionItemIds, listPostSlugs } from "@/lib/content-repository";
import { listFolderDocuments } from "@/lib/folder-content";
import { discoverAllSections, getSiteConfig, type SectionEntry } from "@/lib/site-config";

export type PathPageTarget =
	| { kind: "home" }
	| { kind: "section-index"; section: SectionEntry }
	| { kind: "section-detail"; section: SectionEntry; id: string }
	| { kind: "post-detail"; slug: string }
	| { kind: "dimension-index"; dimension: CatalogDimension }
	| { kind: "dimension-detail"; dimension: CatalogDimension; itemId: string }
	| { kind: "catalog" }
	| { kind: "catalog-gallery" }
	| { kind: "catalog-uncategorized" }
	| { kind: "not-found" };

function getSectionIndexMap(): Map<string, SectionEntry> {
	return new Map(discoverAllSections().map((section) => [section.route, section]));
}

function getDimRoute(dim: CatalogDimension): string {
	return getDimensionRoute(dim);
}

function findDimensionByRoute(route: string): CatalogDimension | undefined {
	return getSiteConfig().dimensions.find((dim) => getDimRoute(dim) === route);
}

export function resolvePathTarget(urlParts: string[]): PathPageTarget {
	if (urlParts.length === 0) return { kind: "home" };

	const first = urlParts[0];
	const second = urlParts[1];
	const section = getSectionIndexMap().get(first);

	if (section) {
		if (urlParts.length === 1) return { kind: "section-index", section };

		if (urlParts.length === 2) {
			const sectionDocument = listFolderDocuments(section.slug)
				.find((document) => document.frontmatter.slug === second);

			if (sectionDocument?.frontmatter.layout === "showpiece") {
				return { kind: "section-detail", section, id: second };
			}

			if (sectionDocument?.frontmatter.layout === "post") {
				return { kind: "post-detail", slug: second };
			}

			if (section.layout === "card") {
				return { kind: "section-detail", section, id: second };
			}

			if (section.layout === "list" || section.layout === "feed") {
				return { kind: "post-detail", slug: second };
			}
		}
	}

	const dimension = findDimensionByRoute(first);
	if (dimension) {
		if (urlParts.length === 1) return { kind: "dimension-index", dimension };
		if (urlParts.length === 2) {
			return { kind: "dimension-detail", dimension, itemId: second };
		}
	}

	if (first === CONTENT_ROUTE_SEGMENTS.catalog) {
		if (urlParts.length === 1) return { kind: "catalog" };
		if (urlParts.length === 2 && second === CONTENT_ROUTE_SEGMENTS.catalogGallery) {
			return { kind: "catalog-gallery" };
		}
		if (urlParts.length === 2 && second === CONTENT_ROUTE_SEGMENTS.catalogUncategorized) {
			return { kind: "catalog-uncategorized" };
		}
	}

	return { kind: "not-found" };
}

export function generatePathStaticParams() {
	const params: { path: string[] }[] = [];
	const sectionMap = getSectionIndexMap();

	for (const { slug, section } of listPostSlugs()) {
		params.push({ path: [section, slug] });
	}

	for (const [, meta] of sectionMap) {
		params.push({ path: [meta.route] });
		if (meta.layout === "card") {
			for (const slug of listFolderDocuments(meta.slug).map((document) => document.frontmatter.slug)) {
				params.push({ path: [meta.route, slug] });
			}
		}
	}

	for (const dim of getSiteConfig().dimensions) {
		if (!dim.postField) continue;
		const dimRoute = getDimRoute(dim);
		params.push({ path: [dimRoute] });
		for (const itemId of listDimensionItemIds(dim.postField)) {
			params.push({ path: [dimRoute, itemId] });
		}
	}

	params.push({ path: [CONTENT_ROUTE_SEGMENTS.catalog] });
	params.push({ path: [CONTENT_ROUTE_SEGMENTS.catalog, CONTENT_ROUTE_SEGMENTS.catalogGallery] });
	params.push({ path: [CONTENT_ROUTE_SEGMENTS.catalog, CONTENT_ROUTE_SEGMENTS.catalogUncategorized] });

	return params;
}

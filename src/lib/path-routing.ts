import type { CatalogDimension, DimensionPostField } from "@/lib/content-types";
import { CONTENT_ROUTE_SEGMENTS } from "@/lib/content-constants";
import { getDimensionRoute } from "@/lib/content-paths";
import { listDimensionItemIds, listPostSlugs } from "@/lib/content-repository";
import { listFolderDocuments } from "@/lib/folder-content";
import { discoverAllSections, getSiteConfig, type SectionMeta } from "@/lib/site-config";

export type PathPageTarget =
	| { kind: "home" }
	| { kind: "section-index"; section: SectionMeta }
	| { kind: "section-detail"; section: string; id: string }
	| { kind: "post-detail"; slug: string }
	| { kind: "dimension-index"; dimension: CatalogDimension }
	| { kind: "dimension-detail"; postField: DimensionPostField; itemId: string }
	| { kind: "catalog" }
	| { kind: "not-found" };

function getSectionIndexMap(): Map<string, SectionMeta> {
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
		if (urlParts.length === 2 && section.layout === "card") {
			return { kind: "section-detail", section: section.name, id: second };
		}
		if (urlParts.length === 2 && (section.layout === "list" || section.layout === "feed")) {
			return { kind: "post-detail", slug: second };
		}
	}

	const dimension = findDimensionByRoute(first);
	if (dimension) {
		if (urlParts.length === 1) return { kind: "dimension-index", dimension };
		if (urlParts.length === 2 && dimension.postField) {
			return { kind: "dimension-detail", postField: dimension.postField, itemId: second };
		}
	}

	if (first === CONTENT_ROUTE_SEGMENTS.catalog && urlParts.length === 1) {
		return { kind: "catalog" };
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
			for (const slug of listFolderDocuments(meta.name).map((document) => document.slug)) {
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

	return params;
}

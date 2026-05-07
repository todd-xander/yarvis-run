import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
	Badge,
	BadgeType,
	CatalogDimension,
	ContentFrontmatter,
	LayoutType,
	MenuGroup,
	MenuItem,
	MetaItem,
	PaginationConfig,
	SortConfig,
} from "@/lib/content-types";

function isLayoutType(value: unknown): value is LayoutType {
	return value === "post"
		|| value === "feed"
		|| value === "list"
		|| value === "card"
		|| value === "catalog"
		|| value === "showpiece";
}

function getString(value: unknown): string | undefined {
	if (typeof value !== "string") return undefined;
	const trimmed = value.trim();
	return trimmed || undefined;
}

function getDisplayText(value: unknown): string | undefined {
	if (typeof value === "string") {
		const trimmed = value.trim();
		return trimmed || undefined;
	}
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	return undefined;
}

function parseBadge(value: unknown): Badge | undefined {
	const label = getDisplayText(value);
	if (label) return { label };

	if (!value || typeof value !== "object") return undefined;

	const candidate = value as { label?: unknown; type?: unknown; icon?: unknown };
	const parsedLabel = getDisplayText(candidate.label);
	if (!parsedLabel) return undefined;

	const type =
		candidate.type === "neutral" ||
			candidate.type === "success" ||
			candidate.type === "warning" ||
			candidate.type === "danger"
			? (candidate.type as BadgeType)
			: undefined;

	return {
		label: parsedLabel,
		type,
		icon: getString(candidate.icon),
	};
}

function parseMetaItem(value: unknown): MetaItem | undefined {
	if (!value || typeof value !== "object") return undefined;

	const candidate = value as { label?: unknown; value?: unknown; icon?: unknown };
	const label = getDisplayText(candidate.label);
	const metaValue = getDisplayText(candidate.value);
	if (!label || !metaValue) return undefined;

	return {
		label,
		value: metaValue,
		icon: getString(candidate.icon),
	};
}

function parseSortConfig(raw: unknown): SortConfig | undefined {
	if (!raw || typeof raw !== "object") return undefined;
	const candidate = raw as { key?: unknown; order?: unknown };
	const key = getString(candidate.key);
	if (!key) return undefined;
	return {
		key,
		order: candidate.order === "ascend" ? "ascend" : "descend",
	};
}

function parsePaginationConfig(raw: unknown): PaginationConfig | undefined {
	if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
		return { pageSize: Math.floor(raw) };
	}
	if (!raw || typeof raw !== "object") return undefined;
	const candidate = raw as { pageSize?: unknown };
	const pageSize = typeof candidate.pageSize === "number" && Number.isFinite(candidate.pageSize)
		? Math.floor(candidate.pageSize)
		: undefined;
	if (!pageSize || pageSize <= 0) return undefined;
	return { pageSize };
}

function parseCatalogDimension(raw: unknown): CatalogDimension | undefined {
	if (!raw || typeof raw !== "object") return undefined;
	const candidate = raw as Record<string, unknown>;
	const label = getString(candidate.label);
	const postField = getString(candidate.postField);
	if (!label || !postField) return undefined;
	return {
		label,
		postField,
		dir: getString(candidate.dir),
		display: candidate.display === "pill" ? "pill" : "list",
	};
}

export function normalizeDimensions(raw: unknown): CatalogDimension[] | undefined {
	if (!Array.isArray(raw) || raw.length === 0) return undefined;
	const dimensions = raw
		.map(parseCatalogDimension)
		.filter((dimension): dimension is CatalogDimension => dimension !== undefined);
	return dimensions.length > 0 ? dimensions : undefined;
}

export function parseMenuItems(raw: unknown): MenuItem[] | undefined {
	if (!Array.isArray(raw) || raw.length === 0) return undefined;
	const items = raw
		.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && !("items" in item) && !("group" in item))
		.map((item) => ({
			key: getString(item.key),
			label: (item.label as string) || "",
			href: (item.href as string) || "",
			icon: getString(item.icon),
			matchPrefixes: Array.isArray(item.matchPrefixes) ? item.matchPrefixes as string[] : undefined,
		}))
		.filter((item) => item.label);
	return items.length > 0 ? items : undefined;
}

export function parseMenuGroups(raw: unknown): MenuGroup[] | undefined {
	if (!Array.isArray(raw) || raw.length === 0) return undefined;
	const groups = raw
		.filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null && ("items" in item || "group" in item))
		.map((group) => ({
			group: (group.group as string) || "",
			items: (Array.isArray(group.items) ? group.items : [])
				.filter((item): item is Record<string, unknown> => typeof item === "object")
				.map((item) => ({
					label: (item.label as string) || "",
					href: (item.href as string) || "",
					icon: getString(item.icon),
					matchPrefixes: Array.isArray(item.matchPrefixes) ? item.matchPrefixes as string[] : undefined,
				})),
		}))
		.filter((g) => g.items.length > 0);
	return groups.length > 0 ? groups : undefined;
}

export function parseContent(filePath: string): { frontmatter: ContentFrontmatter; body: string } {
	let actualPath = filePath;
	let inferredSlug = "";
	if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
		inferredSlug = path.basename(filePath);
		actualPath = path.join(filePath, "index.md");
	} else if (filePath.endsWith("/index.md") || filePath.endsWith("\\index.md")) {
		inferredSlug = path.basename(path.dirname(filePath));
	}

	const source = fs.readFileSync(actualPath, "utf8");
	const { data, content } = matter(source);
	const raw = data as Record<string, unknown>;

	const slug = getString(raw.slug) || inferredSlug;
	const title = getString(raw.title) || getString(raw.name) || slug;

	let publishedAt: Date;
	if (raw.date) {
		publishedAt = new Date(raw.date as string);
	} else {
		const stat = fs.statSync(actualPath);
		publishedAt = stat.birthtime;
	}

	const layout = isLayoutType(raw.layout) ? raw.layout : "post";

	const base = {
		title,
		slug,
		publishedAt,
		cover: getString(raw.cover),
		description: getString(raw.description),
		tags: Array.isArray(raw.tags) ? raw.tags as string[] : undefined,
		avatar: getString(raw.avatar),
		location: getString(raw.location),
		coverGradient: getString(raw.coverGradient),
		route: getString(raw.route),
	};

	let frontmatter: ContentFrontmatter;

	switch (layout) {
		case "feed":
			frontmatter = { ...base, layout: "feed", sort: parseSortConfig(raw.sort), pagination: parsePaginationConfig(raw.pagination) };
			break;
		case "list":
			frontmatter = { ...base, layout: "list", sort: parseSortConfig(raw.sort), pagination: parsePaginationConfig(raw.pagination) };
			break;
		case "card":
			frontmatter = { ...base, layout: "card", sort: parseSortConfig(raw.sort), pagination: parsePaginationConfig(raw.pagination) };
			break;
		case "catalog":
			frontmatter = {
				...base,
				layout: "catalog",
				sort: parseSortConfig(raw.sort),
				pagination: parsePaginationConfig(raw.pagination),
				dimensions: normalizeDimensions(raw.dimensions),
			};
			break;
		case "showpiece": {
			const badges = Array.isArray(raw.badge)
				? raw.badge.map(parseBadge).filter((b): b is Badge => b !== undefined)
				: undefined;
			const meta = Array.isArray(raw.meta)
				? raw.meta.map(parseMetaItem).filter((m): m is MetaItem => m !== undefined)
				: undefined;
			frontmatter = {
				...base,
				layout: "showpiece",
				description: getString(raw.description),
				author: getString(raw.author),
				category: getString(raw.category),
				badge: badges?.length ? badges : undefined,
				meta: meta?.length ? meta : undefined,
			};
			break;
		}
		case "post":
			frontmatter = {
				...base,
				layout: "post",
				author: getString(raw.author),
				category: getString(raw.category),
			};
			break;
	}

	return {
		frontmatter,
		body: content.trim(),
	};
}

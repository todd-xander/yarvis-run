import "server-only";

import fs from "node:fs";
import matter from "gray-matter";
import path from "node:path";
import type {
	CatalogDimension,
	ListlikeLayout,
	MenuGroup,
	MenuItem,
	SiteConfig,
	SortConfig,
	PaginationConfig,
} from "@/lib/content-types";
import {
	APP_COPYRIGHT,
	APP_DESCRIPTION,
	APP_NAME,
	DEFAULT_CONTENT_ROOT_CANDIDATES,
	DEFAULT_MENU,
} from "@/lib/app-config";
import {
	getContentUrlPrefix as buildContentUrlPrefix,
	resolveContentUrl as buildResolveContentUrl,
	getContentRootIndexPath,
	getDimensionRoute,
	getSectionIndexPath,
} from "@/lib/content-paths";
import { normalizeDimensions, parseContent, parseMenuGroups, parseMenuItems } from "@/lib/parse-frontmatter";

function resolveContentRoot() {
	const configuredRoot = process.env.CONTENT_ROOT?.trim();
	if (configuredRoot) {
		return path.isAbsolute(configuredRoot)
			? configuredRoot
			: path.join(process.cwd(), configuredRoot);
	}

	for (const candidate of DEFAULT_CONTENT_ROOT_CANDIDATES) {
		const candidateRoot = path.join(process.cwd(), candidate);
		if (fs.existsSync(candidateRoot)) return candidateRoot;
	}

	return path.join(process.cwd(), DEFAULT_CONTENT_ROOT_CANDIDATES[0] || "");
}

export const CONTENT_ROOT = resolveContentRoot();
const CONTENT_URL_PREFIX = buildContentUrlPrefix(CONTENT_ROOT);

export function getContentUrlPrefix(): string {
	return CONTENT_URL_PREFIX;
}

export function resolveContentUrl(relPath: string): string {
	return buildResolveContentUrl(CONTENT_ROOT, relPath);
}
const shouldCacheContent = process.env.NODE_ENV === "production";

export type SectionEntry = {
	slug: string;
	route: string;
	layout: ListlikeLayout;
	title: string;
	description?: string;
	cover?: string;
	sort?: SortConfig;
	pagination?: PaginationConfig;
	dimensions?: CatalogDimension[];
};

let cachedConfig: SiteConfig | undefined;
let cachedSections: SectionEntry[] | undefined;

function isSectionLayout(layout: string): layout is ListlikeLayout {
	return layout === "feed" || layout === "list" || layout === "card" || layout === "catalog";
}

function loadSiteConfig(): SiteConfig {
	const mergeMenu = (defaults: MenuItem[], configured: MenuItem[]): MenuItem[] => {
		const defaultsByKey = new Map<string, MenuItem>();
		for (const item of defaults) {
			if (item.key) defaultsByKey.set(item.key, { ...item });
		}
		const result: MenuItem[] = [];
		const usedKeys = new Set<string>();
		for (const item of configured) {
			if (item.key && defaultsByKey.has(item.key)) {
				result.push({ ...defaultsByKey.get(item.key), ...item });
				usedKeys.add(item.key);
			} else {
				result.push({ ...item });
				if (item.key) usedKeys.add(item.key);
			}
		}
		for (const item of defaults) {
			if (item.key && !usedKeys.has(item.key)) {
				result.push({ ...item });
			}
		}
		return result;
	};

	const load = () => {
		const indexPath = getContentRootIndexPath(CONTENT_ROOT);
		if (!fs.existsSync(indexPath)) return {
			copyright: APP_COPYRIGHT,
			title: APP_NAME,
			description: APP_DESCRIPTION,
			nav: DEFAULT_MENU,
			menus: [],
			dimensions: [],
		};
		const source = fs.readFileSync(indexPath, "utf8");
		const { data } = matter(source);
		const raw = data as Record<string, unknown>;
		const configuredNav = parseMenuItems(raw.nav) || [];
		const dimensions = normalizeDimensions(raw.dimensions) || [];
		const menus = parseMenuGroups(raw.menus) || [];
		return {
			title: (raw.title as string) || APP_NAME,
			description: (raw.description as string) || "",
			cover: (raw.cover as string) || undefined,
			nav: mergeMenu(DEFAULT_MENU, configuredNav),
			menus,
			dimensions,
		};
	};

	if (!shouldCacheContent) return load();
	if (!cachedConfig) cachedConfig = load();
	return cachedConfig;
}

export function getSiteConfig() {
	return loadSiteConfig();
}


export function getMoreMenu(): MenuGroup[] {
	return loadSiteConfig().menus;
}

export function getMenuLabel(key: string, fallback?: string): string {
	const menuItem = loadSiteConfig().nav.find((item) => item.key === key);
	return menuItem?.label || fallback || key;
}

function loadAllSections(): SectionEntry[] {
	if (!fs.existsSync(CONTENT_ROOT)) return [];

	return fs
		.readdirSync(CONTENT_ROOT, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.map((entry): SectionEntry | undefined => {
			const indexPath = getSectionIndexPath(CONTENT_ROOT, entry.name);
			if (!fs.existsSync(indexPath)) return undefined;
			const fm = parseContent(indexPath).frontmatter;
			if (!isSectionLayout(fm.layout)) return undefined;

			const section: SectionEntry = {
				slug: entry.name,
				route: entry.name,
				layout: fm.layout,
				title: fm.title || entry.name,
				description: fm.description || undefined,
				cover: fm.cover || undefined,
				sort: fm.layout === "card" || fm.layout === "list" || fm.layout === "feed" ? fm.sort : undefined,
				pagination: fm.layout === "card" || fm.layout === "feed" || fm.layout === "list" ? fm.pagination : undefined,
				dimensions: fm.layout === "catalog" ? fm.dimensions : undefined,
			};
			return section;
		})
		.filter((section): section is SectionEntry => section !== undefined);
}

export function discoverAllSections(): SectionEntry[] {
	if (!shouldCacheContent) return loadAllSections();
	if (!cachedSections) cachedSections = loadAllSections();
	return cachedSections;
}

export function getDimensionRoutesMap(): Record<string, string> {
	const result: Record<string, string> = {};
	for (const dimension of getSiteConfig().dimensions) {
		if (dimension.postField) {
			result[dimension.postField] = getDimensionRoute(dimension);
		}
	}
	return result;
}

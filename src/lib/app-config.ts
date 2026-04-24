import type { CatalogDimension, MenuItem } from "@/lib/content-types";

export const APP_NAME = "Yarvis";
export const APP_DESCRIPTION = "Yet another rather very intelligent system";
export const APP_COPYRIGHT = "Yarvis";
export const THEME_STORAGE_KEY = "jike-blog-theme-mode";

export const DEFAULT_CONTENT_ROOT_CANDIDATES = ["content"] as const;

export const DEFAULT_MENU: MenuItem[] = [
	{ key: "home", label: "主页", href: "/", icon: "home-5" },
	{ key: "search", label: "搜索", href: "/search", icon: "search" },
	{ key: "catalog", label: "目录", href: "/catalog", icon: "book-2" },
	{ key: "more", label: "更多", href: "/more", icon: "more" },
];

export const DEFAULT_CATALOG_DIMENSIONS: CatalogDimension[] = [
	{ label: "作者", postField: "author", display: "list" },
	{ label: "分类", postField: "category", display: "list" },
];
